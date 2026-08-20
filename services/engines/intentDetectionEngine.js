/**
 * AI Intent Detection Engine
 * Analyzes natural language prompts, conversation history, and current route context
 * to classify the user's primary intent and secondary sub-intents.
 */

export const INTENT_TYPES = {
  SYMPTOM_ANALYSIS: 'SYMPTOM_ANALYSIS',
  HOSPITAL_RANKING: 'HOSPITAL_RANKING',
  RECOMMENDATION: 'RECOMMENDATION',
  MENSTRUAL_PREDICTION: 'MENSTRUAL_PREDICTION',
  PREGNANCY_COMPANION: 'PREGNANCY_COMPANION',
  REPORT_INTERPRETATION: 'REPORT_INTERPRETATION',
  NAVIGATION_AI: 'NAVIGATION_AI',
  REMINDER_ENGINE: 'REMINDER_ENGINE',
  LANGUAGE_SWITCH: 'LANGUAGE_SWITCH',
  GENERAL_HEALTH_QA: 'GENERAL_HEALTH_QA'
};

export class IntentDetectionEngine {
  detectIntent(prompt, context = {}) {
    const p = (prompt || '').toLowerCase().trim();
    const currentRoute = context.pageContext || 'global';

    // 1. Language Switching Detection
    const langMatch = this.detectLanguageSwitch(p);
    if (langMatch) {
      return {
        primaryIntent: INTENT_TYPES.LANGUAGE_SWITCH,
        targetLang: langMatch,
        confidence: 0.98,
        contextData: { targetLang: langMatch }
      };
    }

    // 2. Navigation AI Detection
    const navMatch = this.detectNavigation(p);
    if (navMatch) {
      return {
        primaryIntent: INTENT_TYPES.NAVIGATION_AI,
        targetRoute: navMatch.route,
        actionText: navMatch.text,
        confidence: 0.95,
        contextData: { targetRoute: navMatch.route }
      };
    }

    // 3. Medical Report Interpretation
    if (this.containsKeywords(p, ['report', 'cbc', 'blood test', 'lab', 'hemoglobin', 'tsh', 'thyroid', 'platelet', 'biomarker', 'prescription'])) {
      return {
        primaryIntent: INTENT_TYPES.REPORT_INTERPRETATION,
        confidence: 0.92,
        contextData: { reportQuery: p }
      };
    }

    // 4. Menstrual & Hormonal Prediction
    if (this.containsKeywords(p, ['period', 'menstrual', 'cramp', 'cycle', 'ovulation', 'fertile', 'pcos', 'pcod', 'spotting', 'flow'])) {
      return {
        primaryIntent: INTENT_TYPES.MENSTRUAL_PREDICTION,
        confidence: 0.94,
        contextData: { menstrualQuery: p }
      };
    }

    // 5. Pregnancy Companion
    if (this.containsKeywords(p, ['pregnancy', 'pregnant', 'trimester', 'baby', 'fetus', 'kick', 'due date', 'ultrasound', 'maternity', 'bump'])) {
      return {
        primaryIntent: INTENT_TYPES.PREGNANCY_COMPANION,
        confidence: 0.95,
        contextData: { pregnancyQuery: p }
      };
    }

    // 6. Hospital Ranking & Nearby Discovery
    if (this.containsKeywords(p, ['hospital', 'clinic', 'gynecologist', 'doctor near', 'find doctor', 'consultation', 'book appointment', 'radius'])) {
      return {
        primaryIntent: INTENT_TYPES.HOSPITAL_RANKING,
        confidence: 0.93,
        contextData: { hospitalQuery: p }
      };
    }

    // 7. Reminder & Medication Schedule
    if (this.containsKeywords(p, ['reminder', 'pill', 'medicine', 'alarm', 'water', 'hydration', 'dose', 'time to take', 'schedule'])) {
      return {
        primaryIntent: INTENT_TYPES.REMINDER_ENGINE,
        confidence: 0.91,
        contextData: { reminderQuery: p }
      };
    }

    // 8. Symptom Analysis & Clinical Triage
    if (this.containsKeywords(p, ['pain', 'fever', 'headache', 'nausea', 'fatigue', 'vomiting', 'dizziness', 'cough', 'rash', 'bleed', 'ache', 'sick', 'symptom'])) {
      return {
        primaryIntent: INTENT_TYPES.SYMPTOM_ANALYSIS,
        confidence: 0.96,
        contextData: { symptomQuery: p }
      };
    }

    // 9. Recommendation Engine (Nutrition, Schemes, Lifestyle)
    if (this.containsKeywords(p, ['scheme', 'yojana', 'recommend', 'diet', 'nutrition', 'food', 'exercise', 'vitamins', 'supplement'])) {
      return {
        primaryIntent: INTENT_TYPES.RECOMMENDATION,
        confidence: 0.89,
        contextData: { recommendationQuery: p }
      };
    }

    // 10. Fallback to General Health Q&A or Route Context
    if (currentRoute.includes('menstrual')) return { primaryIntent: INTENT_TYPES.MENSTRUAL_PREDICTION, confidence: 0.75, contextData: {} };
    if (currentRoute.includes('pregnancy')) return { primaryIntent: INTENT_TYPES.PREGNANCY_COMPANION, confidence: 0.75, contextData: {} };
    if (currentRoute.includes('timeline')) return { primaryIntent: INTENT_TYPES.REPORT_INTERPRETATION, confidence: 0.75, contextData: {} };
    if (currentRoute.includes('nearby')) return { primaryIntent: INTENT_TYPES.HOSPITAL_RANKING, confidence: 0.75, contextData: {} };

    return {
      primaryIntent: INTENT_TYPES.GENERAL_HEALTH_QA,
      confidence: 0.85,
      contextData: { generalQuery: p }
    };
  }

  detectLanguageSwitch(p) {
    if (p.includes('hindi') || p.includes('हिंदी')) return 'hi';
    if (p.includes('punjabi') || p.includes('ਪੰਜਾਬੀ')) return 'pa';
    if (p.includes('bengali') || p.includes('বাংলা')) return 'bn';
    if (p.includes('tamil') || p.includes('தமிழ்')) return 'ta';
    if (p.includes('telugu') || p.includes('తెలుగు')) return 'te';
    if (p.includes('kannada') || p.includes('ಕನ್ನಡ')) return 'kn';
    if (p.includes('malayalam') || p.includes('മലയാളം')) return 'ml';
    if (p.includes('gujarati') || p.includes('ગુજરાતી')) return 'gu';
    if (p.includes('marathi') || p.includes('मराठी')) return 'mr';
    if (p.includes('english')) return 'en';
    return null;
  }

  detectNavigation(p) {
    if (p.includes('book') || p.includes('appointment') || p.includes('nearby hospital') || p.includes('gynecologist') || p.includes('find doctor')) {
      return { route: '/nearby', text: 'Navigating to Find Healthcare page...' };
    }
    if (p.includes('upload report') || p.includes('my reports') || p.includes('health timeline') || p.includes('health record')) {
      return { route: '/timeline', text: 'Navigating to Health Timeline & Vault...' };
    }
    if (p.includes('pregnancy progress') || p.includes('baby bump') || p.includes('trimester status')) {
      return { route: '/pregnancy', text: 'Navigating to Pregnancy Companion...' };
    }
    if (p.includes('period advice') || p.includes('cycle history') || p.includes('menstrual tracker')) {
      return { route: '/menstrual', text: 'Navigating to Menstrual Care AI...' };
    }
    if (p.includes('take me to reminders') || p.includes('pill reminders')) {
      return { route: '/reminders', text: 'Navigating to Smart Health Reminders...' };
    }
    if (p.includes('open profile') || p.includes('account settings')) {
      return { route: '/profile', text: 'Navigating to Profile & Settings...' };
    }
    if (p.includes('open education') || p.includes('health articles')) {
      return { route: '/education', text: 'Navigating to AI Health Education...' };
    }
    if (p.includes('symptom triage') || p.includes('feeling sick')) {
      return { route: '/ai-navigator', text: 'Navigating to AI Health Navigator...' };
    }
    return null;
  }

  containsKeywords(text, keywords) {
    return keywords.some(kw => text.includes(kw));
  }
}

export const intentDetectionEngine = new IntentDetectionEngine();
