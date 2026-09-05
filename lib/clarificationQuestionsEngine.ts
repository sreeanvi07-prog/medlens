import { Patient, Document, TestResult, Conflict } from "./types";

export interface ClarificationQuestion {
  id: string;
  question: string;
  category: "missing_info" | "conflict" | "unclear_detail";
  field: string;
  provenance: "AI Generated" | "System Generated";
}

/**
 * Deterministically generates clarification questions based on missing report data,
 * unprovided reference ranges, missing units, or identified intake conflicts.
 */
export function generateClarificationQuestions(
  patient: Patient,
  documents: Document[],
  testResults: TestResult[],
  conflicts: Conflict[]
): ClarificationQuestion[] {
  const questions: ClarificationQuestion[] = [];

  // 1. Missing Report Date in Document
  documents.forEach((doc) => {
    if (!doc.document_date || doc.document_date.trim() === "") {
      questions.push({
        id: `q-docdate-${doc.id}`,
        question: `The report "${doc.filename}" is missing an explicit specimen collection date. What date was this sample drawn?`,
        category: "missing_info",
        field: "Document Date",
        provenance: "System Generated",
      });
    }
  });

  // 2. Test Results missing reference range or unit
  testResults.forEach((res) => {
    if (res.reference_min === null && res.reference_max === null && res.status === "NOT_DETERMINED") {
      questions.push({
        id: `q-ref-${res.id}`,
        question: `The result for "${res.test_name}" (${res.value} ${res.unit || ""}) does not list a reference range in the source document. What reference range is printed on your lab sheet?`,
        category: "missing_info",
        field: res.test_name,
        provenance: "System Generated",
      });
    }

    if (!res.unit || res.unit.trim() === "") {
      questions.push({
        id: `q-unit-${res.id}`,
        question: `The test result "${res.test_name}" (value: ${res.value}) is reported without a unit of measurement. What unit does the lab report use?`,
        category: "unclear_detail",
        field: res.test_name,
        provenance: "System Generated",
      });
    }
  });

  // 3. Identified Conflicts
  conflicts
    .filter((c) => !c.resolved)
    .forEach((c) => {
      questions.push({
        id: `q-conf-${c.id}`,
        question: `A difference was detected for ${c.field_name}: "${c.value_a}" (${c.source_a}) vs "${c.value_b}" (${c.source_b}). Which value reflects your current record?`,
        category: "conflict",
        field: c.field_name,
        provenance: "System Generated",
      });
    });

  // 4. Intake Symptom & Allergy Timing Clarification
  if (patient.symptoms && patient.symptoms.trim() !== "" && patient.symptoms !== "None reported") {
    questions.push({
      id: `q-symp-${patient.id}`,
      question: `Reported symptoms include "${patient.symptoms}". When did these symptoms first begin and how frequently do they occur?`,
      category: "unclear_detail",
      field: "Symptoms",
      provenance: "System Generated",
    });
  }

  if (patient.allergies && !patient.allergies.toLowerCase().includes("nkda") && patient.allergies !== "None reported") {
    questions.push({
      id: `q-all-${patient.id}`,
      question: `Allergies listed: "${patient.allergies}". Have you experienced any recent reaction or updated allergy testing for these medications?`,
      category: "unclear_detail",
      field: "Allergies",
      provenance: "System Generated",
    });
  }

  // Deduplicate and return up to 5 concise questions
  return questions.slice(0, 5);
}
