import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Contact = {
  _id: string;
  name: string;
  phone: string;
  labels: string[];
};

type LabelStatus = "success" | "loading" | "error" | "";
type Label = {
  _id: string;
  name: string;
  color?: string;
  userEmail: string;
  contactIds: string[];
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
  userEmail: string;
  labels: Label[];
  labelStatus: LabelStatus;
  activeLabel: string;

  massAssignLabel: (contactIds: string[], labelId: string, userEmail: string) => Promise<void>;
  massDeassignLabel: (contactIds: string[], labelId: string, userEmail: string) => Promise<void>;
  setActiveLabel: (labelId: string) => void;
  setLabels: (labels: Label[]) => void;
  setLabelStatus: (status: LabelStatus) => void;
  getLabels: (userEmail: string) => Promise<void>;
  createLabel: (name: string, color: string, userEmail: string) => Promise<void>;
  deleteLabel: (labelId: string, userEmail: string) => Promise<void>;
  toggleLabel: (contactId: string, labelId: string, userEmail: string) => Promise<void>;
  setUserEmail: (userEmail: string) => void;
  setTitle: (title: string) => void;
  setContactStatus: (status: "success" | "loading" | "error" | "") => void;
  setContacts: (contacts: Contact[]) => void;
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
      userEmail: "",
      labels: [],
      labelStatus: "",
      activeLabel: "",

      massAssignLabel: async (contactIds, labelId, userEmail) => {
        if (!Array.isArray(contactIds) || !contactIds.length || !labelId) return;

        /* 0️⃣ snapshot current state for rollback */
        const { contacts: prevContacts, labels: prevLabels } = get();

        /* 1️⃣ optimistic local update */
        set((state) => {
          const contacts = state.contacts.map((c) =>
            contactIds.includes(c._id) && !c.labels.includes(labelId) ? { ...c, labels: [...c.labels, labelId] } : c
          );

          const labels = state.labels.map((lbl) =>
            lbl._id === labelId ? { ...lbl, contactIds: Array.from(new Set([...lbl.contactIds, ...contactIds])) } : lbl
          );

          return { contacts, labels };
        });

        /* 2️⃣ API call */
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/mass-assign-label`, {
            contactIds,
            labelId,
            userEmail,
          });
          await get().logActivity(userEmail, `label ${labelId} mass-assigned to ${contactIds.length} contacts`);
        } catch (err) {
          console.error("❌ massAssignLabel:", err);
          /* 3️⃣ rollback */
          set({ contacts: prevContacts, labels: prevLabels });
        }
      },

      massDeassignLabel: async (contactIds, labelId, userEmail) => {
        if (!Array.isArray(contactIds) || !contactIds.length || !labelId) return;

        /* 0️⃣ snapshot current state for rollback */
        const { contacts: prevContacts, labels: prevLabels } = get();

        /* 1️⃣ optimistic local update */
        set((state) => {
          const contacts = state.contacts.map((c) =>
            contactIds.includes(c._id) ? { ...c, labels: c.labels.filter((id) => id !== labelId) } : c
          );

          const labels = state.labels.map((lbl) =>
            lbl._id === labelId ? { ...lbl, contactIds: lbl.contactIds.filter((id) => !contactIds.includes(id)) } : lbl
          );

          return { contacts, labels };
        });

        /* 2️⃣ API call */
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/mass-deassign-label`, {
            contactIds,
            labelId,
            userEmail,
          });
          await get().logActivity(userEmail, `label ${labelId} mass-deassigned from ${contactIds.length} contacts`);
        } catch (err) {
          console.error("❌ massDeassignLabel:", err);
          /* 3️⃣ rollback */
          set({ contacts: prevContacts, labels: prevLabels });
        }
      },

      setActiveLabel: (labelId) => set({ activeLabel: labelId }),
      setLabels: (labels) => set({ labels }),
      setLabelStatus: (status) => set({ labelStatus: status }),
      setUserEmail: (userEmail) => {
        set({ userEmail: userEmail });
      },
      setTitle: (title) => set({ title }),
      setContactStatus: (status) => set({ contactStatus: status }),
      setContacts: (contacts) => set({ contacts }),

      selectContact: (phone) =>
        set((state) => {
          const isSelected = state.selectedContacts.includes(phone);
          return {
            selectedContacts: isSelected
              ? state.selectedContacts.filter((p) => p !== phone)
              : [...state.selectedContacts, phone],
          };
        }),

      setMessage: (message) => set({ message }),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setMessageStatus: (status) => set({ messageStatus: status }),

      getLabels: async (userEmail) => {
        if (!userEmail) return;
        set({ labelStatus: "loading" });
        try {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/get-labels`, {
            params: { userEmail },
          });
          set({ labels: data, labelStatus: "success" });
        } catch (err) {
          console.error("❌ getLabels:", err);
          set({ labelStatus: "error" });
        } finally {
          setTimeout(() => set({ labelStatus: "" }), 15000);
        }
      },

      createLabel: async (name, color = "#3b82f6", userEmail) => {
        if (!name || !userEmail) return;
        set({ labelStatus: "loading" });
        try {
          const { data: newLabel } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/create-label`, {
            name,
            color,
            userEmail,
          });
          set((s) => ({ labels: [...s.labels, newLabel], labelStatus: "success" }));
          await get().logActivity(userEmail, `label "${name}" created`);
        } catch (err) {
          console.error("❌ createLabel:", err);
          set({ labelStatus: "error" });
        } finally {
          setTimeout(() => set({ labelStatus: "" }), 15000);
        }
      },

      deleteLabel: async (labelId, userEmail) => {
        if (!labelId) return;
        set({ labelStatus: "loading" });
        try {
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/delete-label/${labelId}`);
          set((s) => ({
            labels: s.labels.filter((l) => l._id !== labelId),
            labelStatus: "success",
          }));
          await get().logActivity(userEmail, "label deleted");
        } catch (err) {
          console.error("❌ deleteLabel:", err);
          set({ labelStatus: "error" });
        } finally {
          setTimeout(() => set({ labelStatus: "" }), 15000);
        }
      },

      toggleLabel: async (contactId, labelId, userEmail) => {
        if (!contactId || !labelId) return;
        console.log(`Toggling label ${labelId} for contact ${contactId}`);
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/toggle-label`, {
            contactId,
            labelId,
            userEmail,
          });

          const mode = data.mode as "attached" | "detached";

          /* ── sync local state ──────────────────────────────── */
          set((state) => {
            /* update label.contactIds */
            const labels = state.labels.map((lbl) => {
              if (lbl._id !== labelId) return lbl;
              const hasContact = lbl.contactIds.includes(contactId);
              if (mode === "attached" && !hasContact) return { ...lbl, contactIds: [...lbl.contactIds, contactId] };
              if (mode === "detached") return { ...lbl, contactIds: lbl.contactIds.filter((id) => id !== contactId) };
              return lbl;
            });

            /* update contact.labels */
            const contacts = state.contacts.map((c) => {
              if (c._id !== contactId) return c;
              const hasLabel = (c.labels || []).includes(labelId);
              if (mode === "attached" && !hasLabel) return { ...c, labels: [...(c.labels || []), labelId] };
              if (mode === "detached") return { ...c, labels: c.labels.filter((id) => id !== labelId) };
              return c;
            });

            return { labels, contacts };
          });

          await get().logActivity(userEmail, "label toggled");
        } catch (err) {
          console.error("❌ toggleLabel:", err);
        }
      },

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
          // console.warn("❗ No userId to disconnect.");
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
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/update`, {
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
        const { userId } = get();
        if (!userId) {
          console.warn("❗ Cannot scrape contacts — no userId");
          return;
        }
        set({ contactStatus: "loading" });
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/scrape-contacts`, { userId });

          const phoneNumbers: string[] = data.phoneNumbers || [];

          for (const phone of new Set(phoneNumbers)) {
            if (!get().contacts.some((c) => c.phone === phone)) {
              await get().addContactToDB(userEmail, phone, phone, userEmail);
            }
          }

          set({ contactStatus: "success" });
          await get().logActivity(userEmail, "contacts scraped & saved");
        } catch (error) {
          console.error("❌ scrapeContacts error:", error);
          set({ contactStatus: "error" });
        } finally {
          setTimeout(() => set({ contactStatus: "" }), 15_000);
        }
      },

      composeMessage: async (goal: string, userEmail) => {
        if (!goal || userEmail === "") {
          console.warn("❗ Goal is required to compose a message.");
          return;
        }
        set({ composeMessageStatus: "loading" });

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/message-composer/generate`, {
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

      clearStorage: () => {
        window.confirm(`Are you sure you want to logout?`);
        get().disconnectUser(get().userEmail);
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
        });
      },

      addContactToDB: async (userEmail, name, phone, userEmail2) => {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/add/${userEmail}`, {
            name,
            phone,
          });
          console.log(response);
          set((state) => ({ contacts: [...state.contacts, response.data.contact] }));
          console.log(`✅ ${name || "Unnamed Contact"} (${phone}) has been added successfully!`);
          await get().logActivity(userEmail2, "contact added");
        } catch (error) {
          console.error("❌ Error adding contact to DB:", error);
        }
      },

      deleteContactFromDB: async (agentPhone, phone, userEmail) => {
        try {
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/delete/${agentPhone}/${phone}`);
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
