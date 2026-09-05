"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Activity,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { PatientCard } from "@/components/PatientCard";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { SafetyBanner } from "@/components/SafetyBanner";
import { ConflictViewer } from "@/components/ConflictViewer";

export default function DashboardPage() {
  const { patients, documents, testResults, conflicts } = useData();

  const totalPatients = patients.length;
  const totalDocuments = documents.length;
  const totalTests = testResults.length;
  const outOfRangeTests = testResults.filter(
    (t) => t.status === "HIGH" || t.status === "LOW"
  ).length;
  const verifiedTests = testResults.filter(
    (t) => t.verification_status === "verified"
  ).length;
  const openConflicts = conflicts.filter((c) => !c.resolved).length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Safety Guardrail */}
      <SafetyBanner />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Clinical Intake & Lab Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated patient records with auditable data provenance and deterministic reference range evaluation.
          </p>
        </div>

        {/* Provenance Key / Legend & New Intake Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Provenance:
            </span>
            <ProvenanceBadge type="user_provided" size="xs" />
            <ProvenanceBadge type="document_extracted" size="xs" />
            <ProvenanceBadge type="ai_generated" size="xs" />
            <ProvenanceBadge type="verified" size="xs" />
          </div>

          <Link
            href="/patient/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Intake</span>
          </Link>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Patients</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalPatients}</span>
            <span className="text-xs text-slate-500">Active Profiles</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Processed Documents</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalDocuments}</span>
            <span className="text-xs text-slate-500">Quest, LabCorp, etc.</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Extracted Tests</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalTests}</span>
            <span className="text-xs text-rose-400 font-medium">
              {outOfRangeTests} Out-of-Range
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Human Verified</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{verifiedTests}</span>
            <span className="text-xs text-slate-500">
              {openConflicts > 0 ? `${openConflicts} conflicts pending` : `of ${totalTests} tests`}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Patient Roster
            </h2>
            <p className="text-xs text-slate-400">
              Select a patient record to view comprehensive clinical intake, lab tables, and verification actions.
            </p>
          </div>

          <Link
            href="/patient/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Patient</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </div>

      {/* Data Lineage & Conflict Discrepancies */}
      <ConflictViewer />

      {/* Architectural Rules Verification Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            MedLens Core Safety Rules & Invariant Enforcement
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
            <div className="font-semibold text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Rule 1: Deterministic Status Engine
            </div>
            <p className="text-slate-400 leading-relaxed">
              LLMs extract <code>reference_min</code>, <code>reference_max</code>, and <code>reference_raw_text</code>.
              Status (LOW, NORMAL, HIGH, NOT_DETERMINED) is calculated strictly via pure JS in <code>/lib/referenceRangeEngine.ts</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
            <div className="font-semibold text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Rule 2: Explicit Data Provenance
            </div>
            <p className="text-slate-400 leading-relaxed">
              Every data point displays a provenance badge: 👤 User Provided (intake), 📄 Document Extracted (reports), 🤖 AI Generated (summaries), or ✓ Human Verified.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Rule 3: Strictly Factual Summaries
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI summaries report only factual counts and numerical delta changes across documents. No diagnostic labeling, no treatment suggestions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Rule 4: Diagnostic Safety Guardrail
            </div>
            <p className="text-slate-400 leading-relaxed">
              Any diagnostic inquiry (&quot;what should I take&quot;, &quot;do I have X&quot;) is intercepted by a fixed safety message directing to licensed healthcare providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
