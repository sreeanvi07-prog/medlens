"use client";

import React from "react";
import { User, FileText, Bot, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export type ProvenanceType =
  | "user_provided"
  | "document_extracted"
  | "ai_generated"
  | "verified"
  | "human_verified";

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
          // Gray variant as specified
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-300 dark:border-slate-700",
          desc: "Source: Entered directly by patient during clinical intake",
        };
      case "document_extracted":
        return {
          label: "📄 Document Extracted",
          icon: <FileText className="w-3 h-3" />,
          // Blue variant as specified
          bg: "bg-blue-50 dark:bg-blue-950/70",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-800",
          desc: "Source: Extracted from uploaded laboratory report",
        };
      case "ai_generated":
        return {
          label: "🤖 AI Generated",
          icon: <Bot className="w-3 h-3" />,
          // Purple variant as specified
          bg: "bg-purple-50 dark:bg-purple-950/70",
          text: "text-purple-700 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-800",
          desc: "Source: Non-diagnostic factual AI synthesis",
        };
      case "verified":
      case "human_verified":
        return {
          label: "✓ Human Verified",
          icon: <CheckCircle2 className="w-3 h-3" />,
          // Green variant as specified
          bg: "bg-emerald-50 dark:bg-emerald-950/70",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800",
          desc: "Source: Verified and confirmed by human operator",
        };
      default:
        return {
          label: "Unknown",
          icon: null,
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-300 dark:border-slate-700",
          desc: "",
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1 font-medium",
    sm: "px-2 py-0.5 text-xs gap-1.5 font-medium",
    md: "px-2.5 py-1 text-xs gap-2 font-semibold",
  }[size];

  return (
    <span
      title={config.desc}
      className={`inline-flex items-center rounded-full border shadow-xs transition-all select-none ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIconOnly ? config.icon : config.label}
    </span>
  );
};

/**
 * Confidence Pill with color tiers and required disclaimer tooltip:
 * - Green for >85%
 * - Amber for 60-85%
 * - Red for <60% with "⚠ Needs review" tag
 * - Tooltip: "Extraction confidence, not medical certainty"
 */
export const ConfidencePill: React.FC<{ confidence: number }> = ({ confidence }) => {
  const percent = Math.round(confidence <= 1 ? confidence * 100 : confidence);
  const isLow = percent < 60;
  const isMedium = percent >= 60 && percent <= 85;
  const isHigh = percent > 85;

  const colorClass = isHigh
    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    : isMedium
    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
    : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        title="Extraction confidence, not medical certainty"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border cursor-help ${colorClass}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isHigh ? "bg-emerald-500" : isMedium ? "bg-amber-500" : "bg-rose-500"
          }`}
        />
        Confidence: {percent}%
        <HelpCircle className="w-2.5 h-2.5 opacity-60 ml-0.5" />
      </span>

      {isLow && (
        <span
          title="Extraction confidence is below 60%. Manual human review recommended."
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
        >
          <AlertTriangle className="w-2.5 h-2.5" />
          Needs review
        </span>
      )}
    </div>
  );
};
