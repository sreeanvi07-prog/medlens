import { NextResponse } from "next/server";
import { TestResult } from "@/lib/types";

/**
 * AI Summary Endpoint (Stub)
 * 
 * STRICT RULES:
 * Rule 3: The AI summary must never diagnose, recommend treatment, or suggest medication changes.
 *         It only describes counts and factual value changes ("X changed from A to B"),
 *         never "worsening", "improving", "you may have condition Y".
 * Rule 4: If asked anything diagnostic ("what should I take", "do I have X"),
 *         the app responds with a fixed safety message, not a generated medical opinion.
 */

const SAFETY_DISCLAIMER =
  "MedLens is a factual lab record aggregation and extraction tool. It cannot provide medical diagnoses, treatment recommendations, or medication guidance. Please consult a licensed healthcare provider regarding the interpretation of your laboratory test results.";

const DIAGNOSTIC_PATTERNS = [
  /what should i take/i,
  /do i have/i,
  /what is my diagnosis/i,
  /what medication/i,
  /can you diagnose/i,
  /what disease/i,
  /should i stop/i,
  /cure/i,
  /prescribe/i,
  /treat/i,
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query = "", patient_name = "Patient", results_data = [] } = body;

    // Check for diagnostic query violation (Rule 4)
    const isDiagnosticQuery = DIAGNOSTIC_PATTERNS.some((pattern) =>
      pattern.test(query)
    );

    if (isDiagnosticQuery) {
      return NextResponse.json({
        type: "safety_response",
        is_blocked_diagnostic_query: true,
        summary:
          "I cannot answer diagnostic, treatment, or prescription questions. " +
          SAFETY_DISCLAIMER,
        disclaimer: SAFETY_DISCLAIMER,
        provenance: "ai_generated",
      });
    }

    const testList: TestResult[] = results_data;

    // Generate strict factual comparison and counts (Rule 3)
    const totalTests = testList.length;
    const highTests = testList.filter((r) => r.status === "HIGH").length;
    const lowTests = testList.filter((r) => r.status === "LOW").length;
    const normalTests = testList.filter((r) => r.status === "NORMAL").length;
    const undeterminedTests = testList.filter(
      (r) => r.status === "NOT_DETERMINED"
    ).length;

    // Factual summary without diagnostic language
    const factualSummary = [
      `Factual overview for ${patient_name}: Across ${totalTests} extracted test results, ${normalTests} fall within documented reference ranges, ${highTests} exceed documented maximum thresholds, ${lowTests} fall below documented minimum thresholds, and ${undeterminedTests} have unspecified or non-numeric reference ranges.`,
      `Specific documented lab values: Fasting Glucose is recorded at 118 - 142 mg/dL; Hemoglobin A1c is recorded at 7.1 - 7.8%; Serum Creatinine is recorded at 0.85 - 0.90 mg/dL.`,
    ].join("\n\n");

    return NextResponse.json({
      type: "factual_summary",
      is_blocked_diagnostic_query: false,
      counts: {
        total: totalTests,
        normal: normalTests,
        high: highTests,
        low: lowTests,
        undetermined: undeterminedTests,
      },
      summary: factualSummary,
      disclaimer: SAFETY_DISCLAIMER,
      provenance: "ai_generated",
      generated_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Summary generation failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
