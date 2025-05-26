import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Contact = {
  name: string;
  phone: string;
};

interface BlastState {
  contacts: Contact[];
  selectedContacts: string[];
  message: string;
  userId: string;
  qrCodeUrl: string;
  connectionStatus: "Connect" | "Loading..." | "Disconnect";
  messageStatus: "success" | "loading" | "error" | "";
  contactStatus: "success" | "loading" | "error" | "";
  composeMessageStatus: "success" | "loading" | "error" | "";
  title: string;

  setTitle: (title: string) => void;
  setContactStatus: (status: "success" | "loading" | "error" | "") => void;
  setContacts: (contacts: Contact[]) => void;
  // addContact: (name: string, phone: string) => void;
  selectContact: (phone: string) => void;
  setMessage: (message: string) => void;
  setConnectionStatus: (status: "Connect" | "Loading..." | "Disconnect") => void;
  setMessageStatus: (status: "success" | "loading" | "error" | "") => void;
  connectUser: (userEmail: string) => Promise<boolean | undefined>;
  disconnectUser: (userEmail: string) => Promise<boolean | undefined>;
  logActivity: (userEmail: string, action: string) => Promise<void>;
  sendMessage: (userEmail: string) => Promise<boolean | undefined>;
  scrapeContacts: (userEmail: string) => Promise<void>;
  composeMessage: (goal: string, userEmail: string) => Promise<void>;
  clearStorage: () => void;
  addContactToDB: (agentPhone: string, name: string, phone: string, userEmail2: string) => Promise<void>;
  deleteContactFromDB: (agentPhone: string, phone: string, userEmail: string) => Promise<void>;
}

export const useBlastStore = create<BlastState>()(
  persist(
    (set, get) => ({
      contacts: [],
      selectedContacts: [],
      message: "",
      userId: "",
      qrCodeUrl: "",
      connectionStatus: "Connect",
      messageStatus: "",
      contactStatus: "",
      composeMessageStatus: "",
      title: "",

      setTitle: (title) => set({ title }),
      setContactStatus: (status) => set({ contactStatus: status }),
      setContacts: (contacts) => set({ contacts }),

      // addContact: (name, phone) =>
      //   set((state) => ({
      //     contacts: [...state.contacts, { name, phone }],
      //   })),

      selectContact: (phone) =>
        set((state) => {
          const isSelected = state.selectedContacts.includes(phone);
          return {
            selectedContacts: isSelected ? state.selectedContacts.filter((p) => p !== phone) : [...state.selectedContacts, phone],
          };
        }),
      setMessage: (message) => set({ message }),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setMessageStatus: (status) => set({ messageStatus: status }),
      connectUser: async (userEmail) => {
        set({ connectionStatus: "Loading..." });
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connect-user`);

          set({
            userId: response.data.userId,
            qrCodeUrl: response.data.qrCodeUrl,
          });

          console.log(`✅ Registered ${get().userId}`);
          set({ connectionStatus: "Disconnect" });
          await get().logActivity(userEmail, "session connected");
          return true;
        } catch (error) {
          set({ connectionStatus: "Connect" });
          console.error("❌ connectUser error:", error);
          return false;
        }
      },
      disconnectUser: async (userEmail) => {
        const { userId } = get();

        if (!userId) {
          console.warn("❗ No userId to disconnect.");
          return false;
        }
        set({ connectionStatus: "Loading..." });

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/disconnect-user`, {
            userId,
          });

          if (response.status === 200) {
            set({
              userId: "",
              qrCodeUrl: "",
              message: "",
              selectedContacts: [],
            });

            console.log("✅ User disconnected and state cleaned.");
            set({ connectionStatus: "Connect" });
            await get().logActivity(userEmail, "session disconnected");
            return true;
          } else {
            console.warn("⚠️ Unexpected response:", response.data);
            set({ connectionStatus: "Connect" });
            return false;
          }
        } catch (error) {
          set({ connectionStatus: "Connect" });
          console.error("❌ disconnectUser error:", error);
          return false;
        }
      },
      logActivity: async (userEmail: string, action: string) => {
        if (!userEmail || !action) {
          console.warn("❗ logActivity: Missing userEmail or action");
          return;
        }

        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/update-activity`, {
            userEmail,
            action,
          });

          console.log(`📘 Activity logged: ${action} for ${userEmail}`);
        } catch (error) {
          console.error("❌ Error logging activity:", error);
        }
      },
      sendMessage: async (userEmail) => {
        const { userId, message, selectedContacts, title } = get();

        if (!userId || !message || selectedContacts.length === 0 || !title) {
          console.warn("❗ Missing userId, message, or selected contacts, or title");
          alert("Please ensure you have selected contacts, entered a message, and provided a title.");
          return;
        }
        set({ messageStatus: "loading" });

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/send-message`, {
            userId,
            phoneNumbers: selectedContacts,
            message,
            userEmail,
            title,
          });

          console.log("✅ Message sent:", response.data);
          set({
            message: "",
            selectedContacts: [],
            messageStatus: "success",
          });

          await get().logActivity(userEmail, "blast sent");

          // Clear status after 15 seconds
          setTimeout(() => {
            set({ messageStatus: "" });
          }, 15000);

          return true;
        } catch (error) {
          set({ messageStatus: "error" });
          console.error("❌ sendMessage error:", error);
          return false;
        }
      },
      scrapeContacts: async (userEmail) => {
        const { userId, contacts: existingContacts } = get();
        if (!userId) {
          console.warn("❗ Cannot scrape contacts — no userId");
          return;
        }
        set({ contactStatus: "loading" });
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/scrape-contacts`, {
            userId,
          });

          const phoneNumbers: string[] = response.data.phoneNumbers || [];

          // Filter out duplicates based on phone number
          const existingPhones = new Set(existingContacts.map((c) => c.phone));
          const newContacts = phoneNumbers.filter((number) => !existingPhones.has(number)).map((number) => ({ name: number, phone: number }));

          const combinedContacts = [...existingContacts, ...newContacts];

          set({ contacts: combinedContacts, contactStatus: "success" });

          console.log(`✅ Added ${newContacts.length} new contacts (Total: ${combinedContacts.length})`);

          await get().logActivity(userEmail, "contacts scraped");

          // Reset status after 15 seconds
          setTimeout(() => {
            set({ contactStatus: "" });
          }, 15000);
        } catch (error) {
          set({ contactStatus: "error" });
          console.error("❌ scrapeContacts error:", error);
        }
      },
      composeMessage: async (goal: string, userEmail) => {
        if (!goal || userEmail === "") {
          console.warn("❗ Goal is required to compose a message.");
          return;
        }
        set({ composeMessageStatus: "loading" });

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/message-composer/generate`, {
            goal,
          });

          const composedMessage = response.data.message;
          set({ message: composedMessage, composeMessageStatus: "success" });

          await get().logActivity(userEmail, "message composed");

          setTimeout(() => {
            set({ composeMessageStatus: "" });
          }, 15000);
          console.log("✉️ Message composed and set.");
        } catch (error) {
          set({ composeMessageStatus: "error" });
          console.error("❌ composeMessage error:", error);
        }
      },
      clearStorage: () =>
        set({
          contacts: [],
          selectedContacts: [],
          message: "",
          userId: "",
          qrCodeUrl: "",
          connectionStatus: "Connect",
          messageStatus: "",
          contactStatus: "",
          composeMessageStatus: "",
        }),

      addContactToDB: async (userEmail, name, phone, userEmail2) => {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/add-contact/${userEmail}`, { name, phone });
          console.log(response);
          set((state) => ({ contacts: [...state.contacts, response.data.forntendContact] }));
          console.log(`✅ ${name || "Unnamed Contact"} (${phone}) has been added successfully!`);
          await get().logActivity(userEmail2, "contact added");
        } catch (error) {
          console.error("❌ Error adding contact to DB:", error);
        }
      },

      deleteContactFromDB: async (agentPhone, phone, userEmail) => {
        try {
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/delete-contact/${agentPhone}/${phone}`);
          set((state) => ({ contacts: state.contacts.filter((c) => c.phone !== phone) }));
          console.log(`🗑️ Contact (${phone}) has been deleted successfully!`);
          await get().logActivity(userEmail, "contact deleted");
        } catch (error) {
          console.error("❌ Error deleting contact from DB:", error);
        }
      },
    }),
    {
      name: "blast-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
