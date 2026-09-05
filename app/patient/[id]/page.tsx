"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Building,
  AlertCircle,
  Upload,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  Pill,
  HeartPulse,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { TestResultTable } from "@/components/TestResultTable";
import { AIAnalysisSummary } from "@/components/AIAnalysisSummary";
import { SafetyBanner } from "@/components/SafetyBanner";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ConflictViewer } from "@/components/ConflictViewer";
import { WorkflowPipeline } from "@/components/WorkflowPipeline";
import { LongitudinalComparison } from "@/components/LongitudinalComparison";
import { ClarificationQuestions } from "@/components/ClarificationQuestions";
import { generateClarificationQuestions } from "@/lib/clarificationQuestionsEngine";

export default function PatientRecordPage() {
  const params = useParams();
  const patientId = params?.id as string;
  const { user, isLoaded } = useAuth();

  const {
    getPatientById,
    getDocumentsByPatientId,
    getTestResultsByPatientId,
    conflicts,
  } = useData();

  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const patient = getPatientById(patientId);
  const documents = getDocumentsByPatientId(patientId);
  const allResults = getTestResultsByPatientId(patientId);

  // Relevant conflicts for this patient
  const patientConflicts = useMemo(() => {
    if (!patient) return [];
    return conflicts.filter((c) => {
      if (c.field_name.toLowerCase().includes("allerg") && patient.allergies) return true;
      if (c.field_name.toLowerCase().includes("uric") && patient.name.includes("Marcus")) return true;
      return false;
    });
  }, [conflicts, patient]);

  // Clarification questions generated deterministically from record gaps
  const clarificationQuestions = useMemo(() => {
    if (!patient) return [];
    return generateClarificationQuestions(patient, documents, allResults, patientConflicts);
  }, [patient, documents, allResults, patientConflicts]);

  // Copy patient ID to clipboard
  const handleCopyId = () => {
    if (!patient) return;
    navigator.clipboard.writeText(patient.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filtered results based on search query, document selection, and status filter
  const filteredResults = useMemo(() => {
    return allResults.filter((result) => {
      // Document filter
      if (selectedDocId !== "all" && result.document_id !== selectedDocId) {
        return false;
      }
      // Status filter
      if (statusFilter === "out_of_range") {
        if (result.status !== "HIGH" && result.status !== "LOW") return false;
      } else if (statusFilter === "HIGH") {
        if (result.status !== "HIGH") return false;
      } else if (statusFilter === "LOW") {
        if (result.status !== "LOW") return false;
      } else if (statusFilter === "NORMAL") {
        if (result.status !== "NORMAL") return false;
      } else if (statusFilter === "verified") {
        if (result.verification_status !== "verified") return false;
      } else if (statusFilter === "needs_review") {
        if (result.confidence >= 0.6 && result.verification_status === "verified") return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = result.test_name.toLowerCase().includes(query);
        const matchesValue = result.value.toLowerCase().includes(query);
        const matchesUnit = result.unit.toLowerCase().includes(query);
        return matchesName || matchesValue || matchesUnit;
      }
      return true;
    });
  }, [allResults, selectedDocId, statusFilter, searchQuery]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Patient Record Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No matching record for patient ID <code className="text-teal-300 font-mono">{patientId}</code>.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const highResultsCount = allResults.filter((r) => r.status === "HIGH").length;
  const lowResultsCount = allResults.filter((r) => r.status === "LOW").length;
  const normalResultsCount = allResults.filter((r) => r.status === "NORMAL").length;
  const verifiedResultsCount = allResults.filter(
    (r) => r.verification_status === "verified"
  ).length;
  const needsReviewCount = allResults.filter(
    (r) => r.confidence < 0.6 || r.verification_status !== "verified"
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-semibold">{patient.name}</span>
          <span className="text-[11px] font-mono text-slate-500">({patient.id})</span>
        </div>

        <div className="flex items-center gap-3">
          <SafetyBanner compact />
          <button
            onClick={() => window.print()}
            title="Print Clinical Summary"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 0. OFFICIAL WORKFLOW PIPELINE INDICATOR */}
      <WorkflowPipeline currentStage="review" />

      {/* 1. TOP AI SUMMARY CARD (Tagged 🤖 AI Generated - Purple) */}
      <AIAnalysisSummary
        patient={patient}
        documents={documents}
        results={allResults}
      />

      {/* 2. PATIENT PROFILE & INTAKE HERO (Stitch-styled clean medical card) */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-lg shadow-teal-500/20 shrink-0">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {patient.name}
                </h1>
                <ProvenanceBadge type={patient.source} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {patient.age} years old • {patient.sex}
                </span>
                <span>•</span>
                <button
                  onClick={handleCopyId}
                  title="Click to copy Patient ID"
                  className="flex items-center gap-1.5 font-mono text-slate-300 hover:text-white transition-colors cursor-pointer group"
                >
                  <span>ID:</span>
                  <span className="text-teal-400 font-semibold">{patient.id}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                  )}
                </button>
                <span>•</span>
                <span className="text-slate-400">
                  {documents.length} Source Document{documents.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Labs
              </span>
              <span className="text-lg font-extrabold text-white">
                {allResults.length}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                High
              </span>
              <span className="text-lg font-extrabold text-rose-400">
                {highResultsCount}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-amber-950/40 border border-amber-900/60 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Low
              </span>
              <span className="text-lg font-extrabold text-amber-400">
                {lowResultsCount}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Normal
              </span>
              <span className="text-lg font-extrabold text-emerald-400">
                {normalResultsCount}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-teal-950/40 border border-teal-900/60 text-center min-w-[70px]">
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">
                Verified
              </span>
              <span className="text-lg font-extrabold text-teal-400">
                {verifiedResultsCount}
              </span>
            </div>

            <button
              onClick={() => setShowUploadModal((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{showUploadModal ? "Hide Upload" : "Upload Document"}</span>
            </button>
          </div>
        </div>

        {/* Clinical Intake Information Grid */}
        <div className="mt-6 relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              Clinical Intake Information
            </h3>
            <span className="text-[11px] text-slate-500">
              Source: <span className="font-mono text-slate-300">user_provided</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Symptoms */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  Reported Symptoms
                </span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-300 leading-relaxed font-normal">{patient.symptoms}</p>
            </div>

            {/* Medical Conditions */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                  Medical Conditions
                </span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-300 leading-relaxed font-normal">{patient.conditions}</p>
            </div>

            {/* Known Allergies */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Known Allergies
                </span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-300 leading-relaxed font-normal">{patient.allergies}</p>
            </div>

            {/* Current Medications */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-400" />
                  Current Medications & Dosages
                </span>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-slate-300 leading-relaxed font-normal">{patient.medications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DOCUMENT UPLOAD & VISION EXTRACTION DRAWER */}
      {showUploadModal && (
        <DocumentUpload
          patientId={patient.id}
          patientName={patient.name}
          onSuccess={() => {
            setShowUploadModal(false);
          }}
        />
      )}

      {/* 4. DISCREPANCY & CONFLICT AUDITOR (if any active for this record) */}
      {patientConflicts.length > 0 && (
        <div className="space-y-2">
          <ConflictViewer />
        </div>
      )}

      {/* 4b. CLARIFICATION QUESTIONS FOR RECORD GAPS */}
      <ClarificationQuestions questions={clarificationQuestions} />

      {/* 5. SOURCE DOCUMENTS CAROUSEL / FILTER STRIP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Source Laboratory Documents ({documents.length})
            </h3>
          </div>

          {documents.length > 0 && (
            <button
              onClick={() => setSelectedDocId("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDocId === "all"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Show All Documents
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">No Laboratory Documents Processed Yet</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Upload PDF or image laboratory reports (e.g., Quest, LabCorp) to extract test results with verbatim source traces.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Lab Report</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              const docResultsCount = allResults.filter(
                (r) => r.document_id === doc.id
              ).length;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(isSelected ? "all" : doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs line-clamp-1">
                          {doc.document_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                      {docResultsCount} tests
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 truncate">
                      <Building className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{doc.laboratory}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{doc.document_date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. STRUCTURED LAB RESULTS TABLE CONTROLS & TABLE */}
      <div className="space-y-4">
        {/* Table Search & Status Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests, values, or units..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-700 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All ({allResults.length})
            </button>

            <button
              onClick={() => setStatusFilter("out_of_range")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "out_of_range"
                  ? "bg-rose-900/60 text-rose-200 border border-rose-700 font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-rose-300"
              }`}
            >
              Out-of-Range ({highResultsCount + lowResultsCount})
            </button>

            <button
              onClick={() => setStatusFilter("NORMAL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "NORMAL"
                  ? "bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-emerald-300"
              }`}
            >
              Normal ({normalResultsCount})
            </button>

            <button
              onClick={() => setStatusFilter("verified")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "verified"
                  ? "bg-teal-900/60 text-teal-200 border border-teal-700 font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-teal-300"
              }`}
            >
              Verified ({verifiedResultsCount})
            </button>

            <button
              onClick={() => setStatusFilter("needs_review")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === "needs_review"
                  ? "bg-amber-900/60 text-amber-200 border border-amber-700 font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-amber-300"
              }`}
            >
              Needs Review ({needsReviewCount})
            </button>
          </div>
        </div>

        {/* Structured Results Table */}
        <TestResultTable
          results={filteredResults}
          filterDocumentId={selectedDocId === "all" ? undefined : selectedDocId}
        />
      </div>

      {/* 7. LONGITUDINAL PARAMETER COMPARISON ENGINE */}
      <LongitudinalComparison documents={documents} testResults={allResults} />
    </div>
  );
}
