"use client";

import React from "react";
import { HelpCircle, Sparkles, CheckCircle, Info } from "lucide-react";
import { ClarificationQuestion } from "@/lib/clarificationQuestionsEngine";

interface ClarificationQuestionsProps {
  questions: ClarificationQuestion[];
}

export const ClarificationQuestions: React.FC<ClarificationQuestionsProps> = ({
  questions,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Missing Information & Clarification Questions
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Identified data gaps, missing reference ranges, and source discrepancies requiring human review.
          </p>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 self-start sm:self-auto flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>System & AI Generated</span>
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>No clarification questions are currently required based on available information.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-950 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-800/60 mt-0.5">
                {index + 1}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/50">
                    {q.field}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {q.provenance}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {q.question}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Clarification questions address factual record gaps only and do not constitute medical diagnosis.</span>
      </div>
    </div>
  );
};
