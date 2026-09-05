/**
 * SHARED CLINICAL SAFETY & MEDICAL ADVICE GUARDRAILS
 *
 * Mandatory safety guardrail enforced on both client and server side.
 * Blocks diagnostic, treatment, or prescribing inquiries before sending text to AI.
 */

const BLOCKED_TERMS = [
  "diagnose",
  "diagnosis",
  "do i have",
  "what disease",
  "what condition",
  "medicine",
  "medication",
  "should i take",
  "dosage",
  "dose",
  "treatment",
  "cure",
  "prescribe",
  "stop medication",
  "change medication",
  "is this dangerous",
  "what should i do",
  "what ought i do",
  "am i sick",
  "what cure",
  "recommend drug",
];

export const SAFETY_REFUSAL_RESPONSE =
  "MedLens is designed to organize and explain the information in your records. It cannot diagnose conditions, prescribe medication, or recommend dosage changes.";

/**
 * Evaluates whether free text contains requests for medical diagnosis, treatment, or prescribing recommendations.
 */
export function isMedicalAdviceRequest(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  const normalized = text.toLowerCase().trim();

  return BLOCKED_TERMS.some((term) => normalized.includes(term));
}

/**
 * Sanitizes input text before sending to AI endpoints.
 */
export function sanitizeTextForAI(text: string): string {
  if (!text) return "";
  // Strip control characters, preserve plain unicode text
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}
