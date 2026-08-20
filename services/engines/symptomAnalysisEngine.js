/**
 * AI Symptom Analysis & Clinical Triage Engine
 * Evaluates symptoms, calculates urgency levels, risk scores, and generates
 * targeted clinical follow-up questions for female physiology.
 */

export class SymptomAnalysisEngine {
  analyze(symptomsText, region = 'general', duration = '1 - 2 Days', userProfile = {}) {
    const text = (symptomsText || '').toLowerCase();
    let riskScore = 30; // 0 - 100
    let urgencyBadge = '🟢 Low Priority';
    let badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
    let urgencyCode = 'LOW';

    // High risk triggers
    const highRiskKeywords = ['severe pain', '102', '103', 'fainting', 'heavy bleeding', 'chest pain', 'shortness of breath', 'unbearable', 'stiff neck'];
    const modRiskKeywords = ['fever', 'cramps', 'chills', 'vomiting', 'nausea', 'dizziness', 'headache', 'burning', 'discharge'];

    const hasHighRisk = highRiskKeywords.some(kw => text.includes(kw));
    const hasModRisk = modRiskKeywords.some(kw => text.includes(kw));

    if (hasHighRisk || duration.includes('Week')) {
      riskScore = 85;
      urgencyBadge = '🔴 High Priority';
      badgeBg = 'bg-rose-50 border-rose-200 text-rose-800';
      urgencyCode = 'HIGH';
    } else if (hasModRisk || duration.includes('3 - 5')) {
      riskScore = 55;
      urgencyBadge = '🟡 Moderate Priority';
      badgeBg = 'bg-amber-50 border-amber-200 text-amber-800';
      urgencyCode = 'MODERATE';
    }

    // Generate Targeted Follow-up Questions based on region & symptoms
    const followUpQuestions = [];
    if (region === 'pelvic' || text.includes('cramp') || text.includes('period') || text.includes('stomach')) {
      followUpQuestions.push("What is the exact location of the pelvic pain (left, right, or lower abdominal)?");
      followUpQuestions.push("Is the pain associated with your menstrual cycle day, abnormal discharge, or burning during urination?");
      followUpQuestions.push("Are you currently pregnant, using an IUD, or managing diagnosed PCOS/Endometriosis?");
    } else if (region === 'head' || text.includes('headache') || text.includes('dizzy')) {
      followUpQuestions.push("Is the headache constant, throbbing, or accompanied by visual sensitivity/lightheadedness?");
      followUpQuestions.push("Have you recorded your blood pressure today?");
    } else {
      followUpQuestions.push("Could you specify your current body temperature (e.g., 99.5°F vs 101.5°F)?");
      followUpQuestions.push("Are you experiencing shivering, sore throat, or body fatigue?");
    }

    // Care Recommendation
    let recommendedCare = "Home remedies, rest, warm compress, and hydration. Monitor for 24 hours.";
    if (urgencyCode === 'HIGH') {
      recommendedCare = "Immediate consultation with a verified female gynecologist or nearest emergency hospital.";
    } else if (urgencyCode === 'MODERATE') {
      recommendedCare = "Doctor consultation recommended within 24-48 hours if symptoms do not improve.";
    }

    return {
      urgencyCode,
      urgencyBadge,
      badgeBg,
      riskScore,
      symptomRegion: region,
      duration,
      followUpQuestions,
      recommendedCare,
      isPregnancyConsidered: userProfile.isPregnancyEnabled || false
    };
  }
}

export const symptomAnalysisEngine = new SymptomAnalysisEngine();
