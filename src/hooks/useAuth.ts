"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export function useAuth() {
  const router = useRouter();
  const { session, setSession, clearSession, isLoading, setLoading } = useAuthStore();

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/refresh", { method: "DELETE" });
    } catch {
      // ignore
    }
    clearSession();
    router.push("/login");
  }, [clearSession, router]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      const json = await res.json();
      if (json.success && session) {
        setSession({ ...session, accessToken: json.data.accessToken });
        return json.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }, [session, setSession]);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!session?.accessToken) throw new Error("Not authenticated");

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) { logout(); throw new Error("Session expired"); }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });
    }

    return res;
  }, [session, refreshAccessToken, logout]);

  return {
    session,
    isLoading,
    setLoading,
    logout,
    authFetch,
    isAuthenticated: !!session,
    role: session?.role,
    user: session?.user,
    captain: session?.captain,
  };
}
