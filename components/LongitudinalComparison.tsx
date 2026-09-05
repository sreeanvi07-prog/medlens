"use client";

import React from "react";
import { Activity, AlertTriangle, Layers } from "lucide-react";
import { Document, TestResult } from "@/lib/types";
import { getNormalizedTestName, getNormalizedDisplayLabel } from "@/lib/normalizeTestName";

interface LongitudinalComparisonProps {
  documents: Document[];
  testResults: TestResult[];
}

export const LongitudinalComparison: React.FC<LongitudinalComparisonProps> = ({
  documents,
  testResults,
}) => {
  if (documents.length < 2) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center space-y-2">
        <Layers className="w-6 h-6 text-slate-500 mx-auto" />
        <h4 className="text-xs font-semibold text-slate-300">
          Longitudinal Comparison Unavailable
        </h4>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          At least two laboratory reports are required to perform multi-report parameter comparison.
        </p>
      </div>
    );
  }

  // Sort documents by date ascending
  const sortedDocs = [...documents].sort((a, b) =>
    (a.document_date || "").localeCompare(b.document_date || "")
  );

  const prevDoc = sortedDocs[0];
  const currDoc = sortedDocs[sortedDocs.length - 1];

  const prevResults = testResults.filter((r) => r.document_id === prevDoc.id);
  const currResults = testResults.filter((r) => r.document_id === currDoc.id);

  // Match test results by normalized test name
  const comparisonRows: Array<{
    parameterOriginal: string;
    parameterNormalized: string;
    prevValue: string;
    currValue: string;
    unit: string;
    diffText: string;
    unitMismatch: boolean;
  }> = [];

  currResults.forEach((currRes) => {
    const currNormKey = getNormalizedTestName(currRes.test_name);
    const matchingPrev = prevResults.find(
      (p) => getNormalizedTestName(p.test_name) === currNormKey
    );

    if (matchingPrev) {
      const prevValNum = parseFloat(matchingPrev.value);
      const currValNum = parseFloat(currRes.value);
      const unitMismatch =
        matchingPrev.unit &&
        currRes.unit &&
        matchingPrev.unit.toLowerCase().trim() !== currRes.unit.toLowerCase().trim();

      let diffText = "";

      if (unitMismatch) {
        diffText = "Comparison unavailable: units differ";
      } else if (!isNaN(prevValNum) && !isNaN(currValNum)) {
        const diff = currValNum - prevValNum;
        const sign = diff > 0 ? "+" : "";
        diffText = `${sign}${diff.toFixed(2).replace(/\.00$/, "")} ${currRes.unit}`;
      } else {
        diffText = `Changed from "${matchingPrev.value}" to "${currRes.value}"`;
      }

      const labels = getNormalizedDisplayLabel(currRes.test_name);

      comparisonRows.push({
        parameterOriginal: currRes.test_name,
        parameterNormalized: labels.normalized,
        prevValue: `${matchingPrev.value} ${matchingPrev.unit || ""}`.trim(),
        currValue: `${currRes.value} ${currRes.unit || ""}`.trim(),
        unit: currRes.unit || matchingPrev.unit || "",
        diffText,
        unitMismatch: !!unitMismatch,
      });
    }
  });

  if (comparisonRows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center space-y-2">
        <Activity className="w-6 h-6 text-slate-500 mx-auto" />
        <h4 className="text-xs font-semibold text-slate-300">
          No Overlapping Parameters Found
        </h4>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
          The uploaded documents ({prevDoc.filename} vs {currDoc.filename}) do not contain matching lab parameters for longitudinal tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Longitudinal Parameter Comparison
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Normalized term matching between {prevDoc.document_type} ({prevDoc.document_date}) and {currDoc.document_type} ({currDoc.document_date})
          </p>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
          Deterministic Factual Differences
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Parameter (Original / Normalized)</th>
              <th className="p-3">Previous ({prevDoc.document_date})</th>
              <th className="p-3">Current ({currDoc.document_date})</th>
              <th className="p-3">Literal Factual Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40">
                <td className="p-3">
                  <div className="font-semibold text-white">
                    {row.parameterOriginal}
                  </div>
                  {row.parameterOriginal.toLowerCase() !== row.parameterNormalized.toLowerCase() && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Matched key: {row.parameterNormalized}
                    </div>
                  )}
                </td>

                <td className="p-3 font-mono text-slate-300">
                  {row.prevValue}
                </td>

                <td className="p-3 font-mono font-semibold text-teal-300">
                  {row.currValue}
                </td>

                <td className="p-3 font-mono text-[11px]">
                  {row.unitMismatch ? (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-sans font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{row.diffText}</span>
                    </span>
                  ) : (
                    <span className="text-slate-200 font-semibold">{row.diffText}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
