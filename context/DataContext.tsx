"use client";

import React, { createContext, useContext, useState } from "react";
import { Patient, Document, TestResult, Conflict } from "@/lib/types";
import {
  MOCK_PATIENTS,
  MOCK_DOCUMENTS,
  MOCK_TEST_RESULTS,
  MOCK_CONFLICTS,
} from "@/lib/mockData";
import { computeTestStatus } from "@/lib/referenceRangeEngine";

interface DataContextType {
  patients: Patient[];
  documents: Document[];
  testResults: TestResult[];
  conflicts: Conflict[];
  getPatientById: (id: string) => Patient | undefined;
  getDocumentsByPatientId: (patientId: string) => Document[];
  getTestResultsByDocumentId: (docId: string) => TestResult[];
  getTestResultsByPatientId: (patientId: string) => TestResult[];
  getConflicts: () => Conflict[];
  verifyTestResult: (id: string) => void;
  editTestResult: (
    id: string,
    newValue: string,
    newUnit?: string,
    newRefMin?: number | null,
    newRefMax?: number | null
  ) => void;
  resolveConflict: (id: string) => void;
  addDocumentWithResults: (doc: Document, results: TestResult[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [testResults, setTestResults] = useState<TestResult[]>(MOCK_TEST_RESULTS);
  const [conflicts, setConflicts] = useState<Conflict[]>(MOCK_CONFLICTS);

  const getPatientById = (id: string) => patients.find((p) => p.id === id);

  const getDocumentsByPatientId = (patientId: string) =>
    documents.filter((d) => d.patient_id === patientId);

  const getTestResultsByDocumentId = (docId: string) =>
    testResults.filter((r) => r.document_id === docId);

  const getTestResultsByPatientId = (patientId: string) => {
    const docIds = documents
      .filter((d) => d.patient_id === patientId)
      .map((d) => d.id);
    return testResults.filter((r) => docIds.includes(r.document_id));
  };

  const getConflicts = () => conflicts;

  const verifyTestResult = (id: string) => {
    setTestResults((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              verification_status: "verified",
            }
          : item
      )
    );
  };

  const editTestResult = (
    id: string,
    newValue: string,
    newUnit?: string,
    newRefMin?: number | null,
    newRefMax?: number | null
  ) => {
    setTestResults((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const refMin = newRefMin !== undefined ? newRefMin : item.reference_min;
        const refMax = newRefMax !== undefined ? newRefMax : item.reference_max;
        const unit = newUnit !== undefined ? newUnit : item.unit;
        
        // Status computed purely in JS per Rule 1
        const newStatus = computeTestStatus(newValue, refMin, refMax);

        return {
          ...item,
          value: newValue,
          unit,
          reference_min: refMin,
          reference_max: refMax,
          status: newStatus,
          verification_status: "edited",
          // original_ai_value stays unchanged for audit traceability
        };
      })
    );
  };

  const resolveConflict = (id: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const addDocumentWithResults = (doc: Document, results: TestResult[]) => {
    setDocuments((prev) => [doc, ...prev]);
    // Ensure all incoming test results compute status purely via deterministic engine
    const computedResults = results.map((r) => ({
      ...r,
      status: computeTestStatus(r.value, r.reference_min, r.reference_max),
    }));
    setTestResults((prev) => [...prev, ...computedResults]);
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        documents,
        testResults,
        conflicts,
        getPatientById,
        getDocumentsByPatientId,
        getTestResultsByDocumentId,
        getTestResultsByPatientId,
        getConflicts,
        verifyTestResult,
        editTestResult,
        resolveConflict,
        addDocumentWithResults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
