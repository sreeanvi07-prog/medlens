"use client";

import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const SafetyBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-900 dark:text-teal-200 text-xs">
        <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>
          <strong>Clinical Verification Guard:</strong> Status computed via pure deterministic code. Non-diagnostic.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-gradient-to-r from-teal-50/80 via-sky-50/50 to-indigo-50/40 dark:from-teal-950/40 dark:via-sky-950/30 dark:to-indigo-950/20 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-600 text-white shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Clinical Guardrails Active
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                Deterministic Engine v1.0
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              1. LLM extracts raw bounds only • 2. Status computed purely in JS • 3. Provenance tagged • 4. Non-diagnostic summaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
