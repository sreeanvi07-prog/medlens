// Unit test suite for computeStatus pure function

function computeStatus(value, referenceMin, referenceMax) {
  if (value === null || typeof value !== "number" || isNaN(value) || !isFinite(value)) {
    return "NOT_DETERMINED";
  }

  if (referenceMin === null && referenceMax === null) {
    return "NOT_DETERMINED";
  }

  if (referenceMin !== null && value < referenceMin) {
    return "LOW";
  }

  if (referenceMax !== null && value > referenceMax) {
    return "HIGH";
  }

  return "NORMAL";
}

const unitTests = [
  {
    name: "1. Normal Value Test",
    value: 85,
    min: 70,
    max: 99,
    expected: "NORMAL",
  },
  {
    name: "2. Low Value Test",
    value: 45,
    min: 50,
    max: 100,
    expected: "LOW",
  },
  {
    name: "3. High Value Test",
    value: 142,
    min: 70,
    max: 99,
    expected: "HIGH",
  },
  {
    name: "4. Missing Range Test",
    value: 100,
    min: null,
    max: null,
    expected: "NOT_DETERMINED",
  },
  {
    name: "5. Non-numeric Value Test",
    value: null,
    min: 70,
    max: 99,
    expected: "NOT_DETERMINED",
  },
];

console.log("==================================================");
console.log(" RUNNING 5 REQUIRED REFERENCE RANGE UNIT TESTS");
console.log("==================================================");

let passedCount = 0;

for (const t of unitTests) {
  const result = computeStatus(t.value, t.min, t.max);
  const passed = result === t.expected;
  if (passed) passedCount++;

  console.log(`Test: ${t.name}`);
  console.log(`  Input:    value=${t.value}, min=${t.min}, max=${t.max}`);
  console.log(`  Expected: ${t.expected}`);
  console.log(`  Actual:   ${result}`);
  console.log(`  Status:   ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  console.log("--------------------------------------------------");
}

console.log(`\nSummary: ${passedCount}/${unitTests.length} tests passed.`);

if (passedCount !== unitTests.length) {
  process.exit(1);
}
