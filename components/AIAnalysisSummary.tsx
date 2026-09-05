"use client";

import React, { useState } from "react";
import { Bot, Sparkles, AlertTriangle, ShieldCheck, Send, RefreshCw } from "lucide-react";
import { ProvenanceBadge } from "./ProvenanceBadge";
import { TestResult } from "@/lib/types";

interface AIAnalysisSummaryProps {
  patientName: string;
  results: TestResult[];
}

export const AIAnalysisSummary: React.FC<AIAnalysisSummaryProps> = ({
  patientName,
  results,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    summary: string;
    counts?: { total: number; normal: number; high: number; low: number; undetermined: number };
    disclaimer: string;
    is_blocked_diagnostic_query: boolean;
    provenance: "ai_generated";
  } | null>(null);

  const [promptQuery, setPromptQuery] = useState("");

  const fetchSummary = async (queryText = "") => {
    setLoading(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: patientName,
          query: queryText,
          results_data: results,
        }),
      });
      const data = await res.json();
      setSummaryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Factual AI Lab Summary & Guardrails
              </h3>
              <ProvenanceBadge type="ai_generated" size="xs" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict Rules 3 & 4: Only factual counts and deltas. Never diagnoses or prescribes.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchSummary("")}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate Factual Summary
        </button>
      </div>

      {/* Summary Output */}
      {summaryData ? (
        <div className="space-y-4">
          {summaryData.is_blocked_diagnostic_query ? (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Rule 4 Triggered: Diagnostic Inquiry Intercepted
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                {summaryData.summary}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              {summaryData.counts && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                    Total: {summaryData.counts.total}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold font-mono">
                    In-Range: {summaryData.counts.normal}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold font-mono">
                    High: {summaryData.counts.high}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold font-mono">
                    Low: {summaryData.counts.low}
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {summaryData.summary}
              </p>
            </div>
          )}

          {/* Fixed Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>{summaryData.disclaimer}</span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
          Click &quot;Generate Factual Summary&quot; to synthesize clinical record counts and factual observations without diagnostic assertions.
        </div>
      )}

      {/* Interactive Diagnostic Guardrail Tester */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Test Clinical Safety Guardrail (Rule 4):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promptQuery}
            onChange={(e) => setPromptQuery(e.target.value)}
            placeholder='Try: "What medication should I take?" or "Do I have diabetes?"'
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => fetchSummary(promptQuery)}
            disabled={loading || !promptQuery.trim()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Query</span>
          </button>
        </div>
      </div>
    </div>
  );
};
