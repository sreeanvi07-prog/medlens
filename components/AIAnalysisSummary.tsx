"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Bot, Sparkles, AlertTriangle, Send, RefreshCw, AlertCircle } from "lucide-react";
import { ProvenanceBadge } from "./ProvenanceBadge";
import { Patient, Document, TestResult } from "@/lib/types";

interface AIAnalysisSummaryProps {
  patient: Patient;
  documents: Document[];
  results: TestResult[];
}

const CLIENT_GUARD_MESSAGE =
  "MedLens is designed to organize and explain the information in your records. It cannot diagnose conditions, prescribe medication, or recommend dosage changes.";

const DIAGNOSTIC_KEYWORDS = [
  "diagnose",
  "diagnosis",
  "should i take",
  "what medicine",
  "what medication",
  "dosage",
  "dose",
  "do i have",
  "can you treat",
  "cure",
  "prescribe",
  "prescription",
];

// In-memory cache fallback if sessionStorage is unavailable
const summaryMemoryCache = new Map<string, string>();

export const AIAnalysisSummary: React.FC<AIAnalysisSummaryProps> = ({
  patient,
  documents,
  results,
}) => {
  const [loading, setLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string>("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [promptQuery, setPromptQuery] = useState("");

  // Unique data signature to detect if patient data, documents, or test results have changed
  const dataSignature = useMemo(() => {
    const docSignatures = documents.map((d) => d.id).sort().join("|");
    const testSignatures = results
      .map((r) => `${r.id}:${r.value}:${r.verification_status}:${r.status}`)
      .sort()
      .join("|");
    return `summary_v1_${patient.id}_${documents.length}_${results.length}_${docSignatures}_${testSignatures}`;
  }, [patient.id, documents, results]);

  const getCachedSummary = useCallback((key: string): string | null => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const stored = sessionStorage.getItem(key);
        if (stored) return stored;
      } catch {
        // sessionStorage restricted
      }
    }
    return summaryMemoryCache.get(key) || null;
  }, []);

  const setCachedSummary = useCallback((key: string, value: string) => {
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // sessionStorage restricted
      }
    }
    summaryMemoryCache.set(key, value);
  }, []);

  const fetchSummary = useCallback(
    async (queryText = "", forceRefresh = false) => {
      // 1. Hardcoded client-side guardrail check before making any network call
      if (queryText.trim().length > 0) {
        const lowerQuery = queryText.toLowerCase();
        const hasDiagnosticWord = DIAGNOSTIC_KEYWORDS.some((word) =>
          lowerQuery.includes(word)
        );

        if (hasDiagnosticWord) {
          setIsBlocked(true);
          setErrorMessage(null);
          setSummaryText(CLIENT_GUARD_MESSAGE);
          return;
        }
      }

      // Check cache if default summary and not force refreshing
      if (!queryText.trim() && !forceRefresh) {
        const cached = getCachedSummary(dataSignature);
        if (cached) {
          setIsBlocked(false);
          setErrorMessage(null);
          setSummaryText(cached);
          return;
        }
      }

      setIsBlocked(false);
      setErrorMessage(null);
      setLoading(true);

      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient,
            documents,
            test_results: results,
            query: queryText,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(data.error || "Failed to generate factual summary");
        }

        if (data.is_blocked_diagnostic_query) {
          setIsBlocked(true);
        }

        const generatedSummary = data.summary || "";
        setSummaryText(generatedSummary);

        // Cache the default summary for this data signature
        if (!queryText.trim() && generatedSummary) {
          setCachedSummary(dataSignature, generatedSummary);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to generate summary at this time.";
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    },
    [patient, documents, results, dataSignature, getCachedSummary, setCachedSummary]
  );

  useEffect(() => {
    // Only fetch or load from cache when dataSignature changes
    fetchSummary("", false);
  }, [dataSignature, fetchSummary]);

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-slate-900/90 shadow-md p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Factual Clinical Record Summary
              </h3>
              <ProvenanceBadge type="ai_generated" size="xs" />
            </div>
            <p className="text-xs text-slate-400">
              Non-diagnostic overview describing data points and reference counts.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchSummary("", true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span>Regenerate Summary</span>
        </button>
      </div>

      {/* Summary Content Body */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          <span>Synthesizing factual non-diagnostic summary...</span>
        </div>
      ) : errorMessage ? (
        <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-200 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span>Summary Generation Error</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => fetchSummary("", true)}
            className="mt-1 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 font-semibold text-xs border border-rose-700 cursor-pointer"
          >
            Retry Summary Generation
          </button>
        </div>
      ) : isBlocked ? (
        <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-200 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Clinical Safety Notice (Client-Side Guard Active)
          </div>
          <p className="font-medium leading-relaxed">{summaryText}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-purple-900/30 bg-purple-950/20 space-y-3">
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {summaryText}
          </div>
        </div>
      )}

      {/* Interactive Safety & Guardrail Input Test */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
          Ask Summary Inquiry (Protected by deterministic client guard):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promptQuery}
            onChange={(e) => setPromptQuery(e.target.value)}
            placeholder='Try asking: "What should I take for high glucose?" or "Can you diagnose me?"'
            className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={() => fetchSummary(promptQuery, false)}
            disabled={loading || !promptQuery.trim()}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
