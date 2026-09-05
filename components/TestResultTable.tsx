"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  FileSearch,
  Check,
  Edit2,
} from "lucide-react";
import { TestResult } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ProvenanceBadge, ConfidencePill } from "./ProvenanceBadge";
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

  // Inspecting snippet modal / popover state (Module 6 preview)
  const [selectedSnippet, setSelectedSnippet] = useState<{
    test_name: string;
    snippet: string;
    confidence: number;
    raw_text: string;
    original_ai_value: string;
    document_id: string;
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

  const formatRange = (min: number | null, max: number | null, raw?: string) => {
    if (min !== null && max !== null) {
      return `${min} – ${max}`;
    }
    if (min !== null) {
      return `≥ ${min}`;
    }
    if (max !== null) {
      return `≤ ${max}`;
    }
    if (raw && raw.trim().length > 0 && raw !== "not provided" && raw !== "None specified") {
      return raw;
    }
    return "Not provided";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:px-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Structured Laboratory Results</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {displayedResults.length} Tests Extracted
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured clinical record table with auditable provenance and verbatim source traces.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] font-medium">Verified by pure reference engine</span>
        </div>
      </div>

      {/* Structured Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-300 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 sm:px-6">Test</th>
              <th className="py-3.5 px-4">Result</th>
              <th className="py-3.5 px-4">Unit</th>
              <th className="py-3.5 px-4">Reference Range</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Source</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayedResults.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileSearch className="w-8 h-8 text-slate-600" />
                    <p className="font-semibold text-slate-300 text-xs">No laboratory tests found</p>
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      {filterDocumentId
                        ? "No test results recorded for this specific document."
                        : "No test results match the current filter or search criteria."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedResults.map((result) => {
                const isEditing = editingId === result.id;
                const rangeStr = formatRange(
                  result.reference_min,
                  result.reference_max,
                  result.reference_raw_text
                );

                return (
                  <tr
                    key={result.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Column 1: Test & Provenance & Confidence */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-white text-sm">
                        {result.test_name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <ProvenanceBadge type="document_extracted" size="xs" />
                        <ConfidencePill confidence={result.confidence} />
                      </div>
                    </td>

                    {/* Column 2: Result */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-xs bg-slate-800 border-teal-500 text-white focus:outline-none"
                          placeholder="Value"
                        />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {result.value}
                        </span>
                      )}
                    </td>

                    {/* Column 3: Unit */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className="w-16 px-2 py-1 border rounded text-xs bg-slate-800 border-slate-700 text-white"
                          placeholder="Unit"
                        />
                      ) : (
                        <span className="text-slate-400 font-medium">
                          {result.unit || "—"}
                        </span>
                      )}
                    </td>

                    {/* Column 4: Reference Range */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <input
                            type="number"
                            step="any"
                            value={editMin}
                            onChange={(e) => setEditMin(e.target.value)}
                            className="w-14 px-1.5 py-1 border rounded text-xs bg-slate-800 border-slate-700 text-white"
                            placeholder="Min"
                          />
                          <span>–</span>
                          <input
                            type="number"
                            step="any"
                            value={editMax}
                            onChange={(e) => setEditMax(e.target.value)}
                            className="w-14 px-1.5 py-1 border rounded text-xs bg-slate-800 border-slate-700 text-white"
                            placeholder="Max"
                          />
                        </div>
                      ) : (
                        <span
                          className={`font-mono ${
                            rangeStr === "Not provided"
                              ? "text-slate-500 italic"
                              : "text-slate-200"
                          }`}
                        >
                          {rangeStr}
                        </span>
                      )}
                    </td>

                    {/* Column 5: Status (pull from status field on TestResult) */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={result.status} size="sm" />
                    </td>

                    {/* Column 6: Source (small document icon button placeholder for Module 6) */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        title="Click to view verbatim document evidence snippet (Module 6 viewer)"
                        onClick={() =>
                          setSelectedSnippet({
                            test_name: result.test_name,
                            snippet: result.source_snippet,
                            confidence: result.confidence,
                            raw_text: result.reference_raw_text,
                            original_ai_value: result.original_ai_value,
                            document_id: result.document_id,
                          })
                        }
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Actions: Edit & Verify */}
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
                            className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit Result"
                            onClick={() => startEdit(result)}
                            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {result.verification_status !== "verified" ? (
                            <button
                              title="Verify Result"
                              onClick={() => verifyTestResult(result.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-medium text-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verify
                            </button>
                          ) : (
                            <ProvenanceBadge type="verified" size="xs" />
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

      {/* Snippet Evidence Inspector Modal (Module 6 placeholder) */}
      {selectedSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white">
                  Document Evidence Trace (Module 6)
                </h4>
              </div>
              <ProvenanceBadge type="document_extracted" size="xs" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-400">Target Test:</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {selectedSnippet.test_name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Document ID: {selectedSnippet.document_id}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                  Verbatim Document Source Snippet:
                </span>
                &quot;{selectedSnippet.snippet || "No snippet captured"}&quot;
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">
                    Extraction Confidence
                  </span>
                  <ConfidencePill confidence={selectedSnippet.confidence} />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">
                    Original AI Value
                  </span>
                  <span className="font-bold font-mono text-slate-200">
                    {selectedSnippet.original_ai_value}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSnippet(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Evidence Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
