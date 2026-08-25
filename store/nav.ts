import { create } from "zustand";

interface NavState {
  sessionName: string;
  setSessionName: (name: string) => void;
  /** Human-readable code for the saved problem being viewed (e.g. "MT-EF-0005-0000"),
   *  so the breadcrumb can show it instead of the question's UUID. */
  problemCode: string;
  setProblemCode: (code: string) => void;
}

export const useNavStore = create<NavState>((set) => ({
  sessionName: "",
  setSessionName: (name) => set({ sessionName: name }),
  problemCode: "",
  setProblemCode: (code) => set({ problemCode: code }),
}));
