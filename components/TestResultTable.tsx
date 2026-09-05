"use client";

import React, { useState } from "react";
import {
  Check,
  Edit2,
  FileSearch,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { TestResult } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ProvenanceBadge } from "./ProvenanceBadge";
import { formatReferenceRange } from "@/lib/referenceRangeEngine";
import { useData } from "@/context/DataContext";

interface TestResultTableProps {
  results: TestResult[];
  filterDocumentId?: string;
}

export const TestResultTable: React.FC<TestResultTableProps> = ({
  results,
  filterDocumentId,
}) => {
  const { verifyTestResult, editTestResult } = useData();

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<string>("");
  const [editUnit, setEditUnit] = useState<string>("");
  const [editMin, setEditMin] = useState<string>("");
  const [editMax, setEditMax] = useState<string>("");

  // Inspecting snippet modal / popover state
  const [selectedSnippet, setSelectedSnippet] = useState<{
    test_name: string;
    snippet: string;
    confidence: number;
    raw_text: string;
    original_ai_value: string;
  } | null>(null);

  const displayedResults = filterDocumentId
    ? results.filter((r) => r.document_id === filterDocumentId)
    : results;

  const startEdit = (result: TestResult) => {
    setEditingId(result.id);
    setEditVal(result.value);
    setEditUnit(result.unit);
    setEditMin(result.reference_min !== null ? String(result.reference_min) : "");
    setEditMax(result.reference_max !== null ? String(result.reference_max) : "");
  };

  const handleSaveEdit = (id: string) => {
    const parsedMin = editMin.trim() === "" ? null : parseFloat(editMin);
    const parsedMax = editMax.trim() === "" ? null : parseFloat(editMax);

    editTestResult(
      id,
      editVal.trim(),
      editUnit.trim(),
      isNaN(parsedMin as number) ? null : parsedMin,
      isNaN(parsedMax as number) ? null : parsedMax
    );
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Laboratory Test Results</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {displayedResults.length} Tests
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rule 1 active: Status computed purely via deterministic reference engine. AI extracts bounds only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Pure Range Engine</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 sm:px-6">Test Name & Provenance</th>
              <th className="py-3 px-4">Observed Value</th>
              <th className="py-3 px-4">Reference Range</th>
              <th className="py-3 px-4">Computed Status</th>
              <th className="py-3 px-4">Confidence & AI Trace</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedResults.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No laboratory tests found for this filter.
                </td>
              </tr>
            ) : (
              displayedResults.map((result) => {
                const isEditing = editingId === result.id;
                return (
                  <tr
                    key={result.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Test Name & Provenance */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {result.test_name}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <ProvenanceBadge type={result.provenance} size="xs" />
                        <span className="text-[10px] font-mono text-slate-400">
                          Doc: {result.document_id}
                        </span>
                      </div>
                    </td>

                    {/* Observed Value */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-xs bg-white dark:bg-slate-800 border-teal-500 focus:outline-none"
                            placeholder="Value"
                          />
                          <input
                            type="text"
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                            placeholder="Unit"
                          />
                        </div>
                      ) : (
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {result.value}
                          </span>{" "}
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {result.unit}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Reference Range */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <input
                            type="number"
                            step="any"
                            value={editMin}
                            onChange={(e) => setEditMin(e.target.value)}
                            className="w-14 px-1.5 py-1 border rounded text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                            placeholder="Min"
                          />
                          <span>-</span>
                          <input
                            type="number"
                            step="any"
                            value={editMax}
                            onChange={(e) => setEditMax(e.target.value)}
                            className="w-14 px-1.5 py-1 border rounded text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                            placeholder="Max"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-mono text-slate-800 dark:text-slate-200">
                            {formatReferenceRange(
                              result.reference_min,
                              result.reference_max,
                              result.reference_raw_text
                            )}
                          </div>
                          {result.reference_raw_text && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]" title={result.reference_raw_text}>
                              Raw: {result.reference_raw_text}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Computed Status (Pure JS) */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={result.status} size="sm" />
                    </td>

                    {/* Confidence & AI Traceability */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              result.confidence >= 0.95
                                ? "bg-emerald-500"
                                : result.confidence >= 0.85
                                ? "bg-teal-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                            {Math.round(result.confidence * 100)}% conf
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Orig AI: <span className="font-semibold text-slate-700 dark:text-slate-300">{result.original_ai_value}</span>
                        </div>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      {result.verification_status === "verified" && (
                        <ProvenanceBadge type="verified" size="xs" />
                      )}
                      {result.verification_status === "edited" && (
                        <ProvenanceBadge type="edited" size="xs" />
                      )}
                      {result.verification_status === "unverified" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(result.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Inspect OCR Source Snippet"
                            onClick={() =>
                              setSelectedSnippet({
                                test_name: result.test_name,
                                snippet: result.source_snippet,
                                confidence: result.confidence,
                                raw_text: result.reference_raw_text,
                                original_ai_value: result.original_ai_value,
                              })
                            }
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <FileSearch className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Edit Value / Reference"
                            onClick={() => startEdit(result)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {result.verification_status !== "verified" && (
                            <button
                              title="Verify Result"
                              onClick={() => verifyTestResult(result.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verify
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Snippet Traceability Modal */}
      {selectedSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-indigo-500" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Provenance Inspector
                </h4>
              </div>
              <ProvenanceBadge type="document_extracted" size="xs" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Test Target:
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedSnippet.test_name}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Exact Document Source Snippet:
                </span>
                &quot;{selectedSnippet.snippet}&quot;
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                    Extraction Confidence
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(selectedSnippet.confidence * 100)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                    Original AI Value
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {selectedSnippet.original_ai_value}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSnippet(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
