# MedLens — Clinical Provenance & Laboratory Extraction Platform

> **Core Positioning**: *"AI extracts. Code validates. Evidence explains. Humans verify."*

MedLens is an information-intelligence and organization system for medical records and laboratory reports. It is **NOT** a diagnostic, treatment, or prescribing system.

---

## 📋 Official Requirement Mapping

| Requirement | Category | Status | Code Location |
|---|---|---|---|
| **1. Patient Intake Form** | MUST HAVE | `COMPLETE` | [`app/patient/new/page.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/app/patient/new/page.tsx) |
| **2. Medical Report Processing** | MUST HAVE | `COMPLETE` | [`components/DocumentUpload.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/DocumentUpload.tsx), [`app/api/extract/route.ts`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/app/api/extract/route.ts) |
| **3. Structured Medical Record** | MUST HAVE | `COMPLETE` | [`app/patient/[id]/page.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/app/patient/[id]/page.tsx) |
| **4. Reference-Range Awareness** | MUST HAVE | `COMPLETE` | [`lib/referenceRangeEngine.ts`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/lib/referenceRangeEngine.ts) |
| **5. Source Tagging (Provenance)** | MUST HAVE | `COMPLETE` | [`components/ProvenanceBadge.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/ProvenanceBadge.tsx) |
| **6. AI Non-Diagnostic Summary** | MUST HAVE | `COMPLETE` | [`components/AIAnalysisSummary.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/AIAnalysisSummary.tsx), [`app/api/summary/route.ts`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/app/api/summary/route.ts) |
| **7. Conflict Detection** | SHOULD HAVE | `COMPLETE` | [`components/ConflictViewer.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/ConflictViewer.tsx) |
| **8. Clarification Questions** | SHOULD HAVE | `COMPLETE` | [`lib/clarificationQuestionsEngine.ts`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/lib/clarificationQuestionsEngine.ts), [`components/ClarificationQuestions.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/ClarificationQuestions.tsx) |
| **9. Human Review & Correction** | SHOULD HAVE | `COMPLETE` | [`components/TestResultTable.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/TestResultTable.tsx) |
| **10. Longitudinal Comparison** | NICE TO HAVE | `COMPLETE` | [`components/LongitudinalComparison.tsx`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/components/LongitudinalComparison.tsx), [`lib/normalizeTestName.ts`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/lib/normalizeTestName.ts) |

---

## 🔄 Workflow Pipeline

MedLens enforces a strict 7-stage information processing workflow visible across the application:

```
Input received → Information extracted → Data validated → Terms normalized → Reference ranges analyzed → Insights prepared → Human review available
```

1. **Input**: PDF upload, PNG/JPG image upload, or pasted report text.
2. **Extraction**: LLM extracts raw fields (`test_name`, `value`, `unit`, printed range, verbatim `source_snippet`).
3. **Validation**: OWASP security checks (file signatures, 10MB limit, mime allowlist, JSON schema validation).
4. **Normalization**: Deterministic terminology normalization mapping equivalent test names (`Hb` → `hemoglobin`).
5. **Analysis**: Pure JavaScript reference range computation (`computeStatus`). AI **never** computes status.
6. **Insight**: Non-diagnostic factual summary generation & clarification question synthesis.
7. **Human Review**: Interactive verification, editing (preserving original AI value), and flagging.

---

## 🛡️ Safety & Clinical Disclaimers

> ⚠️ **WARNING**: MedLens organizes and explains information from your records. It does not provide a medical diagnosis or treatment recommendation. Do NOT upload real patient records to this hackathon prototype.

- **Client & Server Guardrails**: All AI requests are screened by `isMedicalAdviceRequest` in [`lib/safetyGuardrails.ts`](file:///c:/Users/Sreeveena/OneDrive/Desktop/medlens-ai/medlens/lib/safetyGuardrails.ts). Diagnostic or prescribing inquiries are automatically blocked before calling AI models.
- **Factual Language Enforcement**: Neutral terminology is strictly required (`"Below reported reference range"`, `"Within reported reference range"`, `"Above reported reference range"`). Subjective diagnostic terms (`"abnormal"`, `"bad"`, `"dangerous"`, `"worsening"`, `"improving"`) are forbidden.

---

## 🔐 Demo Sign-In & Privacy

- Root `/` displays the **MedLens Demo Sign In** portal.
- Stored session (`sessionStorage` with `localStorage` fallback) contains only non-sensitive metadata (`displayName`, `role`, `isDemo: true`, `createdAt`).
- No passwords, API keys, uploaded documents, or patient records are stored in the session.
- Unauthenticated access to `/dashboard`, `/patient/new`, or `/patient/[id]` is guarded and automatically redirected to `/`.

---

## 🚀 Local Setup & Testing

### Prerequisites
Node.js 18+ and npm installed.

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file in the root directory (must remain ignored by git):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Testing Commands
```bash
# Run unit test suite (Reference Engine, Normalization, Guardrails, Session, Clarification)
npm test

# Run ESLint validation
npm run lint

# Run Next.js production build
npm run build
```

---

## ☁️ Vercel Deployment Instructions

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure the following environment variable in the Vercel Dashboard:
   - `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
4. Deploy. Next.js 14 App Router routes will build statically and dynamically as configured.

---

## ⚠️ Prototype Limitations

- **Hackathon Sandbox**: This system is a hackathon prototype designed for synthetic demo evaluation.
- **Client-Side Data Context**: State management uses React Context for local demonstration purposes.
- **Non-Production Authentication**: Authentication uses typed demo session tokens without database password hashing.
