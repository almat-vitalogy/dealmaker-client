import axios from "axios";
import { toast } from "sonner";
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
  overlayVisible: boolean;
  connectionStatus: "Connect" | "Loading..." | "Disconnect";
  messageStatus: "success" | "loading" | "error" | "";
  contactStatus: "success" | "loading" | "error" | "";
  groupContactStatus: "success" | "loading" | "error" | "";
  composeMessageStatus: "success" | "loading" | "error" | "";
  title: string;
  userEmail: string;
  labels: Label[];
  labelStatus: LabelStatus;
  activeLabel: string;

  massAssignLabel: (contactIds: string[], labelName: string, labelId: string, userEmail: string) => Promise<void>;
  massDeassignLabel: (contactIds: string[], labelName: string, labelId: string, userEmail: string) => Promise<void>;
  setActiveLabel: (labelId: string) => void;
  setLabels: (labels: Label[]) => void;
  setLabelStatus: (status: LabelStatus) => void;
  getLabels: (userEmail: string) => Promise<void>;
  createLabel: (name: string, color: string, userEmail: string) => Promise<void>;
  deleteLabel: (labelId: string, userEmail: string) => Promise<void>;
  toggleLabel: (contactId: string, labelId: string, userEmail: string) => Promise<void>;
  setUserEmail: (userEmail: string) => void;
  setTitle: (title: string) => void;
  setOverlayVisible: (visible: boolean) => void;
  setContactStatus: (status: "success" | "loading" | "error" | "") => void;
  setGroupContactStatus: (status: "success" | "loading" | "error" | "") => void;
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
  crawlGroup: (groupName: string, userEmail2: string) => Promise<void>;
  composeMessage: (goal: string, userEmail: string) => Promise<void>;
  clearStorage: () => void;
  addContactToDB: (agentPhone: string, name: string, phone: string, userEmail2: string, massAction: boolean) => Promise<void>;
  deleteContactFromDB: (agentPhone: string, phone: string, userEmail: string, massAction: boolean) => Promise<void>;
  massDeleteContacts: (userEmail: string, phoneNumbers: string[]) => Promise<void>;
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
      groupContactStatus: "",
      composeMessageStatus: "",
      title: "",
      userEmail: "",
      labels: [],
      labelStatus: "",
      activeLabel: "",
      overlayVisible: false,

      massAssignLabel: async (contactIds, labelName, labelId, userEmail) => {
        if (!Array.isArray(contactIds) || !contactIds.length || !labelId) return;

        /* 0️⃣ snapshot current state for rollback */
        const { contacts: prevContacts, labels: prevLabels } = get();

        /* 1️⃣ optimistic local update */
        set((state) => {
          const contacts = state.contacts.map((c) =>
            contactIds.includes(c._id) && !c.labels.includes(labelId) ? { ...c, labels: [...c.labels, labelId] } : c
          );

          const labels = state.labels.map((lbl) =>
            lbl._id === labelId
              ? { ...lbl, contactIds: Array.from(new Set([...lbl.contactIds, ...contactIds])) }
              : lbl
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
          await get().logActivity(userEmail, `mass-assigned label ${labelName} to ${contactIds.length} contacts`);
        } catch (err) {
          console.error("❌ massAssignLabel:", err);
          toast.error("Failed. Please try again.");
          /* 3️⃣ rollback */
          set({ contacts: prevContacts, labels: prevLabels });
        }
      },

      

      massDeassignLabel: async (contactIds, labelName, labelId, userEmail) => {
        if (!Array.isArray(contactIds) || !contactIds.length || !labelId) return;

        /* 0️⃣ snapshot current state for rollback */
        const { contacts: prevContacts, labels: prevLabels } = get();

        /* 1️⃣ optimistic local update */
        set((state) => {
          const contacts = state.contacts.map((c) =>
            contactIds.includes(c._id) ? { ...c, labels: c.labels.filter((id) => id !== labelId) } : c
          );

          const labels = state.labels.map((lbl) =>
            lbl._id === labelId
              ? { ...lbl, contactIds: lbl.contactIds.filter((id) => !contactIds.includes(id)) }
              : lbl
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
          await get().logActivity(userEmail, `mass-deassigned label ${labelName} from ${contactIds.length} contacts`);
        } catch (err) {
          console.error("❌ massDeassignLabel:", err);
          toast.error("Failed to deassign label.");
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
      setGroupContactStatus: (groupStatus) => set({ groupContactStatus: groupStatus }),
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
      setOverlayVisible: (visible) => set({ overlayVisible: visible }),

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
          
          //remove labelIds from contacts on deleting label
          const labelToDelete = get().labels.find((l) => l._id === labelId);
          const contactIds = labelToDelete?.contactIds || [];

          await Promise.all(
            contactIds.map((contactId) =>
              axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/toggle-label`, {
                contactId,
                labelId,
                userEmail,
              })
            )
          );

          //updating state
          set((state) => {
            const labels = state.labels.filter((l) => l._id !== labelId);

            const contacts = state.contacts.map((c) => {
              if (!contactIds.includes(c._id)) return c;
              return {
                ...c,
                labels: (c.labels || []).filter((id) => id !== labelId),
              };
            });

            return { labels, contacts, labelStatus: "success" };
          });
          //end of remove labelIds from contacts

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

          // await get().logActivity(userEmail, "label toggled");
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
          toast.error("Please ensure you have selected contacts, entered a message, and provided a title.");
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
          toast.error("Failed. Please try again.");
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
        set({ overlayVisible: true });
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/scrape-contacts`, {
            userId,
            userEmail,
          });

          if (data.success) {
            
            set((state) => ({
              contacts: [...state.contacts, ...data.contacts],
            }));
            
            set({ contactStatus: "success" });
            if(data.contacts.length !== 0) {
              await get().logActivity(userEmail, `contacts scraped & saved - ${data.contacts.length}`);
              toast.success(`${data.contacts.length} contact${data.contacts.length > 1 ? "s have" : " has"} been scraped and saved!`);
            } else {
              toast.info("No new contacts found.");
            }
          }
        } catch (error) {
          console.error("❌ scrapeContacts error:", error);
          toast.error("Failed. Please try again.");
          set({ contactStatus: "error" });
        } finally {
          set({ overlayVisible: false });
          setTimeout(() => set({ contactStatus: "" }), 5000);
        }
      },

      crawlGroup: async (groupName, userEmail2) => {
        const { userId, userEmail, logActivity } = get();

        if (!userId || !userEmail2 || !groupName) {
          console.warn("❗crawlGroup: Missing userId, groupName, or userEmail2");
          return;
        }

        set({ overlayVisible: true });
        set({ groupContactStatus: "loading" });
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/scrape-groups`, {
            userId,
            groupName,
            userEmail: userEmail2,
          });

          if (data.success) {
            // Flatten and merge the contacts list
            set((state) => ({
              contacts: [...state.contacts, ...data.contacts],
            }));

            set({ groupContactStatus: "success" });

            await logActivity(
              userEmail,
              `contacts scraped & saved from group: "${groupName}" - ${data.contacts.length}`
            );

            toast.success(`${data.contacts.length} contact${data.contacts.length !== 1 ? "s" : ""} saved from "${groupName}"`);
          }
        } catch (error) {
            console.error("❌ crawlGroup error:", error);
            toast.error(`Failed. Please try again.`);
        } finally {
          set({ overlayVisible: false });
          setTimeout(() => set({ groupContactStatus: "" }), 5000);
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
          toast.error("Failed. Please try again.");
        }
      },

      clearStorage: () => {
        // window.confirm(`Are you sure you want to logout?`);
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

      addContactToDB: async (userEmail, name, phone, userEmail2, massAction) => {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/add/${userEmail}`, {
            name,
            phone,
          });

          if (!response.data.contact){
            toast.info("Contact already exists.");
          } else {
            set((state) => ({ contacts: [...state.contacts, response.data.contact] }));
            console.log(`✅ ${name || "Unnamed Contact"} (${phone}) has been added successfully!`);
            if(!massAction) await get().logActivity(userEmail2, "contact added");
            toast.success(`${name} has been added successfully!`);
          }
        } catch (error) {
          console.error("❌ Error adding contact to DB:", error);
          toast.error("Failed. Please try again.");
        }
      },

      deleteContactFromDB: async (agentPhone, phone, userEmail, massAction) => {
        try {

          //remove contactIds from labels on deleting contact
          const contactToDelete = get().contacts.find((c) => c.phone === phone);
          const contactId = contactToDelete?._id || "";
          const labelIds = contactToDelete?.labels || [];

          await Promise.all(
            labelIds.map((labelId) =>
              axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/toggle-label`, {
                contactId,
                labelId,
                userEmail,
              })
            )
          );
          
          //updating state
          set((state) => {
            const labels = state.labels.map((lbl) => {
              if (!labelIds.includes(lbl._id)) return lbl;
              return {
                ...lbl,
                contactIds: lbl.contactIds.filter((id) => id !== contactId),
              };
            });

            const contacts = state.contacts
              .filter((c) => c.phone !== phone) // Remove the deleted contact
              .map((c) => {
                if (c._id !== contactId) return c;
                return {
                  ...c,
                  labels: [], // clear labels from deleted contact
                };
              });

            return { contacts, labels };
          });
          //end of removing contactIds from labels

          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/delete/${agentPhone}/${phone}`);
          set((state) => ({ contacts: state.contacts.filter((c) => c.phone !== phone) }));
          if (!massAction) await get().logActivity(userEmail, "contact deleted");
          console.log(`🗑️ Contact (${phone}) has been deleted successfully!`);
        } catch (error) {
          console.error("❌ Error deleting contact from DB:", error);
          toast.error("Failed to delete contact. Please try again.");
        }
      },

      massDeleteContacts: async (userEmail, phoneNumbers) => {
        if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) return;
        set({ overlayVisible: true });
        try {
          // Step 1: Get contacts to be deleted
          const contactsToDelete = get().contacts.filter((c) => phoneNumbers.includes(c.phone));
          const contactIds = contactsToDelete.map((c) => c._id);
          const labelIds = [...new Set(contactsToDelete.flatMap((c) => c.labels))];

          // Step 2: Remove contactIds from associated labels
          await Promise.all(
            labelIds.map((labelId) =>
              axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/mass-deassign-label`, {
                contactIds,
                labelId,
                userEmail,
              })
            )
          );

          // Step 3: Update state (labels and contacts)
          set((state) => {
            const labels = state.labels.map((lbl) => {
              if (!labelIds.includes(lbl._id)) return lbl;
              return {
                ...lbl,
                contactIds: lbl.contactIds.filter((id) => !contactIds.includes(id)),
              };
            });

            const contacts = state.contacts.filter((c) => !phoneNumbers.includes(c.phone));

            return { contacts, labels };
          });

          // Step 4: Call DELETE endpoint with body
          await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/mass-delete/${userEmail}`, {
            data: { phoneNumbers }, // important for DELETE requests with body
          });

          // Step 5: Clean up local state again to ensure sync
          set((state) => ({
            contacts: state.contacts.filter((c) => !phoneNumbers.includes(c.phone)),
          }));

          // Step 6: Log the activity
          await get().logActivity(userEmail, `contacts deleted successfully - ${phoneNumbers.length}`);
          console.log(`🗑️ ${phoneNumbers.length} contacts have been deleted successfully!`);
        } catch (error) {
          console.error("❌ Error mass deleting contacts:", error);
          toast.error("Failed. Please try again.");
        } finally {
          set({ overlayVisible: false });
        }
      },
    }),
    {
      name: "blast-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);