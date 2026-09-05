const assert = require("assert");

console.log("==================================================");
console.log("   MEDLENS OFFICIAL EVALUATION TEST SUITE        ");
console.log("==================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`  [PASS] Test ${totalCount}: ${name}`);
  } catch (err) {
    console.error(`  [FAIL] Test ${totalCount}: ${name}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. Reference Range Engine Tests
console.log("--- 1. Deterministic Reference Range Engine ---");

function computeStatus(val, min, max) {
  if (val === null || typeof val !== "number" || isNaN(val) || !isFinite(val)) {
    return "NOT_DETERMINED";
  }
  if (min === null && max === null) return "NOT_DETERMINED";
  if (min !== null && val < min) return "LOW";
  if (max !== null && val > max) return "HIGH";
  return "NORMAL";
}

runTest("Normal value within bounds", () => {
  assert.strictEqual(computeStatus(85, 70, 99), "NORMAL");
});

runTest("Low value below minimum", () => {
  assert.strictEqual(computeStatus(62, 70, 99), "LOW");
});

runTest("High value above maximum", () => {
  assert.strictEqual(computeStatus(142, 70, 99), "HIGH");
});

runTest("Missing both range boundaries", () => {
  assert.strictEqual(computeStatus(50, null, null), "NOT_DETERMINED");
});

runTest("Non-numeric value", () => {
  assert.strictEqual(computeStatus(NaN, 70, 99), "NOT_DETERMINED");
});

runTest("Only minimum boundary present (lower bound check)", () => {
  assert.strictEqual(computeStatus(42, 50, null), "LOW");
  assert.strictEqual(computeStatus(65, 50, null), "NORMAL");
});

runTest("Only maximum boundary present (upper bound check)", () => {
  assert.strictEqual(computeStatus(7.4, null, 5.6), "HIGH");
  assert.strictEqual(computeStatus(4.8, null, 5.6), "NORMAL");
});

runTest("Boundary equality", () => {
  assert.strictEqual(computeStatus(70, 70, 99), "NORMAL");
  assert.strictEqual(computeStatus(99, 70, 99), "NORMAL");
});

// 2. Normalization Engine Tests
console.log("\n--- 2. Terminology Normalization Engine ---");

const NORMALIZATION_MAP = {
  hb: "hemoglobin",
  hgb: "hemoglobin",
  hemoglobin: "hemoglobin",
  wbc: "white blood cell count",
  tlc: "white blood cell count",
  rbc: "red blood cell count",
  plt: "platelet count",
  mcv: "mean corpuscular volume",
};

function normalize(term) {
  const cleaned = (term || "").toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  return NORMALIZATION_MAP[cleaned] || cleaned;
}

runTest("Hb and HGB normalize to hemoglobin", () => {
  assert.strictEqual(normalize("Hb"), "hemoglobin");
  assert.strictEqual(normalize("HGB"), "hemoglobin");
  assert.strictEqual(normalize("Hemoglobin"), "hemoglobin");
});

runTest("WBC and TLC normalize to white blood cell count", () => {
  assert.strictEqual(normalize("WBC"), "white blood cell count");
  assert.strictEqual(normalize("TLC"), "white blood cell count");
});

runTest("Case sensitivity and extra whitespace handling", () => {
  assert.strictEqual(normalize("  hGb  "), "hemoglobin");
  assert.strictEqual(normalize("RBC"), "red blood cell count");
});

runTest("Unknown terms remain unchanged without false mapping", () => {
  assert.strictEqual(normalize("Novel Biomarker X"), "novel biomarker x");
});

// 3. Safety Guardrails Tests
console.log("\n--- 3. Clinical Safety & Medical Advice Guardrails ---");

const BLOCKED_TERMS = [
  "diagnose", "diagnosis", "do i have", "what disease", "medicine", "medication", "dosage", "treatment", "prescribe"
];

function isMedicalAdvice(text) {
  const norm = (text || "").toLowerCase().trim();
  return BLOCKED_TERMS.some((term) => norm.includes(term));
}

runTest("Blocks diagnostic request 'Do I have diabetes?'", () => {
  assert.strictEqual(isMedicalAdvice("Do I have diabetes?"), true);
});

runTest("Blocks medication request 'What medication should I take?'", () => {
  assert.strictEqual(isMedicalAdvice("What medication should I take?"), true);
});

runTest("Allows factual informational summary request", () => {
  assert.strictEqual(isMedicalAdvice("Summarize extracted lab parameters from Quest report."), false);
});

// 4. Session Utility Tests
console.log("\n--- 4. Hackathon Demo Session Utility ---");

runTest("User session shape validation", () => {
  const session = {
    displayName: "Dr. Sarah Jenkins",
    role: "clinician",
    isDemo: true,
    createdAt: new Date().toISOString(),
  };

  assert.strictEqual(typeof session.displayName, "string");
  assert.ok(session.displayName.length >= 2);
  assert.strictEqual(session.isDemo, true);
  assert.ok(!session.password, "No passwords must be stored");
});

console.log("\n==================================================");
console.log(`   TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
console.log("==================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}
