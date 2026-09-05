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

export function parseNumericValue(valueStr: string): number | null {
  if (!valueStr || typeof valueStr !== "string") return null;
  
  // Remove common non-numeric prefix symbols like <, >, <=, >=, ~
  const cleaned = valueStr.trim().replace(/^[<>~=]\s*/, "");
  const num = parseFloat(cleaned);
  
  return isNaN(num) || !isFinite(num) ? null : num;
}

export function computeTestStatus(
  value: string | number,
  reference_min: number | null,
  reference_max: number | null
): TestResult["status"] {
  // If no reference bounds are present, status cannot be determined
  if (reference_min === null && reference_max === null) {
    return "NOT_DETERMINED";
  }

  const numVal = typeof value === "number" ? value : parseNumericValue(value);
  
  // If value is non-numeric (e.g., "Negative", "Reactive", "Trace") and no bounds match
  if (numVal === null) {
    return "NOT_DETERMINED";
  }

  // Case 1: Both min and max exist (standard range e.g., 70 - 99 mg/dL)
  if (reference_min !== null && reference_max !== null) {
    if (numVal < reference_min) {
      return "LOW";
    }
    if (numVal > reference_max) {
      return "HIGH";
    }
    return "NORMAL";
  }

  // Case 2: Only minimum exists (e.g., > 50 mg/dL)
  if (reference_min !== null && reference_max === null) {
    if (numVal < reference_min) {
      return "LOW";
    }
    return "NORMAL";
  }

  // Case 3: Only maximum exists (e.g., < 100 mg/dL)
  if (reference_min === null && reference_max !== null) {
    if (numVal > reference_max) {
      return "HIGH";
    }
    return "NORMAL";
  }

  return "NOT_DETERMINED";
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
