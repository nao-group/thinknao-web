import { create } from "zustand";

interface NavState {
  sessionName: string;
  setSessionName: (name: string) => void;
}

export const useNavStore = create<NavState>((set) => ({
  sessionName: "",
  setSessionName: (name) => set({ sessionName: name }),
}));
