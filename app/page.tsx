"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Sparkles,
  AlertCircle,
  User,
  ShieldAlert,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DemoRole } from "@/lib/session";

export default function DemoSignInPage() {
  const { user, isLoaded, login, loginAsEvaluator } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<DemoRole>("clinician");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard if session already exists
  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoaded, router]);

  const validate = (): boolean => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError("Display name is required.");
      return false;
    }
    if (trimmed.length < 2) {
      setNameError("Display name must be at least 2 characters.");
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      login(displayName.trim(), role);
    }, 150);
  };

  const handleEvaluatorDemo = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsEvaluator();
    }, 150);
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
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-xs mx-auto">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Med<span className="text-teal-400">Lens</span>
            </h1>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] font-medium">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Hackathon Prototype • Demo Access</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Clinical lab aggregation & reference engine sandbox. Sign in to launch a prototype session.
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="displayName"
                className="block text-xs font-semibold text-slate-300"
              >
                Display Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  onBlur={validate}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    nameError
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  }`}
                />
              </div>
              {nameError && (
                <div
                  id="name-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-rose-400 text-[11px] font-medium mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Demo Role Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="demoRole"
                className="block text-xs font-semibold text-slate-300"
              >
                Demo Role <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="demoRole"
                  name="demoRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value as DemoRole)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
                >
                  <option value="clinician">Clinician</option>
                  <option value="patient">Patient</option>
                  <option value="coordinator">Care coordinator</option>
                  <option value="evaluator">Evaluator</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Entering workspace...</span>
              ) : (
                <>
                  <span>Enter demo workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Evaluator Flow Button */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleEvaluatorDemo}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-teal-300 hover:text-teal-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Try evaluator demo</span>
            </button>
          </div>

          {/* Explicit Notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-amber-400/90 font-medium bg-amber-950/40 p-2.5 rounded-xl border border-amber-900/50">
              Demo access only — this prototype is not intended for real patient data.
            </p>
          </div>
        </div>

        {/* Prototype Honest Security Note */}
        <div className="text-center space-y-1 text-[11px] text-slate-500">
          <p>
            Prototype authentication • No password collected • No production security guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
