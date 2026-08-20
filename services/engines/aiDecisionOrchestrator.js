/**
 * AI Decision Orchestrator
 * Central intelligence hub that coordinates:
 * Step 1: Intent Detection Engine
 * Step 2: Specialized Domain Engine Execution (Symptom, Hospital, Menstrual, Pregnancy, Report, Reminder, Navigation)
 * Step 3: Synthesis into Gemini LLM for natural, multi-lingual response generation
 */

import { intentDetectionEngine, INTENT_TYPES } from './intentDetectionEngine';
import { symptomAnalysisEngine } from './symptomAnalysisEngine';
import { hospitalRankingEngine } from './hospitalRankingEngine';
import { recommendationEngine } from './recommendationEngine';
import { menstrualPredictionEngine } from './menstrualPredictionEngine';
import { pregnancyCompanionEngine } from './pregnancyCompanionEngine';
import { reportInterpretationEngine } from './reportInterpretationEngine';
import { navigationAIEngine } from './navigationAIEngine';
import { reminderEngine } from './reminderEngine';

export class AIDecisionOrchestrator {
  async processUserQuery({ prompt, conversationHistory = [], language = 'en', userProfile = {}, pageContext = 'global', extraData = {} }) {
    // Step 1: Detect Intent
    const intentResult = intentDetectionEngine.detectIntent(prompt, { pageContext });
    let engineData = null;
    let actionTrigger = null;

    // Step 2: Route to Specialized Domain Engine
    switch (intentResult.primaryIntent) {
      case INTENT_TYPES.SYMPTOM_ANALYSIS:
        engineData = symptomAnalysisEngine.analyze(prompt, extraData.region || 'general', extraData.duration || '1 - 2 Days', userProfile);
        break;

      case INTENT_TYPES.HOSPITAL_RANKING:
        engineData = hospitalRankingEngine.rankHospitals(extraData.hospitals || [], userProfile.location || 'Current Location', prompt, userProfile);
        break;

      case INTENT_TYPES.RECOMMENDATION:
        engineData = recommendationEngine.generateRecommendations(intentResult, userProfile);
        break;

      case INTENT_TYPES.MENSTRUAL_PREDICTION:
        engineData = menstrualPredictionEngine.predictCycle(extraData.cycleData || {});
        break;

      case INTENT_TYPES.PREGNANCY_COMPANION:
        engineData = pregnancyCompanionEngine.evaluatePregnancy(extraData.pregnancyDetails || {});
        break;

      case INTENT_TYPES.REPORT_INTERPRETATION:
        engineData = reportInterpretationEngine.interpretReport(extraData.reportTitle || prompt, extraData.rawText || prompt);
        break;

      case INTENT_TYPES.REMINDER_ENGINE:
        engineData = reminderEngine.evaluateReminders(extraData.reminders || []);
        break;

      case INTENT_TYPES.NAVIGATION_AI:
      case INTENT_TYPES.LANGUAGE_SWITCH:
        actionTrigger = navigationAIEngine.evaluateNavigation(prompt);
        engineData = { actionTrigger };
        break;

      default:
        engineData = { type: 'GENERAL_HEALTH_QA' };
        break;
    }

    // Step 3: Construct prompt payload with computed engine outputs for Gemini
    const enrichedPrompt = `
User Query: "${prompt}"
Current Page: ${pageContext}
Detected Intent: ${intentResult.primaryIntent}
Domain Engine Calculation Output: ${JSON.stringify(engineData, null, 2)}
Please synthesize this computational engine output into a warm, empathetic, conversational AI response.
Always ask 1-2 intelligent clinical follow-up questions when symptoms or concerns are mentioned.`;

    return {
      intent: intentResult.primaryIntent,
      engineData,
      actionTrigger,
      enrichedPrompt
    };
  }
}

export const aiDecisionOrchestrator = new AIDecisionOrchestrator();
