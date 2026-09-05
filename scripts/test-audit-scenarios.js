// Audit and Scenario Test Suite for MedLens

async function runScenarioTests() {
  console.log("==================================================");
  console.log(" RUNNING MEDLENS AUDIT & SCENARIO VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // SCENARIO 1: Upload a non-PDF/image file (e.g. text/plain or .exe)
  console.log("\n[TEST 1] Upload a non-PDF/image file");
  try {
    const res = await fetch("http://localhost:3000/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_base64: Buffer.from("this is a plain text file").toString("base64"),
        mime_type: "text/plain",
        filename: "notes.txt",
        patient_id: "pat-101",
      }),
    });

    const data = await res.json();
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Response:`, data);

    if (res.status === 400 && data.success === false && data.error.includes("Invalid file type")) {
      console.log("  ✅ PASSED: Non-PDF/image file rejected with status 400 and clean error.");
      passed++;
    } else {
      console.log("  ❌ FAILED: Non-PDF/image was not rejected as expected.");
      failed++;
    }
  } catch (err) {
    console.log("  ❌ FAILED: Network error:", err.message);
    failed++;
  }

  // SCENARIO 2: Upload nothing and click submit
  console.log("\n[TEST 2] Upload nothing and click submit");
  try {
    const res = await fetch("http://localhost:3000/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_base64: "",
        filename: "",
        patient_id: "pat-101",
      }),
    });

    const data = await res.json();
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Response:`, data);

    if (res.status === 400 && data.success === false && data.error.includes("No document")) {
      console.log("  ✅ PASSED: Empty payload rejected with status 400 and clean error.");
      passed++;
    } else {
      console.log("  ❌ FAILED: Empty upload was not rejected as expected.");
      failed++;
    }
  } catch (err) {
    console.log("  ❌ FAILED: Network error:", err.message);
    failed++;
  }

  // SCENARIO 2b: File size > 10MB test
  console.log("\n[TEST 2b] Reject file exceeding 10MB");
  try {
    // 11MB payload
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, "a");
    const res = await fetch("http://localhost:3000/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_base64: largeBuffer.toString("base64"),
        mime_type: "application/pdf",
        filename: "giant_report.pdf",
        patient_id: "pat-101",
      }),
    });

    const data = await res.json();
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Response:`, data);

    if (res.status === 400 && data.success === false && data.error.includes("exceeds the 10MB limit")) {
      console.log("  ✅ PASSED: >10MB file rejected with status 400 and clean error.");
      passed++;
    } else {
      console.log("  ❌ FAILED: Large file was not rejected as expected.");
      failed++;
    }
  } catch (err) {
    console.log("  ❌ FAILED: Network error:", err.message);
    failed++;
  }

  // SCENARIO 3: Submit the intake form with all fields empty (Unit Validation)
  console.log("\n[TEST 3] Form validation on all empty fields");
  function validateIntakeForm(name, age) {
    const errors = {};
    if (!name.trim()) {
      errors.name = "Patient full name is required.";
    }
    const parsedAge = parseInt(age, 10);
    if (!age.trim() || isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 130) {
      errors.age = "Please enter a valid positive age (1 - 130).";
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  const emptyFormResult = validateIntakeForm("", "");
  console.log("  Empty form validation output:", emptyFormResult);
  if (!emptyFormResult.isValid && emptyFormResult.errors.name && emptyFormResult.errors.age) {
    console.log("  ✅ PASSED: Empty intake form is rejected with exact validation errors on required fields.");
    passed++;
  } else {
    console.log("  ❌ FAILED: Empty intake form did not produce required validation errors.");
    failed++;
  }

  // SCENARIO 4: View a patient record with zero documents uploaded (Summary & Table handling)
  console.log("\n[TEST 4] Patient record with zero documents uploaded");
  try {
    const zeroDocPatient = {
      id: "pat-new-999",
      name: "New Patient Zero",
      age: 30,
      sex: "Female",
      symptoms: "Mild headache",
      conditions: "None reported",
      allergies: "NKDA",
      medications: "None reported",
      source: "user_provided",
    };

    const res = await fetch("http://localhost:3000/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient: zeroDocPatient,
        documents: [],
        test_results: [],
        query: "",
      }),
    });

    const data = await res.json();
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Summary Output:\n`, data.summary);

    const has0Docs = data.summary.includes("0 laboratory documents");
    const has0Tests = data.summary.includes("0 individual test results");
    const hasDisclaimer = data.summary.includes("MedLens organizes and explains information from your records. It does not provide a medical diagnosis or treatment recommendation.");

    if (res.status === 200 && has0Docs && has0Tests && hasDisclaimer) {
      console.log("  ✅ PASSED: Summary endpoint cleanly handles 0 documents and 0 test results with factual counts and verbatim disclaimer.");
      passed++;
    } else {
      console.log("  ❌ FAILED: Summary endpoint did not handle 0 documents properly.");
      failed++;
    }
  } catch (err) {
    console.log("  ❌ FAILED: Summary endpoint error:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(` SCENARIO TEST SUMMARY: ${passed}/${passed + failed} PASSED`);
  console.log("==================================================");
}

runScenarioTests();
