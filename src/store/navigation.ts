import { create } from "zustand";

type NavigationStore = {
  loadingToPath: string | null;
  setLoadingToPath: (path: string | null) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  loadingToPath: null,
  setLoadingToPath: (path) => set({ loadingToPath: path }),
}));
