"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "./types";

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function syncSession() {
      setToken(localStorage.getItem("voice-learning-token"));
      const rawUser = localStorage.getItem("voice-learning-user");
      setUser(rawUser ? (JSON.parse(rawUser) as User) : null);
      setHydrated(true);
    }
    syncSession();
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      hydrated,
      setSession: (nextToken, nextUser) => {
        localStorage.setItem("voice-learning-token", nextToken);
        localStorage.setItem("voice-learning-user", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
        setHydrated(true);
      },
      logout: () => {
        localStorage.removeItem("voice-learning-token");
        localStorage.removeItem("voice-learning-user");
        setToken(null);
        setUser(null);
        setHydrated(true);
      }
    }),
    [hydrated, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
