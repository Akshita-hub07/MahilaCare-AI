/**
 * Real Symptom Analyzer Module
 * Evaluates symptoms, calculates severity, urgency, red flags, recommended next steps,
 * and contextual follow-up questions without diagnosing diseases or claiming diagnosis certainty.
 */

import type { UserHealthContext } from './conversationMemory.ts';
import type { StructuredIntentOutput } from './intentDetector.ts';

export interface SymptomAnalysisOutput {
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  urgency: 'SELF_CARE' | 'DOCTOR_VISIT_REQUIRED' | 'IMMEDIATE_EMERGENCY';
  urgencyBadge: string;
  badgeBg: string;
  redFlags: string[];
  recommendedNextStep: string;
  questionsToAsk: string[];
  cautiousPhrasing: string;
  confidence: number;
}

export class SymptomAnalyzer {
  public analyzeSymptoms(
    prompt: string,
    intentData: StructuredIntentOutput,
    context: UserHealthContext
  ): SymptomAnalysisOutput {
    const p = prompt.toLowerCase();
    const symptoms = intentData.symptoms || [];
    const severityIndicators = intentData.severityIndicators || [];

    const redFlags: string[] = [];
    let severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let urgency: 'SELF_CARE' | 'DOCTOR_VISIT_REQUIRED' | 'IMMEDIATE_EMERGENCY' = 'SELF_CARE';

    // 1. Evaluate Multi-Symptom Combinations
    const hasSevere = severityIndicators.includes('severe');
    const hasFaint = severityIndicators.includes('faint') || symptoms.includes('faintness');
    const hasAbdominalPain = symptoms.includes('abdominal pain') || symptoms.includes('cramps') || p.includes('stomach') || p.includes('pelvic');

    if (hasSevere && hasFaint && hasAbdominalPain) {
      severity = 'CRITICAL';
      urgency = 'IMMEDIATE_EMERGENCY';
      redFlags.push("Severe abdominal pain accompanied by feeling faint or lightheaded (Risk of internal bleeding, ectopic pregnancy, or acute pelvic event)");
    } else if (hasFaint && hasAbdominalPain) {
      severity = 'HIGH';
      urgency = 'IMMEDIATE_EMERGENCY';
      redFlags.push("Abdominal pain associated with faintness");
    } else if (hasSevere) {
      severity = 'HIGH';
      urgency = 'DOCTOR_VISIT_REQUIRED';
      redFlags.push("Severe intensity discomfort");
    } else if (severityIndicators.includes('fever') || symptoms.includes('fever')) {
      severity = 'MODERATE';
      urgency = 'DOCTOR_VISIT_REQUIRED';
    } else if (symptoms.length > 0) {
      severity = 'LOW';
      urgency = 'SELF_CARE';
    }

    // 2. Determine Urgency Badge and Styling
    let urgencyBadge = '🟢 Low Priority';
    let badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';

    if (urgency === 'IMMEDIATE_EMERGENCY') {
      urgencyBadge = '🔴 Immediate Emergency Care Required';
      badgeBg = 'bg-rose-50 border-rose-200 text-rose-800 font-bold';
    } else if (urgency === 'DOCTOR_VISIT_REQUIRED') {
      urgencyBadge = '🟡 Moderate Priority - Doctor Evaluation Recommended';
      badgeBg = 'bg-amber-50 border-amber-200 text-amber-800';
    }

    // 3. Recommended Next Step
    let recommendedNextStep = "Home comfort measures (warm compress, hydration, restful posture). Monitor symptoms over 24 hours.";
    if (urgency === 'IMMEDIATE_EMERGENCY') {
      recommendedNextStep = "Seek IMMEDIATE emergency medical assessment or request an emergency ambulance to the nearest hospital.";
    } else if (urgency === 'DOCTOR_VISIT_REQUIRED') {
      recommendedNextStep = "Schedule a consultation with a verified female gynecologist within 24-48 hours.";
    }

    // 4. Context-Aware Follow-Up Questions (Only ask if info is insufficient)
    const questionsToAsk: string[] = [];
    if (!hasSevere && !hasFaint && symptoms.length === 1 && symptoms[0] === 'cramps') {
      // Prompt is simple (e.g. "I'm having mild cramps") -> Enough info for low urgency self-care, no annoying barrage
    } else if (!p.includes('location') && !p.includes('days')) {
      if (hasAbdominalPain) {
        questionsToAsk.push("What is the exact location of the discomfort (e.g., lower left, right, or central pelvic area)?");
        questionsToAsk.push("Is the pain associated with your menstrual cycle date, abnormal discharge, or burning during urination?");
      }
    }

    return {
      severity,
      urgency,
      urgencyBadge,
      badgeBg,
      redFlags,
      recommendedNextStep,
      questionsToAsk,
      cautiousPhrasing: "These symptoms can sometimes require clinical assessment by a qualified medical professional.",
      confidence: 0.95
    };
  }
}

export const symptomAnalyzer = new SymptomAnalyzer();
