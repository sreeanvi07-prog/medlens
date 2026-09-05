"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, UserPlus, LogOut, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/session";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSignInPage = pathname === "/";

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DM";

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] || user.role) : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-500 transition-colors">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Med<span className="text-teal-400">Lens</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                  {user?.role === "evaluator"
                    ? "Synthetic demo workspace"
                    : "Demo workspace"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Clinical Provenance & Lab Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation Links (Visible when logged in) */}
          {user && !isSignInPage && (
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/patient/new"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === "/patient/new"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                New Intake
              </Link>
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {user && !isSignInPage ? (
            <>
              <Link
                href="/patient/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Intake</span>
              </Link>

              {/* User Session Profile & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-teal-400 line-clamp-1 font-medium">
                      {roleLabel}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign out of MedLens demo"
                  aria-label="Sign out of MedLens demo"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-medium text-[11px]">Demo access</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

