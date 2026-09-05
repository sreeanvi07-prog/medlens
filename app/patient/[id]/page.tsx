"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Building,
  AlertCircle,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { TestResultTable } from "@/components/TestResultTable";
import { AIAnalysisSummary } from "@/components/AIAnalysisSummary";
import { SafetyBanner } from "@/components/SafetyBanner";

export default function PatientRecordPage() {
  const params = useParams();
  const patientId = params?.id as string;

  const {
    getPatientById,
    getDocumentsByPatientId,
    getTestResultsByPatientId,
  } = useData();

  const [selectedDocId, setSelectedDocId] = useState<string>("all");

  const patient = getPatientById(patientId);
  const documents = getDocumentsByPatientId(patientId);
  const allResults = getTestResultsByPatientId(patientId);

  if (!patient) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="p-4 rounded-full bg-slate-800 text-slate-400 inline-block">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Patient Record Not Found</h2>
        <p className="text-xs text-slate-400">
          No clinical intake or laboratory record matches ID: <span className="font-mono">{patientId}</span>
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const highResultsCount = allResults.filter((r) => r.status === "HIGH").length;
  const lowResultsCount = allResults.filter((r) => r.status === "LOW").length;
  const verifiedResultsCount = allResults.filter(
    (r) => r.verification_status === "verified"
  ).length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <SafetyBanner compact />
      </div>

      {/* Patient Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-teal-500/10">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {patient.name}
                </h1>
                <ProvenanceBadge type="user_provided" size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>
                  <strong>Age:</strong> {patient.age}
                </span>
                <span>•</span>
                <span>
                  <strong>Sex:</strong> {patient.sex}
                </span>
                <span>•</span>
                <span>
                  <strong>Patient ID:</strong>{" "}
                  <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300 font-mono">
                    {patient.id}
                  </code>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Aggregate Indicators */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Lab Tests
              </span>
              <span className="text-lg font-extrabold text-white">
                {allResults.length}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                High
              </span>
              <span className="text-lg font-extrabold text-rose-400">
                {highResultsCount}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Low
              </span>
              <span className="text-lg font-extrabold text-amber-400">
                {lowResultsCount}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Verified
              </span>
              <span className="text-lg font-extrabold text-emerald-400">
                {verifiedResultsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Intake Information with Provenance on every field */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              Patient Clinical Intake Record
            </h3>
            <span className="text-[11px] text-slate-500">
              Source: <span className="font-mono text-sky-400">user_provided</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Reported Symptoms</span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-400 leading-relaxed">{patient.symptoms}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Medical Conditions</span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-400 leading-relaxed">{patient.conditions}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Known Allergies</span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-400 leading-relaxed">{patient.allergies}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Current Medications</span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-400 leading-relaxed">{patient.medications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Laboratory Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Extracted Laboratory Documents ({documents.length})
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedDocId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedDocId === "all"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All Documents
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(isSelected ? "all" : doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {doc.document_type}
                      </span>
                      <ProvenanceBadge type="document_extracted" size="xs" />
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      {doc.filename}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {doc.id}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{doc.laboratory}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Draw Date: {doc.document_date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lab Results Table with Pure Deterministic Range Engine */}
      <TestResultTable
        results={allResults}
        filterDocumentId={selectedDocId === "all" ? undefined : selectedDocId}
      />

      {/* Factual AI Summary & Diagnostic Guardrails */}
      <AIAnalysisSummary patientName={patient.name} results={allResults} />
    </div>
  );
}
