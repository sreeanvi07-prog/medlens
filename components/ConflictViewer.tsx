"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useData } from "@/context/DataContext";

export const ConflictViewer: React.FC = () => {
  const { conflicts, resolveConflict } = useData();

  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Lineage & Conflict Discrepancies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit discrepancies between clinical intake and laboratory reports
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
          {conflicts.filter((c) => !c.resolved).length} Open Discrepancies
        </span>
      </div>

      <div className="space-y-3">
        {conflicts.map((c) => (
          <div
            key={c.id}
            className={`p-4 rounded-xl border transition-all ${
              c.resolved
                ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                : "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    {c.field_name}
                  </span>
                  {c.resolved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      Unresolved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Source A ({c.source_a})
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.value_a}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Source B ({c.source_b})
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.value_b}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:self-center">
                <button
                  onClick={() => resolveConflict(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    c.resolved
                      ? "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                  }`}
                >
                  {c.resolved ? "Re-open Conflict" : "Mark as Resolved"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
