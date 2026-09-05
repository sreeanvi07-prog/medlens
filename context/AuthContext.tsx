"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoaded: boolean;
  login: (email: string, name?: string, role?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "medlens_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage on initial load
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      // localStorage restricted or parsing failed
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Route protection guard
  useEffect(() => {
    if (!isLoaded) return;

    const isPublicRoute = pathname === "/" || pathname === "/login";

    if (!user && !isPublicRoute) {
      // Unauthenticated user trying to access protected route -> redirect to sign-in
      router.replace("/");
    } else if (user && pathname === "/") {
      // Authenticated user on sign-in page -> redirect to dashboard
      router.replace("/dashboard");
    }
  }, [user, isLoaded, pathname, router]);

  const login = (email: string, name?: string, role?: string) => {
    const formattedName = name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));
    const initials = formattedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "MD";

    const session: UserSession = {
      id: `usr-${Date.now().toString(36)}`,
      name: formattedName,
      email,
      role: role || "Clinical Physician",
      avatarInitials: initials,
    };

    setUser(session);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // localStorage unavailable
    }
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, login, logout }}>
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
