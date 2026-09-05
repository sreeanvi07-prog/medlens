"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  UserSession,
  DemoRole,
  getStoredSession,
  saveSession,
  clearStoredSession,
  createDemoSession,
} from "@/lib/session";

export type { UserSession, DemoRole };

interface AuthContextType {
  user: UserSession | null;
  isLoaded: boolean;
  login: (displayName: string, role: DemoRole) => void;
  loginAsEvaluator: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Read stored session on initial mount
    const stored = getStoredSession();
    if (stored) {
      setUser(stored);
    }
    setIsLoaded(true);
  }, []);

  // Route protection guard
  useEffect(() => {
    if (!isLoaded) return;

    const isPublicRoute = pathname === "/";

    if (!user && !isPublicRoute) {
      // Unauthenticated user trying to access protected route -> redirect to demo sign-in
      router.replace("/");
    } else if (user && isPublicRoute) {
      // Authenticated demo user on sign-in page -> redirect to dashboard
      router.replace("/dashboard");
    }
  }, [user, isLoaded, pathname, router]);

  const login = (displayName: string, role: DemoRole) => {
    const session = createDemoSession(displayName, role);
    setUser(session);
    saveSession(session);
    router.replace("/dashboard");
  };

  const loginAsEvaluator = () => {
    const session = createDemoSession("Evaluator Demo", "evaluator");
    setUser(session);
    saveSession(session);
    router.replace("/dashboard");
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(null, "", "/");
      } catch {
        // Fallback if history state fails
      }
    }
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoaded, login, loginAsEvaluator, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

