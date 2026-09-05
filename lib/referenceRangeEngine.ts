import { TestResult } from "./types";

/**
 * PURE DETERMINISTIC REFERENCE RANGE ENGINE
 * 
 * Strict Rule 1:
 * - The LLM extracts reference_min/reference_max/reference_raw_text.
 * - It NEVER computes status.
 * - Status is computed in plain JS code:
 *     if value < min → LOW
 *     if value > max → HIGH
 *     if within range → NORMAL
 *     if no range found or unparseable → NOT_DETERMINED
 * - Never let the AI invent a reference range.
 */

export function parseNumericValue(valueStr: string | number | null | undefined): number | null {
  if (valueStr === null || valueStr === undefined) return null;
  if (typeof valueStr === "number") {
    return isNaN(valueStr) || !isFinite(valueStr) ? null : valueStr;
  }
  
  if (typeof valueStr !== "string") return null;
  
  // Clean prefix symbols like <, >, <=, >=, ~
  const cleaned = valueStr.trim().replace(/^[<>~=]\s*/, "");
  const num = parseFloat(cleaned);
  
  return isNaN(num) || !isFinite(num) ? null : num;
}

/**
 * Pure function with no AI calls computing status strictly from numeric value and reference bounds
 */
export function computeStatus(
  value: number | null,
  referenceMin: number | null,
  referenceMax: number | null
): "LOW" | "NORMAL" | "HIGH" | "NOT_DETERMINED" {
  // If value is null, NaN, or not a finite number
  if (value === null || typeof value !== "number" || isNaN(value) || !isFinite(value)) {
    return "NOT_DETERMINED";
  }

  // If both referenceMin and referenceMax are null (no range provided)
  if (referenceMin === null && referenceMax === null) {
    return "NOT_DETERMINED";
  }

  // If value falls below minimum bound
  if (referenceMin !== null && value < referenceMin) {
    return "LOW";
  }

  // If value exceeds maximum bound
  if (referenceMax !== null && value > referenceMax) {
    return "HIGH";
  }

  // Otherwise within reference bounds
  return "NORMAL";
}

/**
 * Helper to compute status directly from string or number values
 */
export function computeTestStatus(
  value: string | number | null,
  reference_min: number | null,
  reference_max: number | null
): TestResult["status"] {
  const numericVal = typeof value === "number" ? value : parseNumericValue(value);
  return computeStatus(numericVal, reference_min, reference_max);
}

/**
 * Format reference range for display
 */
export function formatReferenceRange(
  reference_min: number | null,
  reference_max: number | null,
  reference_raw_text?: string
): string {
  if (reference_min !== null && reference_max !== null) {
    return `${reference_min} - ${reference_max}`;
  }
  if (reference_min !== null) {
    return `≥ ${reference_min}`;
  }
  if (reference_max !== null) {
    return `≤ ${reference_max}`;
  }
  if (reference_raw_text && reference_raw_text.trim().length > 0) {
    return reference_raw_text;
  }
  return "None specified";
}
