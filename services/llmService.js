/**
 * NariCare AI - LLM Service
 * Orchestrates natural-language healthcare queries, multi-turn context memory,
 * and application intent resolution using an extensible LLM Provider abstraction
 * while preserving NariCare's deterministic domain engines.
 */

import { LocalAIProvider } from './providers/localAIProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { hospitalRankingEngine } from '../ai/hospitalRankingEngine.ts';
import { menstrualEngine } from '../ai/menstrualEngine.ts';
import { pregnancyEngine } from '../ai/pregnancyEngine.ts';
import { symptomAnalyzer } from '../ai/symptomAnalyzer.ts';
import { conversationMemory } from '../ai/conversationMemory.ts';
import { userHealthStorage } from './userHealthStorage.js';

const NARICARE_SYSTEM_INSTRUCTION = `
You are NariCare AI, a 24/7 empathetic, expert conversational health & action assistant for women's healthcare.

CONVERSATIONAL & HEALTHCARE CAPABILITIES:
1. Answer general health, medical, wellness, nutrition, pregnancy, PCOS, thyroid, and cycle questions naturally and clearly with appropriate medical explanations.
2. When the user asks a health question or describes a symptom, provide a clear, helpful, and empathetic explanation. If key details are missing, ask 1-2 concise follow-up questions to understand their situation better.
3. Use previous conversation turns and the user's stored health history (records, cycle logs, triage assessments) to provide context and continuity.
4. Do not repeatedly ask for information the user has already provided.
5. Never fabricate medical records, lab values, diagnoses, medications, or health data.

RESPONSIVE LANGUAGE SUPPORT:
- English ('en'): Respond in standard clear English.
- Hindi ('hi'): Respond in Hindi script (हिंदी).
SAFETY & COMPLIANCE RULES:
- You are NOT a doctor. NEVER claim definitive diagnoses.
- NEVER invent lab values, doctor names, ratings, distances, or appointment slots.
- Only reference data provided explicitly in the application context or user records.

SAFE NAVIGATION & ACTIONS:
If the user explicitly asks to navigate or open a feature (e.g., "Open pregnancy companion", "Take me to hospital search", "Book an appointment", "Show my timeline"), output a JSON block at the END of your response in this exact format:
\`\`\`json
{
  "intent": "NAVIGATION",
  "action": "OPEN_PREGNANCY",
  "destination": "/pregnancy"
}
\`\`\`
Allowed Actions: OPEN_DASHBOARD, OPEN_HOSPITALS, OPEN_APPOINTMENTS, OPEN_TRANSPORT, OPEN_PREGNANCY, OPEN_MENSTRUAL, OPEN_REPORTS, OPEN_EDUCATION, OPEN_TIMELINE, OPEN_PROFILE, SWITCH_LANGUAGE.
If NO action is required (e.g., normal health question), DO NOT output JSON.
`;

export class LLMService {
  constructor(provider) {
    // Default to LocalAIProvider (Ollama qwen2.5:1.5b-instruct) as the primary production model provider
    this.provider = provider || new LocalAIProvider();
  }

  /**
   * Switch provider at runtime if needed
   */
  setProvider(provider) {
    this.provider = provider;
  }

  /**
   * Main completion function used by Health Navigator, Floating AI Chat, and Voice Assistant
   */
  async generateCompletion({
    prompt,
    conversationHistory = [],
    language = 'en',
    userProfile = {},
    pageContext = 'global',
    extraData = {}
  }) {
    // 1. Build deterministic context from NariCare engines & stored user memory
    const deterministicContext = this.buildDeterministicContext(
      prompt,
      language,
      userProfile,
      pageContext,
      extraData
    );

    // 2. Format multi-turn prompt payload concisely to optimize latency (~10-15s)
    const contextLines = [];
    if (language) contextLines.push(`Target Language: ${language}`);
    if (pageContext && pageContext !== 'global') contextLines.push(`Current Page: ${pageContext}`);
    if (userProfile?.name) contextLines.push(`User Name: ${userProfile.name}`);
    if (Object.keys(deterministicContext).length > 2) {
      contextLines.push(`App Context:\n${JSON.stringify(deterministicContext)}`);
    }

    const formattedPrompt = contextLines.length > 0
      ? `[CONTEXT]\n${contextLines.join('\n')}\n\n[USER QUERY]\n${prompt}`
      : prompt;

    // Adaptive maxTokens & system instruction optimized for 10-15s generation speed
    const isReportRequest = prompt.includes('JSON block') || prompt.includes('JSON schema') || prompt.includes('Return JSON');
    const maxTokens = isReportRequest ? 550 : 350;

    const systemInstruction = isReportRequest
      ? `You are NariCare AI, an expert clinical health assistant. Generate a detailed, multi-sentence health summary strictly matching the requested JSON schema.`
      : NARICARE_SYSTEM_INSTRUCTION;

    // Slice recent conversation history to 4 turns for fast prompt evaluation
    const recentHistory = (conversationHistory || []).slice(-4);

    // 3. Delegate to the active LLM Provider
    const result = await this.provider.generateCompletion({
      prompt: formattedPrompt,
      conversationHistory: recentHistory,
      systemInstruction,
      temperature: isReportRequest ? 0.1 : 0.3,
      maxTokens
    });

    if (result.error) {
      return {
        error: true,
        errorMessage: result.errorMessage || 'NariCare AI is temporarily unavailable. Please try again shortly.',
        status: result.status
      };
    }

    return {
      error: false,
      text: result.text,
      action: result.action,
      modelUsed: result.modelUsed
    };
  }

  /**
   * Invokes NariCare's deterministic engines & retrieves user-scoped health memory
   */
  buildDeterministicContext(prompt, language, userProfile, pageContext, extraData) {
    // 1. Load active user's persistent health data from browser storage
    const storedUserData = userHealthStorage.loadUserData(userProfile) || {};
    
    // 2. Hydrate conversation memory context
    conversationMemory.hydrateFromUserStorage(storedUserData, userProfile);
    const memoryContext = conversationMemory.getContext();

    const p = prompt.toLowerCase();
    const appState = {
      selectedLanguage: language || memoryContext.language,
      userState: {
        name: userProfile.name || memoryContext.userName,
        age: userProfile.age || memoryContext.userAge,
        femaleDoctorsOnly: memoryContext.femaleDoctorsOnly
      }
    };

    // 3. Build complete User Stored Health Memory from userHealthStorage
    appState.userStoredHealthMemory = {
      totalSavedRecords: storedUserData.records ? storedUserData.records.length : 0,
      storedHealthRecords: (storedUserData.records || []).map(r => ({
        id: r.id,
        title: r.title,
        doctor: r.doctor,
        date: r.date,
        category: r.type,
        status: r.status,
        sampleLabValues: (r.sampleValues || []).map(v => `${v.parameter}: ${v.value} (${v.status})`),
        aiReportSummary: r.cachedAnalysis?.summary || (r.rawReportData ? r.rawReportData.slice(0, 250) : null)
      })),
      menstrualHistoryLogs: {
        currentPhase: storedUserData.cycleData?.phase || 'Follicular Phase',
        cycleDay: storedUserData.cycleData?.currentDay || 1,
        cycleLengthDays: storedUserData.cycleData?.cycleLength || 28,
        lastPeriodDate: storedUserData.cycleData?.lastPeriodStart || 'N/A',
        loggedSymptoms: storedUserData.cycleData?.symptoms || [],
        flowLevel: storedUserData.cycleData?.flowLevel || 'Medium',
        painLevel: storedUserData.cycleData?.painLevel || 0
      },
      pregnancyCompanionDetails: {
        enabled: !!storedUserData.isPregnancyEnabled,
        gestationalWeek: storedUserData.pregnancyDetails?.week || null,
        trimester: storedUserData.pregnancyDetails?.trimester || null,
        dueDate: storedUserData.pregnancyDetails?.dueDate || null,
        kicksToday: storedUserData.pregnancyDetails?.kicksToday || 0
      },
      symptomTriageLogs: (storedUserData.symptomHistory || []).map(s => ({
        date: s.date || s.timestamp,
        region: s.region || s.selectedRegion,
        symptoms: s.symptoms || s.triageText,
        urgency: s.urgencyLevel || s.urgency
      })),
      activeReminders: (storedUserData.reminders || []).map(rem => `${rem.title} (${rem.time})`)
    };

    // 4. Hospital / Doctor Intent -> Rank supplied hospitals deterministically
    if (
      p.includes('hospital') ||
      p.includes('doctor') ||
      p.includes('gynecologist') ||
      p.includes('gynaecologist') ||
      p.includes('clinic') ||
      p.includes('appointment') ||
      p.includes('female doctor')
    ) {
      const realHospitals = extraData.hospitals || [
        {
          id: 1,
          name: "Apollo Women's Hospital",
          distance: "2.4 km",
          address: "Sector 18, Block B",
          status: "Open 24/7",
          specialties: ["Gynecology", "Obstetrics", "PCOS Care"],
          femaleFriendly: true,
          homeDiagnosis: true,
          rating: 4.9,
          reviews: 340,
          waitingTime: "15 mins",
          consultFee: "₹800"
        },
        {
          id: 2,
          name: "Fortis La Femme Specialist Center",
          distance: "4.1 km",
          address: "GK Part II, Ring Road",
          status: "Open 24/7",
          specialties: ["Maternal Health", "Fetal Medicine"],
          femaleFriendly: true,
          homeDiagnosis: true,
          rating: 4.8,
          reviews: 210,
          waitingTime: "20 mins",
          consultFee: "₹1000"
        },
        {
          id: 3,
          name: "Max Super Specialty Women Wing",
          distance: "6.8 km",
          address: "Saket Institutional Area",
          status: "Open 24/7",
          specialties: ["High-Risk Pregnancy", "IVF", "Gynecology"],
          femaleFriendly: true,
          homeDiagnosis: false,
          rating: 4.7,
          reviews: 185,
          waitingTime: "25 mins",
          consultFee: "₹950"
        }
      ];

      appState.rankedHospitals = hospitalRankingEngine
        .rankHospitals(realHospitals, memoryContext)
        .slice(0, 3)
        .map(h => ({
          name: h.name,
          distance: h.distance,
          rating: h.rating,
          femaleFriendly: h.femaleFriendly,
          consultFee: h.consultFee,
          reasoning: h.aiReasoning
        }));
    }

    // 5. Menstrual Context -> Calculate cycle metrics
    if (p.includes('period') || p.includes('menstrual') || p.includes('cycle') || p.includes('cramp') || p.includes('late')) {
      try {
        appState.menstrualMetrics = menstrualEngine.evaluateCycle(memoryContext);
      } catch (e) {
        console.warn('LLMService: Menstrual engine context skipped:', e);
      }
    }

    // 6. Pregnancy Context -> Calculate gestational metrics
    if (p.includes('pregnancy') || p.includes('pregnant') || p.includes('trimester') || p.includes('baby') || p.includes('kick')) {
      try {
        appState.pregnancyMetrics = pregnancyEngine.evaluatePregnancy(memoryContext);
      } catch (e) {
        console.warn('LLMService: Pregnancy engine context skipped:', e);
      }
    }

    // 7. Symptom Evaluation Context
    if (p.includes('pain') || p.includes('cramp') || p.includes('fever') || p.includes('bleeding') || p.includes('tired') || p.includes('fatigue')) {
      try {
        const intentMock = { symptoms: ['symptoms'], severityIndicators: [] };
        appState.symptomEvaluation = symptomAnalyzer.analyzeSymptoms(prompt, intentMock, memoryContext);
      } catch (e) {
        console.warn('LLMService: Symptom analyzer context skipped:', e);
      }
    }

    return appState;
  }
}

export const llmService = new LLMService();