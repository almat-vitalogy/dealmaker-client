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

  setContactStatus: (status: "success" | "loading" | "error" | "") => void;
  setContacts: (contacts: Contact[]) => void;
  addContact: (name: string, phone: string) => void;
  selectContact: (phone: string) => void;
  setMessage: (message: string) => void;
  setConnectionStatus: (status: "Connect" | "Loading..." | "Disconnect") => void;
  setMessageStatus: (status: "success" | "loading" | "error" | "") => void;
  connectUser: () => Promise<boolean | undefined>;
  disconnectUser: () => Promise<boolean | undefined>;
  sendMessage: () => Promise<boolean | undefined>;
  scrapeContacts: () => Promise<void>;
  clearStorage: () => void;
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

      setContactStatus: (status) => set({ contactStatus: status }),
      setContacts: (contacts) => set({ contacts }),
      addContact: (name, phone) =>
        set((state) => ({
          contacts: [...state.contacts, { name, phone }],
        })),
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
      connectUser: async () => {
        set({ connectionStatus: "Loading..." });
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connect-user`);

          set({
            userId: response.data.userId,
            qrCodeUrl: response.data.qrCodeUrl,
          });

          console.log(`✅ Registered ${get().userId}`);
          set({ connectionStatus: "Disconnect" });
          return true;
        } catch (error) {
          set({ connectionStatus: "Connect" });
          console.error("❌ connectUser error:", error);
          return false;
        }
      },
      disconnectUser: async () => {
        set({ connectionStatus: "Loading..." });
        const { userId } = get();

        if (!userId) {
          console.warn("❗ No userId to disconnect.");
          return false;
        }

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
      sendMessage: async () => {
        set({ messageStatus: "loading" });
        const { userId, message, selectedContacts } = get();

        if (!userId || !message || selectedContacts.length === 0) {
          console.warn("❗ Missing userId, message, or selected contacts");
          return;
        }

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/send-message`, {
            userId,
            phoneNumbers: selectedContacts,
            message,
          });

          console.log("✅ Message sent:", response.data);
          set({
            message: "",
            selectedContacts: [],
            messageStatus: "success",
          });

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
      scrapeContacts: async () => {
        set({ contactStatus: "loading" });
        const { userId, contacts: existingContacts } = get();
        if (!userId) {
          console.warn("❗ Cannot scrape contacts — no userId");
          return;
        }
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

          // Reset status after 15 seconds
          setTimeout(() => {
            set({ contactStatus: "" });
          }, 15000);
        } catch (error) {
          set({ contactStatus: "error" });
          console.error("❌ scrapeContacts error:", error);
        }
      },
      clearStorage: () =>
        set({
          contacts: [],
          message: "",
          userId: "",
          qrCodeUrl: "",
        }),
    }),
    {
      name: "blast-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
