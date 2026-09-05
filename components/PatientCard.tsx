"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Patient } from "@/lib/types";
import { ProvenanceBadge } from "./ProvenanceBadge";
import { useData } from "@/context/DataContext";

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const { getDocumentsByPatientId, getTestResultsByPatientId, getConflicts } = useData();

  const documents = getDocumentsByPatientId(patient.id);
  const results = getTestResultsByPatientId(patient.id);
  const conflicts = getConflicts().filter((c) => !c.resolved);

  const highCount = results.filter((r) => r.status === "HIGH").length;
  const lowCount = results.filter((r) => r.status === "LOW").length;
  const verifiedCount = results.filter((r) => r.verification_status === "verified").length;

  return (
    <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {patient.name}
                </h3>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {patient.age} yrs • {patient.sex} • ID: <span className="font-mono">{patient.id}</span>
              </p>
            </div>
          </div>

          <Link
            href={`/patient/${patient.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-semibold transition-colors"
          >
            View Record
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clinical Intake Fields with User Provided Badges */}
        <div className="mt-4 space-y-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Conditions</span>
              <ProvenanceBadge type="user_provided" size="xs" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{patient.conditions}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Medications</span>
              <ProvenanceBadge type="user_provided" size="xs" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{patient.medications}</p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <FileText className="w-3 h-3 text-indigo-500" />
              Documents
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {documents.length}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Activity className="w-3 h-3 text-teal-500" />
              Out-of-Range
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              <span className={highCount > 0 ? "text-rose-600 font-extrabold" : ""}>{highCount}</span>
              {" / "}
              <span className={lowCount > 0 ? "text-amber-600 font-extrabold" : ""}>{lowCount}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Verified
            </div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {verifiedCount}/{results.length}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Conflict indicator */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {conflicts.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {conflicts.length} Unresolved Conflict{conflicts.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              No active conflicts
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400">Intake Source: user_provided</span>
      </div>
    </div>
  );
};
