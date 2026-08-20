/**
 * Real AI Decision Router Module
 * Strictly coordinates the mandatory 9-step pipeline:
 * USER MESSAGE
 *   ↓
 * INTENT DETECTOR
 *   ↓
 * CONVERSATION MEMORY
 *   ↓
 * DECISION ROUTER
 *   ↓
 * RELEVANT ENGINE(S)
 *   ↓
 * SAFETY LAYER
 *   ↓
 * RESPONSE GENERATOR
 *   ↓
 * ACTION HANDLER
 *   ↓
 * EXISTING NARICARE UI
 */

import { conversationMemory, UserHealthContext } from './conversationMemory';
import { intentDetector, StructuredIntentOutput } from './intentDetector';
import { symptomAnalyzer } from './symptomAnalyzer';
import { hospitalRankingEngine } from './hospitalRankingEngine';
import { pregnancyEngine } from './pregnancyEngine';
import { menstrualEngine } from './menstrualEngine';
import { reportInterpreter } from './reportInterpreter';
import { healthEducationEngine } from './healthEducationEngine';
import { transportEngine } from './transportEngine';
import { timelineEngine } from './timelineEngine';
import { voiceNavigationEngine } from './voiceNavigationEngine';
import { recommendationEngine } from './recommendationEngine';
import { reminderEngine } from './reminderEngine';
import { safetyLayer, SafetyCheckResult } from './safetyLayer';
import { actionHandler, ActionPayload } from './actionHandler';
import { responseGenerator } from './responseGenerator';

export interface CompletePipelineResult {
  text: string;
  disclaimer: string;
  intentResult: StructuredIntentOutput;
  engineResults: Record<string, any>;
  safetyResult: SafetyCheckResult;
  actionPayload?: ActionPayload;
}

export class DecisionRouter {
  public async routeQuery(
    prompt: string,
    isVoice: boolean = false,
    pageContext: string = 'global',
    extraInput: Record<string, any> = {}
  ): Promise<CompletePipelineResult> {
    // STEP 1: Memory Resolution (Anaphora & domain overrides)
    const { resolvedPrompt, domainOverride } = conversationMemory.resolveContextualPrompt(prompt);
    conversationMemory.setCurrentPage(pageContext);

    const currentContext: UserHealthContext = conversationMemory.getContext();

    // STEP 2: Intent Detector
    const intentResult: StructuredIntentOutput = intentDetector.detectIntents(resolvedPrompt, isVoice, pageContext);

    // Apply domain override if user corrected context (e.g. "Actually I meant pregnancy, not periods")
    if (domainOverride === 'pregnancy') {
      intentResult.primaryIntent = 'Pregnancy';
    } else if (domainOverride === 'menstrual') {
      intentResult.primaryIntent = 'Menstrual Care';
    }

    const engineResults: Record<string, any> = {};

    // STEP 3: Execute ALL Relevant Engines for detected primary & secondary intents
    const allIntents = [intentResult.primaryIntent, ...intentResult.secondaryIntents];

    for (const intent of allIntents) {
      switch (intent) {
        case 'Symptom Analysis':
          if (!engineResults.symptom) {
            engineResults.symptom = symptomAnalyzer.analyzeSymptoms(
              resolvedPrompt,
              intentResult,
              currentContext
            );
          }
          break;

        case 'Hospital Recommendation':
        case 'Appointment Booking':
          if (!engineResults.hospital) {
            engineResults.hospital = hospitalRankingEngine.rankHospitals(
              extraInput.hospitals || [
                {
                  id: 1,
                  name: 'Apollo Women & Child Specialty Hospital',
                  distance: '3.2 km',
                  address: 'Sector 4, City Center',
                  status: 'Open 24/7',
                  specialties: ['Gynecology', 'Obstetrics', 'PCOS Clinic'],
                  femaleFriendly: true,
                  homeDiagnosis: true,
                  rating: 4.9,
                  reviews: 420,
                  waitingTime: '15 mins',
                  consultFee: '₹800'
                },
                {
                  id: 2,
                  name: 'Nari Wellness & Maternity Care Clinic',
                  distance: '5.4 km',
                  address: '14 Park View Enclave',
                  status: 'Open till 9 PM',
                  specialties: ['Reproductive Endocrinology', 'Fertility'],
                  femaleFriendly: true,
                  homeDiagnosis: true,
                  rating: 4.8,
                  reviews: 280,
                  waitingTime: '10 mins',
                  consultFee: '₹950'
                }
              ],
              currentContext
            );
          }
          break;

        case 'Pregnancy':
          if (!engineResults.pregnancy) {
            engineResults.pregnancy = pregnancyEngine.evaluatePregnancy(currentContext);
          }
          break;

        case 'Menstrual Care':
          if (!engineResults.menstrual) {
            engineResults.menstrual = menstrualEngine.evaluateCycle(currentContext);
          }
          break;

        case 'Report Upload':
          if (!engineResults.report) {
            engineResults.report = reportInterpreter.interpretReport(
              extraInput.reportTitle || resolvedPrompt,
              extraInput.rawText || resolvedPrompt,
              currentContext
            );
          }
          break;

        case 'Health Education':
          if (!engineResults.education) {
            engineResults.education = healthEducationEngine.generateEducation(resolvedPrompt, currentContext);
          }
          break;

        case 'Transport Assistance':
          if (!engineResults.transport) {
            engineResults.transport = transportEngine.evaluateTransport(extraInput.destination || 'Hospital', currentContext);
          }
          break;

        case 'Medicine Reminder':
          if (!engineResults.reminder) {
            engineResults.reminder = reminderEngine.evaluateReminders(extraInput.reminders || currentContext.reminders, currentContext);
          }
          break;

        case 'Navigation':
        case 'Voice Command':
        case 'Settings':
          if (!engineResults.navigation) {
            engineResults.navigation = voiceNavigationEngine.processVoiceCommand(resolvedPrompt);
          }
          break;

        default:
          if (!engineResults.recommendation) {
            engineResults.recommendation = recommendationEngine.generateRecommendations(resolvedPrompt, currentContext);
          }
          break;
      }
    }

    // STEP 4: Safety Layer Check
    const symptomSeverity = engineResults.symptom?.severity || 'LOW';
    const safetyResult: SafetyCheckResult = safetyLayer.evaluateSafety(
      resolvedPrompt,
      intentResult.symptoms,
      symptomSeverity
    );
    engineResults.safety = safetyResult;

    // STEP 5: Action Handler
    const actionPayload = actionHandler.determineAction(intentResult, engineResults, currentContext);

    // STEP 6: Response Generator
    const generatedResponse = responseGenerator.generateResponse(
      resolvedPrompt,
      intentResult,
      engineResults,
      safetyResult,
      currentContext,
      actionPayload
    );

    // STEP 7: Update Conversation Memory
    conversationMemory.addMessage({
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intentData: intentResult
    });

    conversationMemory.addMessage({
      id: `nari_${Date.now()}`,
      sender: 'nari',
      text: generatedResponse.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intentData: intentResult,
      engineOutput: engineResults,
      actionTrigger: actionPayload
    });

    // Update active domain memory
    if (intentResult.primaryIntent === 'Menstrual Care') conversationMemory.updateActiveState({ lastMentionedDomain: 'menstrual' });
    if (intentResult.primaryIntent === 'Pregnancy') conversationMemory.updateActiveState({ lastMentionedDomain: 'pregnancy' });
    if (intentResult.primaryIntent === 'Symptom Analysis') conversationMemory.updateActiveState({ lastMentionedDomain: 'symptom' });

    return {
      text: generatedResponse.text,
      disclaimer: generatedResponse.disclaimer,
      intentResult,
      engineResults,
      safetyResult,
      actionPayload
    };
  }
}

export const decisionRouter = new DecisionRouter();
