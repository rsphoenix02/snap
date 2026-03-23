"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  tier: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // Silent refresh on mount
  useEffect(() => {
    const tryRefresh = async () => {
      const res = await apiFetch<{ access_token: string }>("/api/auth/refresh", {
        method: "POST",
      });
      if (res.data?.access_token) {
        const meRes = await apiFetch<User>("/api/auth/me", {
          token: res.data.access_token,
        });
        setState({
          user: meRes.data ?? null,
          accessToken: res.data.access_token,
          isLoading: false,
        });
      } else {
        setState({ user: null, accessToken: null, isLoading: false });
      }
    };
    tryRefresh();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await apiFetch<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.error) return res.error;
    setState({
      user: res.data?.user ?? null,
      accessToken: res.data?.access_token ?? null,
      isLoading: false,
    });
    return null;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const res = await apiFetch<{ access_token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    if (res.error) return res.error;
    setState({
      user: res.data?.user ?? null,
      accessToken: res.data?.access_token ?? null,
      isLoading: false,
    });
    return null;
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, accessToken: null, isLoading: false });
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ ...state, login, signup, logout }),
    [state, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
