import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("refresh_token");
          document.cookie = "auth_session=; path=/; max-age=0";
        }
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: "thinknao-auth",
      // Only persist user — access tokens must never go in localStorage
      partialize: (state) => ({ user: state.user }),
    }
  )
);
