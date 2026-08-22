/**
 * Central AI Bridge connecting NariCare AI components to llmService.js and conversationMemory
 */

import { llmService } from './llmService.js';
import { conversationMemory } from '../ai/conversationMemory.ts';
import { hospitalRankingEngine } from '../ai/hospitalRankingEngine.ts';
import { reportInterpreter } from '../ai/reportInterpreter.ts';
import { stripCodeAndJsonFences, stripQuestionsToAsk, extractFieldFromUnparsedJson } from '../utils/textCleaner.js';

class GeminiAIService {
  setPageContext(context) {
    conversationMemory.setCurrentPage(context);
  }

  getHistory() {
    return conversationMemory.getMessages();
  }

  clearHistory() {
    conversationMemory.clearMemory();
  }

  /**
   * Main completion function routing through llmService
   */
  async askNariGemini({
    prompt,
    conversationHistory = [],
    language = 'en',
    userProfile = {},
    pageContext = 'global',
    extraData = {}
  }) {
    if (language) {
      conversationMemory.setLanguage(language);
    }

    // Record user input in conversation memory
    conversationMemory.addMessage({
      id: String(Date.now()),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Call LLM Service
    const result = await llmService.generateCompletion({
      prompt,
      conversationHistory: conversationHistory.length > 0 ? conversationHistory : conversationMemory.getMessages(),
      language,
      userProfile,
      pageContext,
      extraData
    });

    if (result.error) {
      return {
        error: true,
        text: `⚠️ ${result.errorMessage || 'AI Service Temporarily Unavailable. Please check your network connection.'}`,
        disclaimer: "⚠️ NariCare AI Service Temporarily Unavailable."
      };
    }

    // Record bot response in conversation memory
    conversationMemory.addMessage({
      id: String(Date.now() + 1),
      sender: 'nari',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTrigger: result.action
    });

    return {
      error: false,
      text: result.text,
      disclaimer: "⚠️ NariCare AI provides general health education based on verified medical standards, but does not replace professional clinical evaluation.",
      intentAction: result.action,
      modelUsed: result.modelUsed
    };
  }

  /**
   * Reusable structured AI report generator helper
   */
  async generateAIReport({ type = 'HEALTH_REPORT', userData = {}, reportData = {}, prompt = '', language = 'en' }) {
    let reportTitle = reportData.reportTitle || 'Lab Report';
    let rawContent = reportData.rawReportData || reportData.doctorOrNotes || prompt || '';
    let promptInstruction = '';

    if (type === 'MENSTRUAL') {
      reportTitle = 'Menstrual & Ovulation Cycle Log';
      const flow = reportData.flowLevel || 'Medium';
      const pain = reportData.painLevel !== undefined ? reportData.painLevel : 4;
      const day = reportData.currentDay || 1;
      const phase = reportData.phase || 'Follicular Phase';
      const mood = reportData.mood || 'Energetic';
      const symptomsList = (reportData.symptoms || []).join(', ') || 'None logged';

      rawContent = `User Selected Menstrual Log:
- Cycle Day: Day ${day}
- Phase: ${phase}
- Flow Level: ${flow}
- Pain Level: ${pain}/10
- Primary Mood: ${mood}
- Logged Symptoms: ${symptomsList}`;

      promptInstruction = `INSTRUCTION FOR MENSTRUAL AI:
1. Write a thorough, personalized, multi-paragraph AI health explanation analyzing the user's specific logged details: Flow Level (${flow}), Cycle Phase (${phase}), Pain Level (${pain}/10), Primary Mood (${mood}), and Symptoms (${symptomsList}). Explain the physiological state of this phase and offer practical wellness/dietary guidance.
2. STRICT PRODUCT ESSENTIALS RULES FOR "recommendedProducts":
   - IF Flow Level is 'None' AND (Pain Level > 0 OR symptoms include cramps): Recommend ONLY Cramp Relief Herbal Heat Patches (~₹249). Do NOT recommend pads, tampons, or cups.
   - IF Flow Level is 'None' AND Pain Level is 0 AND no cramps logged: Return EMPTY ARRAY [] for "recommendedProducts" and state that no product essentials are required.
   - IF Flow Level is 'Spotting' OR 'Light': Recommend Menstrual Cup (~₹399) / Tampons (~₹299) AND Heat Patches.
   - IF Flow Level is 'Medium' OR 'Heavy': Recommend XL Sanitary Pads (~₹280) AND Heat Patches.
3. Provide 2-3 actionable next steps.
4. Do NOT fabricate symptoms, cycle data, or medical diagnoses.`;

    } else if (type === 'PREGNANCY') {
      reportTitle = 'Pregnancy Companion Gestational Record';
      const week = reportData.week || 16;
      const trimester = reportData.trimester || 2;
      const weight = reportData.weight || '62.5 kg';
      const bp = reportData.bp || '118/76 mmHg';
      const sugar = reportData.bloodSugar || '92 mg/dL';
      const kicksToday = reportData.kicksToday !== undefined ? reportData.kicksToday : 8;

      rawContent = `User Pregnancy Vitals & Log:
- Gestational Week: Week ${week} (Trimester ${trimester})
- Weight: ${weight}
- Blood Pressure: ${bp}
- Fasting Blood Sugar: ${sugar}
- Fetal Kicks Logged Today: ${kicksToday}`;

      promptInstruction = `INSTRUCTION FOR PREGNANCY AI:
1. Write a long, thorough, and in-depth 6 to 8 line AI health & gestational summary covering week milestone development, fetal movement guidance, maternal vitals evaluation, and dietary care. Do NOT make it short or brief. Provide comprehensive paragraphs.
2. Recommend 2-3 trusted, affordable, branded pregnancy & maternal care products widely available in India at reasonable prices (e.g. Prega News Pregnancy Test Kit (~₹180), Methylfolate & DHA Prenatal Softgels (~₹650), Elemental Iron + Vitamin C Supplement (~₹320), Bio-Oil / Cocoa Butter Stretch Mark Care (~₹450)).
3. Provide 2-3 actionable next steps.`;

    } else {
      promptInstruction = `INSTRUCTION FOR HEALTH REPORT AI:
1. Write a long, thorough, and in-depth 6 to 8 line AI plain-language clinical summary analyzing the measured biomarker values, normal vs abnormal reference ranges, physiological implications, clinical significance, and dietary/lifestyle guidance. Do NOT make it short or brief. Provide comprehensive multi-paragraph explanations.
2. In the summary, state clearly what the measured values mean in plain, understandable language without making definitive medical diagnoses.
3. In "extractedValues", list each measured parameter with exact value, reference range if present, and status (NORMAL, LOW, HIGH).
4. In "nextSteps", list 2-3 non-prescriptive actionable steps.`;
    }
    
    let schemaTemplate = '';
    if (type === 'MENSTRUAL') {
      schemaTemplate = `\`\`\`json
{
  "summary": "Long, thorough, and detailed 6-8 line AI health explanation and guidance for the current cycle phase and physical state without listing raw inputs",
  "keyFindings": ["Physiological observation 1", "Observation 2"],
  "recommendedProducts": ["Whisper Ultra Soft Pads (XL+ Pack of 30) (~₹280) - Soft breathable protection for heavy/medium flow", "Cramp Relief Herbal Heat Patches (Pack of 5) (~₹249) - Fast 8-hour natural heat relief for menstrual pain"],
  "nextSteps": ["Self-care action step 1", "Action step 2"],
  "whenToSeekCare": "When medical evaluation is recommended",
  "suggestsFollowup": true
}
\`\`\``;
    } else if (type === 'PREGNANCY') {
      schemaTemplate = `\`\`\`json
{
  "summary": "Long, thorough, and detailed 6-8 line warm AI guidance explaining fetal development milestones, movement, and nutrition care",
  "keyFindings": ["Milestone observation 1", "Observation 2"],
  "recommendedProducts": ["Methylfolate & DHA Prenatal Supplements (60 Softgels) (~₹650) - Essential maternal folate & fetal brain development", "Doctor Recommended Anti-Stretch Mark Cocoa Oil (~₹450) - Deep skin elasticity & hydration care"],
  "nextSteps": ["Recommended next step 1", "Step 2"],
  "whenToSeekCare": "When to consult a clinician",
  "suggestsFollowup": true
}
\`\`\``;
    } else {
      schemaTemplate = `\`\`\`json
{
  "summary": "Long, thorough, and detailed 6-8 line plain language clinical explanation of report findings, measured parameters, biomarker significance, and self-care recommendations",
  "keyFindings": ["Finding 1 with measured value", "Finding 2"],
  "extractedValues": [
    { "parameter": "Parameter Name", "value": "Measured Value", "status": "NORMAL | LOW | HIGH" }
  ],
  "plainExplanation": "Detailed plain-language explanation of what these laboratory findings mean for long-term health and wellness",
  "generalPrecautions": ["Precaution 1", "Precaution 2"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "whenToSeekCare": "When clinical evaluation is recommended",
  "suggestsFollowup": true
}
\`\`\``;
    }
    
    const reportPrompt = `Analyze the following ${type} input data and generate a structured JSON report.

Input Data:
"""
${rawContent}
"""
Target Language: ${language}

${promptInstruction}

Return a valid JSON block matching this exact JSON schema:
${schemaTemplate}
`.trim();

    const response = await llmService.generateCompletion({
      prompt: reportPrompt,
      conversationHistory: [],
      language,
      userProfile: userData,
      pageContext: type.toLowerCase()
    });

    if (response.error) {
      return {
        error: true,
        summary: response.errorMessage || 'NariCare AI is temporarily unavailable. Please try again shortly.',
        keyFindings: [],
        extractedValues: [],
        recommendedProducts: [],
        plainExplanation: response.errorMessage || 'NariCare AI is temporarily unavailable.',
        generalPrecautions: ["Maintain routine hydration and nutritional intake."],
        nextSteps: [
          "Discuss report findings with a verified female gynecologist or physician.",
          "Save report in your NariCare Health Timeline."
        ],
        whenToSeekCare: "Seek prompt clinical care if you experience severe symptoms, high fever, or sharp abdominal pain.",
        suggestsFollowup: false,
        disclaimer: "⚠️ NariCare AI is temporarily unavailable."
      };
    }

    let parsed = null;
    const jsonMatch = response.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i) || response.text.match(/(\{[\s\S]*\})/);
    const rawJsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : response.text.trim();

    try {
      parsed = JSON.parse(rawJsonStr);
    } catch (e) {
      // Repair trailing commas or unescaped control chars
      const sanitized = rawJsonStr.replace(/,\s*([}\]])/g, '$1').replace(/[\u0000-\u001F]/g, '');
      try {
        parsed = JSON.parse(sanitized);
      } catch (err2) {
        console.warn('JSON repair parse failed, using regex property extractors:', err2.message);
      }
    }

    let summaryText = parsed?.summary;
    if (!summaryText) {
      summaryText = extractFieldFromUnparsedJson(rawJsonStr, 'summary') || extractFieldFromUnparsedJson(response.text, 'summary');
    }
    if (!summaryText) {
      summaryText = stripCodeAndJsonFences(response.text);
    }

    summaryText = stripQuestionsToAsk(stripCodeAndJsonFences(summaryText));
    const rawPlainExpl = parsed?.plainExplanation || extractFieldFromUnparsedJson(rawJsonStr, 'plainExplanation') || summaryText;
    const plainExpl = stripQuestionsToAsk(stripCodeAndJsonFences(rawPlainExpl));
    const seekCare = stripQuestionsToAsk(stripCodeAndJsonFences(parsed?.whenToSeekCare || extractFieldFromUnparsedJson(rawJsonStr, 'whenToSeekCare') || "Consult a healthcare professional if experiencing unusual fatigue, persistent discomfort, or severe symptoms."));

    let rawFindings = parsed?.keyFindings;
    if (!rawFindings || !Array.isArray(rawFindings)) {
      const extracted = extractFieldFromUnparsedJson(rawJsonStr, 'keyFindings');
      if (Array.isArray(extracted)) rawFindings = extracted;
    }

    const cleanFindings = (rawFindings || ["Report parameters parsed by NariCare AI."])
      .map(f => stripQuestionsToAsk(stripCodeAndJsonFences(f)))
      .filter(f => f && !/\?$/.test(f));
    const cleanPrecautions = (parsed?.generalPrecautions || ["Maintain balanced nutrition and adequate rest.", "Keep records updated in your digital vault."])
      .map(p => stripQuestionsToAsk(stripCodeAndJsonFences(p)))
      .filter(p => p && !/\?$/.test(p));

    return {
      error: false,
      summary: summaryText || "NariCare AI report breakdown generated successfully.",
      keyFindings: cleanFindings,
      extractedValues: parsed?.extractedValues || parsed?.highlights || [],
      recommendedProducts: parsed?.recommendedProducts || [],
      plainExplanation: plainExpl,
      generalPrecautions: cleanPrecautions,
      nextSteps: parsed?.nextSteps && parsed.nextSteps.length >= 2
        ? parsed.nextSteps.slice(0, 3).map(s => stripQuestionsToAsk(stripCodeAndJsonFences(s))).filter(s => s && !/\?$/.test(s))
        : [
            "Discuss report findings with a verified clinician during your next visit.",
            "Log symptoms or notes in your NariCare Health Timeline."
          ],
      whenToSeekCare: seekCare,
      suggestsFollowup: typeof parsed?.suggestsFollowup === 'boolean' ? parsed.suggestsFollowup : false,
      disclaimer: parsed?.disclaimer || "⚠️ NariCare AI provides health education based on reported data, not medical diagnosis."
    };
  }
}

export const geminiService = new GeminiAIService();

export async function askNariGemini(args) {
  return geminiService.askNariGemini(args);
}

export async function generateAIReport(args) {
  return geminiService.generateAIReport(args);
}

export function rankHospitalsWithAI(hospitals, userLocation, symptoms) {
  const context = conversationMemory.getContext();
  return hospitalRankingEngine.rankHospitals(hospitals, context);
}

import { analyzeMedicalReport } from './reportExplainerService.js';

export async function analyzeReportWithAI(reportTitle, rawText, langCode, userProfile) {
  return analyzeMedicalReport(reportTitle, rawText, langCode, userProfile);
}
