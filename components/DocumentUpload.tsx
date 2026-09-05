"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Code2,
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

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  patientId,
  patientName,
  onSuccess,
}) => {
  const { addDocumentWithResults } = useData();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g)$/i)) {
      setErrorMessage("Please upload a valid PDF or Image file (PDF, PNG, JPG).");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setExtractedData(null);
    setCommitted(false);
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    setLoadingState("analyzing");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patient_id", patientId);

      // Visual step indicator
      setTimeout(() => {
        setLoadingState((prev) => (prev === "analyzing" ? "extracting" : prev));
      }, 1200);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to extract document information.");
      }

      setExtractedData(data);
      setLoadingState("success");
    } catch (err: unknown) {
      setLoadingState("error");
      const msg = err instanceof Error ? err.message : "Error during document extraction.";
      setErrorMessage(msg);
    }
  };

  const handleCommitToRecord = () => {
    if (!extractedData) return;

    // Add to shared data context
    addDocumentWithResults(
      extractedData.document,
      extractedData.extracted_results
    );

    setCommitted(true);
    if (onSuccess) {
      onSuccess(extractedData.document, extractedData.extracted_results);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setLoadingState("idle");
    setErrorMessage(null);
    setCommitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Document Upload & AI Extraction Pipeline
            </h3>
            <ProvenanceBadge type="document_extracted" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Module 2: Direct vision extraction of lab values, bounds, and verbatim source snippets for {patientName}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>No AI Status Calculation (Rule 1)</span>
        </div>
      </div>

      {!extractedData ? (
        <div className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-teal-500 bg-teal-950/20"
                : selectedFile
                ? "border-indigo-500/60 bg-indigo-950/20"
                : "border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI Extraction
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag and drop your lab report here, or{" "}
                    <span className="text-teal-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts PDF, PNG, JPG / JPEG (Lab reports, blood tests, panels)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button & Loading Progress */}
          {selectedFile && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <FileType className="w-4 h-4 text-indigo-400" />
                <span>Selected: <code className="text-slate-200">{selectedFile.name}</code></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loadingState === "analyzing" || loadingState === "extracting"}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleUploadAndExtract}
                  disabled={loadingState === "analyzing" || loadingState === "extracting"}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loadingState === "analyzing" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing document...</span>
                    </>
                  ) : loadingState === "extracting" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting information...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Extract Lab Values with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Extraction Success State & Raw JSON Quality Review */
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  AI Extraction Successful
                </h4>
                <p className="text-xs text-slate-300">
                  Extracted {extractedData.extracted_results.length} lab test results from &quot;{extractedData.document.filename}&quot;.
                </p>
              </div>
            </div>

            <ProvenanceBadge type="document_extracted" size="xs" />
          </div>

          {/* Document Metadata Extracted */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Document Type</span>
              <span className="font-bold text-white">{extractedData.document.document_type}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Laboratory</span>
              <span className="font-bold text-white">{extractedData.document.laboratory}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Document Date</span>
              <span className="font-bold text-white">{extractedData.document.document_date}</span>
            </div>
          </div>

          {/* Module 2 Requirement: Show plain list of extracted tests as raw JSON temporarily */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-teal-400" />
                Raw Extracted JSON Review (Quality Audit)
              </span>
              <span className="text-[11px] text-slate-500">
                Rule 1: Status = <code>NOT_DETERMINED</code> until pure engine evaluation
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-teal-300 max-h-64 overflow-y-auto">
              <pre>{JSON.stringify(extractedData.raw_extraction_json, null, 2)}</pre>
            </div>
          </div>

          {/* Actions: Commit to DataContext or Upload Another */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Upload Another Document
            </button>

            {!committed ? (
              <button
                onClick={handleCommitToRecord}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <span>Commit & Evaluate with Deterministic Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Added to Patient Record! Updated table below.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
