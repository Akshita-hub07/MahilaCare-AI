/**
 * MahilaCare AI - LLM Service
 * Orchestrates natural-language healthcare queries, multi-turn context memory,
 * and application intent resolution using an extensible LLM Provider abstraction
 * while preserving MahilaCare's deterministic domain engines.
 */

import { LocalAIProvider } from './providers/localAIProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { hospitalRankingEngine } from '../ai/hospitalRankingEngine.ts';
import { menstrualEngine } from '../ai/menstrualEngine.ts';
import { pregnancyEngine } from '../ai/pregnancyEngine.ts';
import { symptomAnalyzer } from '../ai/symptomAnalyzer.ts';
import { conversationMemory } from '../ai/conversationMemory.ts';
import { userHealthStorage } from './userHealthStorage.js';
import { stripQuestionsToAsk } from '../utils/textCleaner.js';

const NARICARE_SYSTEM_INSTRUCTION = `
You are MahilaCare AI, a 24/7 empathetic, expert conversational health & action assistant for women's healthcare.

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
    // 1. Build deterministic context from MahilaCare engines & stored user memory
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

    // Adaptive maxTokens & system instruction optimized for report interpretation vs general chat vs feature pages
    // Adaptive maxTokens & system instruction: Detailed clinical answers for feature pages; follow-up questions exclusively in voice_assistant
    const isReportRequest = prompt.includes('JSON block') || prompt.includes('JSON schema') || prompt.includes('Return JSON') || pageContext === 'health_report';
    const isVoiceAssistant = pageContext === 'voice_assistant';
    const maxTokens = isReportRequest ? 1200 : 900;

    let systemInstruction = NARICARE_SYSTEM_INSTRUCTION;

    if (isReportRequest) {
      systemInstruction = `You are MahilaCare AI, an expert clinical health assistant. Analyze ONLY the specific single report parameters and text content provided in the user query. Do NOT summarize the user's entire health history or combine unrelated past records. Explain what this specific report means in plain language, preserve all medical values, units, and dates exactly, and identify abnormal or important findings supported by the extracted report text strictly matching the requested JSON schema. DO NOT include any "Questions to ask your doctor" or question lists in the response.`;
    } else if (!isVoiceAssistant) {
      systemInstruction = `You are MahilaCare AI, a 24/7 expert conversational health assistant.
Provide detailed, comprehensive, and thorough medical explanations using all relevant user health context (cycle logs, pregnancy details, vitals, stored history) provided in the prompt.
Give proper, in-depth clinical explanations and summaries rather than generic or brief answers.
DO NOT ask any follow-up questions. DO NOT include any "Questions to ask your doctor", "Questions to consider", or question sections. DO NOT append trailing questions like "Would you like to...", "Do you have any other symptoms?", "Would you like to book an appointment?", or "Should we proceed?".
End your response cleanly with comprehensive, actionable medical guidance.`;
    }

    // Slice recent conversation history to 4 turns for fast prompt evaluation (or empty for report evaluation)
    const recentHistory = isReportRequest ? [] : (conversationHistory || []).slice(-4);

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
        errorMessage: result.errorMessage || 'MahilaCare AI is temporarily unavailable. Please try again shortly.',
        status: result.status
      };
    }

    let finalResponseText = result.text;
    if (!isVoiceAssistant && !isReportRequest && finalResponseText) {
      // Remove "Questions to ask your doctor" sections and trailing question mark sentences on non-voice feature pages
      finalResponseText = stripQuestionsToAsk(finalResponseText);
      finalResponseText = finalResponseText
        .replace(/(?:\s+|\n+)(?:Would|Do|Can|Shall|Are|Is|How|What|Should|Have|Could|May|Is there|Do you)\s+[\s\S]*?\?\s*$/i, '')
        .replace(/(?:\s+|\n+)[^\n\.\!\?]+?\?\s*$/i, '')
        .trim();
    }

    return {
      error: false,
      text: finalResponseText,
      action: result.action,
      modelUsed: result.modelUsed
    };
  }

  /**
   * Invokes MahilaCare's deterministic engines & retrieves user-scoped health memory
   */
  buildDeterministicContext(prompt, language, userProfile, pageContext, extraData) {
    // 1. Load active user's persistent health data from browser storage
    const storedUserData = userHealthStorage.loadUserData(userProfile) || {};
    
    // 2. Hydrate conversation memory context
    conversationMemory.hydrateFromUserStorage(storedUserData, userProfile);
    const memoryContext = conversationMemory.getContext();

    const p = prompt.toLowerCase();
    const isReportReq = pageContext === 'health_report' || prompt.includes('JSON schema') || prompt.includes('JSON block');

    const appState = {
      selectedLanguage: language || memoryContext.language,
      userState: {
        name: userProfile.name || memoryContext.userName,
        age: userProfile.age || memoryContext.userAge,
        femaleDoctorsOnly: memoryContext.femaleDoctorsOnly
      }
    };

    // 3. Include userStoredHealthMemory only when NOT evaluating a single isolated health report
    if (!isReportReq) {
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
    }

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