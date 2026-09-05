"use client";

import React from "react";
import { User, FileText, Bot, CheckCircle2, Edit3 } from "lucide-react";

export type ProvenanceType =
  | "user_provided"
  | "document_extracted"
  | "ai_generated"
  | "verified"
  | "human_verified"
  | "edited";

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  size?: "xs" | "sm" | "md";
  className?: string;
  showIconOnly?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  size = "sm",
  className = "",
  showIconOnly = false,
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case "user_provided":
        return {
          label: "👤 User Provided",
          icon: <User className="w-3 h-3" />,
          bg: "bg-sky-50 dark:bg-sky-950/50",
          text: "text-sky-700 dark:text-sky-300",
          border: "border-sky-200 dark:border-sky-800",
          desc: "Entered directly by patient during clinical intake",
        };
      case "document_extracted":
        return {
          label: "📄 Document Extracted",
          icon: <FileText className="w-3 h-3" />,
          bg: "bg-indigo-50 dark:bg-indigo-950/50",
          text: "text-indigo-700 dark:text-indigo-300",
          border: "border-indigo-200 dark:border-indigo-800",
          desc: "Extracted from source laboratory report",
        };
      case "ai_generated":
        return {
          label: "🤖 AI Generated",
          icon: <Bot className="w-3 h-3" />,
          bg: "bg-amber-50 dark:bg-amber-950/50",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          desc: "Synthesized via non-diagnostic factual AI pipeline",
        };
      case "verified":
      case "human_verified":
        return {
          label: "✓ Human Verified",
          icon: <CheckCircle2 className="w-3 h-3" />,
          bg: "bg-emerald-50 dark:bg-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800",
          desc: "Clinically reviewed and confirmed by human operator",
        };
      case "edited":
        return {
          label: "✏️ Human Edited",
          icon: <Edit3 className="w-3 h-3" />,
          bg: "bg-teal-50 dark:bg-teal-950/50",
          text: "text-teal-700 dark:text-teal-300",
          border: "border-teal-200 dark:border-teal-800",
          desc: "Corrected/updated by human operator (original AI value retained)",
        };
      default:
        return {
          label: "Unknown",
          icon: null,
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          desc: "",
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1",
    sm: "px-2 py-0.5 text-xs gap-1.5 font-medium",
    md: "px-2.5 py-1 text-xs gap-2 font-semibold",
  }[size];

  return (
    <span
      title={config.desc}
      className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-150 ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIconOnly ? config.icon : config.label}
    </span>
  );
};
