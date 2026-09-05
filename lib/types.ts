export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  symptoms: string;
  conditions: string;
  allergies: string;
  medications: string;
  source: "user_provided";
}

export interface Document {
  id: string;
  patient_id: string;
  filename: string;
  upload_date: string;
  document_type: string;
  document_date: string;
  laboratory: string;
}

export interface TestResult {
  id: string;
  document_id: string;
  test_name: string;
  value: string;
  unit: string;
  reference_min: number | null;
  reference_max: number | null;
  reference_raw_text: string;
  status: "LOW" | "NORMAL" | "HIGH" | "NOT_DETERMINED";
  source_snippet: string;
  confidence: number;
  provenance: "document_extracted";
  verification_status: "unverified" | "verified" | "edited";
  original_ai_value: string;
}

export interface Conflict {
  id: string;
  field_name: string;
  value_a: string;
  source_a: string;
  value_b: string;
  source_b: string;
  resolved: boolean;
}
