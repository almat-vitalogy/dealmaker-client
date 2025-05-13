import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Contact = {
  name: string;
  phone: string;
  selected: boolean;
};

interface BlastState {
  contacts: Contact[];
  message: string;
  setContacts: (contacts: Contact[]) => void;
  addContact: (name: string, phone: string) => void;
  selectContact: (phone: string) => void;
  setMessage: (message: string) => void;
  clearStorage: () => void;
}

export const useBlastStore = create<BlastState>()(
  persist(
    (set) => ({
      contacts: [],
      message: "",
      setContacts: (contacts) => set({ contacts }),
      addContact: (name, phone) =>
        set((state) => ({
          contacts: [...state.contacts, { name, phone, selected: false }],
        })),
      selectContact: (phone) =>
        set((state) => ({
          contacts: state.contacts.map((contact) => (contact.phone === phone ? { ...contact, selected: !contact.selected } : contact)),
        })),
      setMessage: (message) => set({ message }),
      clearStorage: () => set({ contacts: [], message: "" }),
    }),
    {
      name: "blast-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
