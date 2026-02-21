"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthSession } from "../types/index.types";

interface AuthStore {
  session: AuthSession | null;
  isLoading: boolean;
  setSession: (session: AuthSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearSession: () => void;
  updateAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      clearSession: () => set({ session: null }),
      updateAccessToken: (token) => {
        const { session } = get();
        if (session) set({ session: { ...session, accessToken: token } });
      },
    }),
    { name: "bikeservice-auth" }
  )
);
