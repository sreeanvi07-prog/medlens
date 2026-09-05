"use client";

import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export interface WorkflowPipelineProps {
  currentStage?: "input" | "extraction" | "validation" | "normalization" | "analysis" | "insight" | "review";
}

const STAGES = [
  { key: "input", label: "Input received" },
  { key: "extraction", label: "Information extracted" },
  { key: "validation", label: "Data validated" },
  { key: "normalization", label: "Terms normalized" },
  { key: "analysis", label: "Reference ranges analyzed" },
  { key: "insight", label: "Insights prepared" },
  { key: "review", label: "Human review available" },
] as const;

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  currentStage = "review",
}) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-[11px]">
        {STAGES.map((stage, idx) => {
          const isDone = idx <= (currentIndex >= 0 ? currentIndex : STAGES.length - 1);
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={stage.key}>
              <div className="flex items-center gap-1.5 font-medium">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isCurrent
                      ? "bg-teal-500 text-slate-950 ring-2 ring-teal-400/40"
                      : isDone
                      ? "bg-teal-950 text-teal-300 border border-teal-800"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3 h-3 text-teal-400" /> : idx + 1}
                </div>
                <span
                  className={
                    isCurrent
                      ? "text-teal-300 font-bold"
                      : isDone
                      ? "text-slate-300"
                      : "text-slate-500"
                  }
                >
                  {stage.label}
                </span>
              </div>

              {idx < STAGES.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-700 shrink-0 hidden lg:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
