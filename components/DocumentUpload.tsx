"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileType,
} from "lucide-react";
import { Document, TestResult } from "@/lib/types";
import { ProvenanceBadge } from "./ProvenanceBadge";
import { useData } from "@/context/DataContext";

interface DocumentUploadProps {
  patientId: string;
  patientName: string;
  onSuccess?: (doc: Document, results: TestResult[]) => void;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_PASTED_TEXT_CHARS = 10000;

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  patientId,
  patientName,
  onSuccess,
}) => {
  const { addDocumentWithResults } = useData();

  const [inputTab, setInputTab] = useState<"file" | "text">("file");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [loadingState, setLoadingState] = useState<
    "idle" | "analyzing" | "extracting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extraction payload
  const [extractedData, setExtractedData] = useState<{
    document: Document;
    extracted_results: TestResult[];
    raw_extraction_json: unknown;
  } | null>(null);

  const [committed, setCommitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file) {
      setErrorMessage("No file selected.");
      return;
    }

    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
    const hasValidExt = /\.(pdf|png|jpe?g)$/i.test(file.name);

    if (!hasValidMime && !hasValidExt) {
      setSelectedFile(null);
      setErrorMessage("Invalid file type. Only PDF and image files (PDF, PNG, JPG) are supported.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit.`);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    uploadAndExtractFile(file);
  };

  const uploadAndExtractFile = async (file: File) => {
    setLoadingState("extracting");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", patientId);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Document extraction failed.");
      }

      setExtractedData({
        document: data.document,
        extracted_results: data.extracted_results,
        raw_extraction_json: data.raw_extraction_json,
      });
      setLoadingState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Extraction failed";
      setErrorMessage(msg);
      setLoadingState("error");
    }
  };

  const handlePastedTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setErrorMessage("Please paste report text before submitting.");
      return;
    }

    if (trimmed.length > MAX_PASTED_TEXT_CHARS) {
      setErrorMessage(`Pasted text exceeds maximum character limit (${MAX_PASTED_TEXT_CHARS}).`);
      return;
    }

    setLoadingState("extracting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          pasted_text: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Pasted text extraction failed.");
      }

      setExtractedData({
        document: data.document,
        extracted_results: data.extracted_results,
        raw_extraction_json: data.raw_extraction_json,
      });
      setLoadingState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pasted text extraction failed";
      setErrorMessage(msg);
      setLoadingState("error");
    }
  };

  const handleTryDemoDocument = async () => {
    setLoadingState("extracting");
    setErrorMessage(null);

    const demoText = `SYNTHETIC DEMO DATA — NOT A REAL MEDICAL RECORD
Fasting Blood Glucose: 138 mg/dL (Ref: 70 - 99 mg/dL)
Hemoglobin A1c: 7.4 % (Ref: < 5.7 %)
Serum Creatinine: 0.92 mg/dL (Ref: 0.50 - 1.10 mg/dL)
HDL Cholesterol: 42 mg/dL (Ref: > 50 mg/dL)
Urine Protein: Negative (Ref: not provided)`;

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          pasted_text: demoText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Demo extraction failed.");
      }

      setExtractedData({
        document: {
          ...data.document,
          filename: "SYNTHETIC_DEMO_REPORT.pdf",
          laboratory: "Synthetic Demo Lab",
        },
        extracted_results: data.extracted_results,
        raw_extraction_json: data.raw_extraction_json,
      });
      setLoadingState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo extraction failed";
      setErrorMessage(msg);
      setLoadingState("error");
    }
  };

  const handleCommitToPatientRecord = () => {
    if (!extractedData) return;

    addDocumentWithResults(extractedData.document, extractedData.extracted_results);
    setCommitted(true);

    if (onSuccess) {
      onSuccess(extractedData.document, extractedData.extracted_results);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPastedText("");
    setLoadingState("idle");
    setErrorMessage(null);
    setExtractedData(null);
    setCommitted(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-400" />
            Medical Report Processing
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Extract lab parameters with source snippets for patient:{" "}
            <strong className="text-teal-300">{patientName}</strong>
          </p>
        </div>

        {/* Input Method Selector Tabs & Try Demo Document */}
        {!extractedData && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setInputTab("file");
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                inputTab === "file"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileType className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputTab("text");
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                inputTab === "text"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Report Text</span>
            </button>

            <button
              type="button"
              onClick={handleTryDemoDocument}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60"
            >
              <span>Try demo document</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-medium text-[11px] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Upload / Paste Body */}
      {!extractedData && loadingState === "idle" && (
        <>
          {inputTab === "file" ? (
            /* File Upload Zone */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-teal-400 bg-teal-950/30 scale-[0.99]"
                  : "border-slate-700/80 bg-slate-950/40 hover:border-teal-500/60 hover:bg-slate-950/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-teal-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <UploadCloud className="w-6 h-6 stroke-[2]" />
              </div>

              <h4 className="text-sm font-semibold text-white">
                {selectedFile ? (
                  <span className="text-teal-300 font-mono">Selected: {selectedFile.name}</span>
                ) : (
                  <>
                    Drag and drop medical report here, or{" "}
                    <span className="text-teal-400 hover:underline">browse file</span>
                  </>
                )}
              </h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Supports PDF, PNG, JPG files up to 10MB
              </p>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                  <span>Deterministic range engine • OWASP validated uploads</span>
                </div>
                <span className="text-amber-400 font-medium">
                  • Do not upload real patient records for this prototype.
                </span>
              </div>
            </div>
          ) : (
            /* Pasted Report Text Form */
            <form onSubmit={handlePastedTextSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="pastedText"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Paste Lab Report Text
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {pastedText.length} / {MAX_PASTED_TEXT_CHARS} chars
                </span>
              </div>

              <textarea
                id="pastedText"
                rows={6}
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                maxLength={MAX_PASTED_TEXT_CHARS}
                placeholder="Paste lab report contents here (e.g. Glucose: 138 mg/dL (Ref: 70-99), HbA1c: 7.4%)..."
                className="w-full p-3.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Source recorded as: <strong>Pasted report text</strong>
                </span>

                <button
                  type="submit"
                  disabled={!pastedText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>Extract from Text</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Loading Extraction State */}
      {loadingState === "extracting" && (
        <div className="py-12 text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-3 border-teal-500 border-t-transparent animate-spin mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-white">
              Extracting Laboratory Data...
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Extracting raw bounds and verbatim snippets without altering source values.
            </p>
          </div>
        </div>
      )}

      {/* Extracted Evidence Preview & Commit */}
      {extractedData && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-600 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Extraction Complete: {extractedData.extracted_results.length} Parameters Found
                </h4>
                <p className="text-[11px] text-teal-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>Document: {extractedData.document.filename} • Lab: {extractedData.document.laboratory}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    SYNTHETIC DEMO DATA — NOT A REAL MEDICAL RECORD
                  </span>
                </p>
              </div>
            </div>

            {!committed ? (
              <button
                type="button"
                onClick={handleCommitToPatientRecord}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Patient Record</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved to Record</span>
              </span>
            )}
          </div>

          {/* Results Table Preview */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Test Parameter</th>
                  <th className="p-3">Extracted Value</th>
                  <th className="p-3">Reference Range</th>
                  <th className="p-3">Source Snippet</th>
                  <th className="p-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {extractedData.extracted_results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">
                      {res.test_name}
                    </td>
                    <td className="p-3 font-mono font-bold text-teal-300">
                      {res.value} {res.unit}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {res.reference_raw_text}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 italic max-w-xs truncate">
                      &quot;{res.source_snippet}&quot;
                    </td>
                    <td className="p-3">
                      <ProvenanceBadge type="document_extracted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Process Another Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
