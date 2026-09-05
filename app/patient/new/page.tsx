"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Patient } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { SafetyBanner } from "@/components/SafetyBanner";

export default function NewPatientIntakePage() {
  const { addPatient } = useData();

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male");
  const [symptoms, setSymptoms] = useState("");
  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  // Submission success state holding the created patient object
  const [submittedPatient, setSubmittedPatient] = useState<Patient | null>(null);

  const validate = () => {
    const newErrors: { name?: string; age?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Patient full name is required.";
    }

    const parsedAge = parseInt(age, 10);
    if (!age.trim() || isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 130) {
      newErrors.age = "Please enter a valid positive age (1 - 130).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Exact Patient Schema matching /lib/types.ts
    // Every intake field source is hardcoded to "user_provided"
    const newPatient: Patient = {
      id: `pat-${Date.now().toString(36)}`,
      name: name.trim(),
      age: parseInt(age, 10),
      sex,
      symptoms: symptoms.trim() || "None reported",
      conditions: conditions.trim() || "None reported",
      allergies: allergies.trim() || "No known drug allergies (NKDA)",
      medications: medications.trim() || "None reported",
      source: "user_provided",
    };

    // Store in deterministic shared context
    addPatient(newPatient);
    setSubmittedPatient(newPatient);
  };

  const handleReset = () => {
    setName("");
    setAge("");
    setSex("Male");
    setSymptoms("");
    setConditions("");
    setAllergies("");
    setMedications("");
    setErrors({});
    setSubmittedPatient(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumbs & Clinical Disclaimer */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <SafetyBanner compact />
      </div>

      {submittedPatient ? (
        /* Post-Submission Summary Card */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Patient Intake Record Successfully Created
              </h2>
              <p className="text-xs text-emerald-300 mt-1">
                Deterministic patient profile initialized. All intake parameters are registered with <strong>👤 User Provided</strong> provenance.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">
                  {submittedPatient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {submittedPatient.name}
                    </h3>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-xs text-slate-400">
                    ID: <code className="text-teal-300 font-mono">{submittedPatient.id}</code> • {submittedPatient.age} yrs • {submittedPatient.sex}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ProvenanceBadge type="user_provided" size="sm" />
              </div>
            </div>

            {/* Field Breakdown with Provenance Badges on EVERY field */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified Intake Fields (Data Model Schema)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {/* Full Name */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Full Name</span>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-slate-100 font-medium">{submittedPatient.name}</p>
                </div>

                {/* Age & Biological Sex */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Age & Sex</span>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-slate-100 font-medium">
                    {submittedPatient.age} years old • {submittedPatient.sex}
                  </p>
                </div>

                {/* Reported Symptoms */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Reported Symptoms</span>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">{submittedPatient.symptoms}</p>
                </div>

                {/* Medical Conditions */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Existing Medical Conditions</span>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">{submittedPatient.conditions}</p>
                </div>

                {/* Known Allergies */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Known Allergies</span>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">{submittedPatient.allergies}</p>
                </div>

                {/* Current Medications */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Current Medications</span>
                    <ProvenanceBadge type="user_provided" size="xs" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">{submittedPatient.medications}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Intake Another Patient
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/patient/${submittedPatient.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Open Patient Record
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Patient Intake Form */
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Patient Intake Questionnaire</h1>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Module 1: 100% deterministic intake form. All fields stored with <code>source: &quot;user_provided&quot;</code>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demographics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <ProvenanceBadge type="user_provided" size="xs" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Jane Doe"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border ${
                    errors.name
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:border-teal-500"
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="sm:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Age <span className="text-rose-400">*</span>
                  </label>
                  <ProvenanceBadge type="user_provided" size="xs" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="130"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                  }}
                  placeholder="e.g. 45"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border ${
                    errors.age
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:border-teal-500"
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
                />
                {errors.age && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Sex */}
              <div className="sm:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Biological Sex</label>
                  <ProvenanceBadge type="user_provided" size="xs" />
                </div>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Reported Symptoms</label>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe current symptoms (e.g. fatigue, joint discomfort, morning dizziness)..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Medical Conditions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Pre-existing Medical Conditions
                </label>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <textarea
                rows={2}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Osteoarthritis..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Allergies */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Allergies (Drug / Environmental)
                </label>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <textarea
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin (rash), Sulfa drugs, No Known Drug Allergies (NKDA)..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Medications */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Current Medications & Dosages</label>
                <ProvenanceBadge type="user_provided" size="xs" />
              </div>
              <textarea
                rows={2}
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="e.g. Metformin 1000mg BID, Lisinopril 20mg QD, Allopurinol 100mg QD..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Safety & Form Submission */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <span>Deterministic intake schema • Source tag: <code>user_provided</code></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold text-center transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Save Patient Intake
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
