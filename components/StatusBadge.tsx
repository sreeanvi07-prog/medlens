"use client";

import React from "react";
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
  const getConfig = () => {
    switch (status) {
      case "LOW":
        return {
          label: "LOW",
          icon: <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />,
          badgeClass:
            "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
        };
      case "HIGH":
        return {
          label: "HIGH",
          icon: <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />,
          badgeClass:
            "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700",
        };
      case "NORMAL":
        return {
          label: "NORMAL",
          icon: <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
          badgeClass:
            "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
        };
      case "NOT_DETERMINED":
      default:
        return {
          label: "NOT DETERMINED",
          icon: <HelpCircle className="w-3.5 h-3.5 stroke-[2]" />,
          badgeClass:
            "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
        };
    }
  };

  const config = getConfig();
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold tracking-wide shadow-xs ${padding} ${config.badgeClass}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
