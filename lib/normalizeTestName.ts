/**
 * DETERMINISTIC TEST NAME NORMALIZATION ENGINE
 *
 * Normalizes equivalent lab test names for matching and comparison ONLY.
 * Preserves the original extracted test_name for display.
 */

const NORMALIZATION_MAP: Record<string, string> = {
  // Hemoglobin & Glycemic
  hb: "hemoglobin",
  hgb: "hemoglobin",
  hemoglobin: "hemoglobin",
  "hemoglobin a": "hemoglobin",
  hba1c: "hemoglobin a1c",
  a1c: "hemoglobin a1c",
  "hemoglobin a1c": "hemoglobin a1c",
  "glycated hemoglobin": "hemoglobin a1c",
  glucose: "fasting blood glucose",
  "fasting glucose": "fasting blood glucose",
  "fasting blood glucose": "fasting blood glucose",
  "glucose, fasting": "fasting blood glucose",

  // Cell Counts
  wbc: "white blood cell count",
  "wbc count": "white blood cell count",
  "white blood cell count": "white blood cell count",
  "white blood cells": "white blood cell count",
  tlc: "white blood cell count",
  rbc: "red blood cell count",
  "rbc count": "red blood cell count",
  "red blood cell count": "red blood cell count",
  "red blood cells": "red blood cell count",
  plt: "platelet count",
  platelets: "platelet count",
  "platelet count": "platelet count",
  mcv: "mean corpuscular volume",
  "mean corpuscular volume": "mean corpuscular volume",

  // Lipids
  cholesterol: "total cholesterol",
  "total cholesterol": "total cholesterol",
  "cholesterol, total": "total cholesterol",
  hdl: "hdl cholesterol",
  "hdl cholesterol": "hdl cholesterol",
  "hdl-c": "hdl cholesterol",
  ldl: "ldl cholesterol",
  "ldl cholesterol": "ldl cholesterol",
  "ldl-c": "ldl cholesterol",
  triglycerides: "triglycerides",

  // Renal & Liver
  creatinine: "serum creatinine",
  "serum creatinine": "serum creatinine",
  "creatinine, serum": "serum creatinine",
  bun: "blood urea nitrogen",
  "blood urea nitrogen": "blood urea nitrogen",
  "uric acid": "uric acid",
  "serum uric acid": "uric acid",
  alt: "alanine aminotransferase",
  ast: "aspartate aminotransferase",
};

/**
 * Returns a normalized comparison key for matching equivalent test names.
 * Does not mutate the original extracted display label.
 */
export function getNormalizedTestName(testName: string): string {
  if (!testName || typeof testName !== "string") return "";

  // Sanitize: lowercase, strip punctuation, collapse whitespace
  const cleaned = testName
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (NORMALIZATION_MAP[cleaned]) {
    return NORMALIZATION_MAP[cleaned];
  }

  // Fallback for partial token matching
  for (const [key, normalized] of Object.entries(NORMALIZATION_MAP)) {
    if (cleaned === key || cleaned.includes(key)) {
      return normalized;
    }
  }

  return cleaned;
}

/**
 * Helper to retrieve display mapping tuple
 */
export function getNormalizedDisplayLabel(originalName: string): {
  original: string;
  normalized: string;
} {
  const normalizedKey = getNormalizedTestName(originalName);
  // Capitalize normalized key for readable display
  const normalizedLabel = normalizedKey
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    original: originalName,
    normalized: normalizedLabel,
  };
}
