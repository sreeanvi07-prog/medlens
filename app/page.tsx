"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const { user, isLoaded, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoaded, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your clinical email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your access password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      login(email.trim(), undefined, "Clinical Physician");
    }, 400);
  };

  const handleDemoLogin = (demoName: string, demoEmail: string, demoRole: string) => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      login(demoEmail, demoName, demoRole);
    }, 300);
  };

  if (!isLoaded || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header with FLAT Logo Icon (No Gradient) */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-xs mx-auto">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Med<span className="text-teal-400">Lens</span>
            </h1>
            <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider mt-0.5">
              Clinical Provenance & Lab Intelligence
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Sign in to access patient records, deterministic lab extraction, and non-diagnostic clinical summaries.
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Clinical Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="physician@hospital.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 hover:text-slate-400 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                Quick Clinical Demo Sign-In
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDemoLogin(
                    "Dr. Sarah Jenkins",
                    "s.jenkins@medlens.org",
                    "Chief Medical Officer"
                  )
                }
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    SJ
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">
                      Dr. Sarah Jenkins
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Chief Medical Officer • Internal Medicine
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-teal-400 font-medium opacity-80 group-hover:opacity-100">
                  Select →
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDemoLogin(
                    "Marcus Lee",
                    "m.lee@medlens.org",
                    "Clinical Lab Operator"
                  )
                }
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-teal-300 flex items-center justify-center text-xs font-bold">
                    ML
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors">
                      Marcus Lee
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Clinical Lab Operator • Reference Verification
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-teal-400 font-medium opacity-80 group-hover:opacity-100">
                  Select →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Safety Note */}
        <div className="text-center space-y-1 text-[11px] text-slate-500">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Deterministic Reference Engine • HIPAA Demonstration Sandbox</span>
          </p>
        </div>
      </div>
    </div>
  );
}
