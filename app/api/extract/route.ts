import { NextResponse } from "next/server";

/**
 * AI Document Extraction API Endpoint (Stub)
 * 
 * RULE 1:
 * The LLM extracts reference_min, reference_max, and reference_raw_text.
 * It NEVER computes status. Status is computed in plain JS code.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { document_id = "doc-stub", text = "" } = body;

    // Simulated extracted test results from AI OCR / Parser
    // Notice: status is left to referenceRangeEngine
    const mockExtractedResults = [
      {
        id: `ext-${Date.now()}-1`,
        document_id,
        test_name: "Fasting Blood Glucose",
        value: "135",
        unit: "mg/dL",
        reference_min: 70,
        reference_max: 99,
        reference_raw_text: "70 - 99 mg/dL",
        source_snippet: "Fasting Plasma Glucose: 135 mg/dL (Reference: 70 - 99 mg/dL)",
        confidence: 0.98,
        provenance: "document_extracted" as const,
        verification_status: "unverified" as const,
        original_ai_value: "135",
      },
      {
        id: `ext-${Date.now()}-2`,
        document_id,
        test_name: "Serum Potassium",
        value: "4.8",
        unit: "mmol/L",
        reference_min: 3.5,
        reference_max: 5.1,
        reference_raw_text: "3.5 - 5.1 mmol/L",
        source_snippet: "Potassium, Serum: 4.8 mmol/L [3.5 - 5.1 mmol/L]",
        confidence: 0.97,
        provenance: "document_extracted" as const,
        verification_status: "unverified" as const,
        original_ai_value: "4.8",
      },
      {
        id: `ext-${Date.now()}-3`,
        document_id,
        test_name: "Triglycerides",
        value: "185",
        unit: "mg/dL",
        reference_min: null,
        reference_max: 150,
        reference_raw_text: "< 150 mg/dL",
        source_snippet: "Triglycerides: 185 mg/dL (Desirable: < 150 mg/dL)",
        confidence: 0.95,
        provenance: "document_extracted" as const,
        verification_status: "unverified" as const,
        original_ai_value: "185",
      },
    ];

    return NextResponse.json({
      success: true,
      extracted_at: new Date().toISOString(),
      document_id,
      input_length: text.length,
      extracted_results: mockExtractedResults,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
