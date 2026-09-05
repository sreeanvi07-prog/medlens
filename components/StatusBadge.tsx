"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle, HelpCircle } from "lucide-react";
import { TestResult } from "@/lib/types";

interface StatusBadgeProps {
  status: TestResult["status"];
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getConfig = () => {
    switch (status) {
      case "LOW":
        return {
          label: "LOW",
          icon: <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />,
          badgeClass:
            "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700",
          tooltip: "Result falls below documented reference minimum",
        };
      case "HIGH":
        return {
          label: "HIGH",
          icon: <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />,
          badgeClass:
            "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700",
          tooltip: "Result exceeds documented reference maximum",
        };
      case "NORMAL":
        return {
          label: "NORMAL",
          icon: <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
          badgeClass:
            "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700",
          tooltip: "Result falls within documented normal reference range",
        };
      case "NOT_DETERMINED":
      default:
        return {
          label: "NOT DETERMINED",
          icon: <HelpCircle className="w-3.5 h-3.5 stroke-[2]" />,
          badgeClass:
            "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-600",
          tooltip: "Reference range not provided in source document",
        };
    }
  };

  const config = getConfig();
  const padding =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <div className="relative inline-block">
      <span
        title={config.tooltip}
        onClick={() => setShowTooltip((prev) => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 rounded-md border font-semibold tracking-wide shadow-xs cursor-pointer select-none transition-all ${padding} ${config.badgeClass}`}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>

      {showTooltip && status === "NOT_DETERMINED" && (
        <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-200 shadow-xl pointer-events-none text-center">
          {config.tooltip}
        </div>
      )}
    </div>
  );
};
