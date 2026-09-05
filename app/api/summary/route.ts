import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Patient, Document, TestResult } from "@/lib/types";
import {
  isMedicalAdviceRequest,
  SAFETY_REFUSAL_RESPONSE,
} from "@/lib/safetyGuardrails";

/**
 * EXACT MANDATED SYSTEM PROMPT FOR SUMMARY:
 */
const SUMMARY_SYSTEM_PROMPT = `You write short, factual, non-diagnostic summaries of a patient's medical record for
the patient to read. You describe WHAT the record contains, not what it MEANS medically.

Rules you must always follow:
- Never state or imply a diagnosis ("you may have X" is forbidden)
- Never recommend treatment, medication, or dosage changes
- Never use words like "worsening", "improving", "concerning", "dangerous"
- Only state facts already present in the data: counts of reports, counts of results,
  which results fall outside their stated reference range (call this "outside the
  reference range provided in the report", never "abnormal" or "bad")
- If a value changed between two reports, state the plain factual change
  ("changed from 11.4 to 10.2 g/dL"), nothing more
- End every summary with this exact line, verbatim:
  "MedLens organizes and explains information from your records. It does not provide
  a medical diagnosis or treatment recommendation."

Respond in 3-5 short sentences plus a bulleted stat list (reports processed, test
results extracted, results outside reference range, items needing verification).`;

const REQUIRED_DISCLAIMER_ENDING =
  "MedLens organizes and explains information from your records. It does not provide a medical diagnosis or treatment recommendation.";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      patient,
      documents = [],
      test_results = [],
      query = "",
    }: {
      patient?: Patient;
      documents?: Document[];
      test_results?: TestResult[];
      query?: string;
    } = body;

    // Hardcoded server-side safety check using shared single source of truth
    if (query && isMedicalAdviceRequest(query)) {
      return NextResponse.json({
        type: "guardrail_blocked",
        is_blocked_diagnostic_query: true,
        summary: SAFETY_REFUSAL_RESPONSE,
        provenance: "ai_generated",
      });
    }

    // Secrets must only be referenced in server-side API routes, read from environment variables
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    // Build structured context representation
    const recordPayload = {
      patient_info: patient
        ? {
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
            symptoms: patient.symptoms,
            conditions: patient.conditions,
            allergies: patient.allergies,
            medications: patient.medications,
            source: patient.source,
          }
        : null,
      documents: (documents || []).map((d) => ({
        id: d.id,
        filename: d.filename,
        document_type: d.document_type,
        document_date: d.document_date,
        laboratory: d.laboratory,
      })),
      test_results: (test_results || []).map((t) => ({
        test_name: t.test_name,
        value: t.value,
        unit: t.unit,
        reference_range:
          t.reference_min !== null && t.reference_max !== null
            ? `${t.reference_min} - ${t.reference_max}`
            : t.reference_raw_text || "Not provided",
        status: t.status,
        confidence: t.confidence,
        verification_status: t.verification_status,
      })),
    };

    let summaryText = "";

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.1,
          },
        });

        const userPrompt = `Here is the patient's structured medical record:\n${JSON.stringify(
          recordPayload,
          null,
          2
        )}\n\nWrite the non-diagnostic factual summary following the system prompt rules strictly.`;

        const result = await model.generateContent([
          { text: SUMMARY_SYSTEM_PROMPT },
          { text: userPrompt },
        ]);

        summaryText = result.response.text().trim();
      } catch {
        // Fallback to deterministic summary if API fails
        summaryText = "";
      }
    }

    if (!summaryText) {
      // Deterministic realistic synthesis following the exact prompt specification
      const totalDocs = documents.length;
      const totalTests = test_results.length;
      const outsideRange = test_results.filter(
        (t) => t.status === "HIGH" || t.status === "LOW"
      ).length;
      const needsVerification = test_results.filter(
        (t) => t.verification_status === "unverified"
      ).length;

      const patientName = patient?.name || "The patient";

      summaryText = [
        `This record contains intake data and laboratory reports for ${patientName}. A total of ${totalDocs} laboratory document${totalDocs !== 1 ? "s have" : " has"} been processed, containing ${totalTests} individual test result${totalTests !== 1 ? "s" : ""}. Currently, ${outsideRange} test result${outsideRange !== 1 ? "s fall" : " falls"} outside the reference range provided in the report, while ${needsVerification} item${needsVerification !== 1 ? "s are" : " is"} marked pending human verification.`,
        ``,
        `• Reports processed: ${totalDocs}`,
        `• Test results extracted: ${totalTests}`,
        `• Results outside reference range: ${outsideRange}`,
        `• Items needing verification: ${needsVerification}`,
        ``,
        REQUIRED_DISCLAIMER_ENDING,
      ].join("\n");
    }

    // Ensure the verbatim disclaimer is always present at the end
    if (!summaryText.includes("MedLens organizes and explains information")) {
      summaryText = `${summaryText}\n\n${REQUIRED_DISCLAIMER_ENDING}`;
    }

    return NextResponse.json({
      success: true,
      type: "factual_summary",
      is_blocked_diagnostic_query: false,
      summary: summaryText,
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
