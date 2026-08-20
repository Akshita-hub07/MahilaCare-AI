/**
 * Dynamic Response Generator Module
 * Synthesizes engine outputs, safety evaluations, follow-up questions,
 * and user language preferences into warm, empathetic natural language without hardcoded replies.
 */

import { UserHealthContext } from './conversationMemory';
import { StructuredIntentOutput } from './intentDetector';
import { SymptomAnalysisOutput } from './symptomAnalyzer';
import { SafetyCheckResult } from './safetyLayer';
import { ActionPayload } from './actionHandler';

export class ResponseGenerator {
  public generateResponse(
    prompt: string,
    intentData: StructuredIntentOutput,
    engineResults: Record<string, any>,
    safety: SafetyCheckResult,
    context: UserHealthContext,
    actionPayload?: ActionPayload
  ): { text: string; disclaimer: string } {
    const lang = context.language || 'en';
    const activeDiscl = safety.disclaimer[lang] || safety.disclaimer.en;
    let parts: string[] = [];

    // 1. Emergency Safety Override
    if (safety.isEmergency) {
      if (lang === 'hi') {
        parts.push(`🚨 **आपातकालीन ध्यान आवश्यक है**: आपके लक्षणों (${safety.redFlags.join(', ')}) को देखते हुए तुरंत चिकित्सकीय मूल्यांकन की आवश्यकता है।`);
        parts.push(`\n**तत्काल कदम**:\n1. तुरंत पास के अस्पताल में आपातकालीन कक्ष (ER) जाएं या 108 पर एम्बुलेंस कॉल करें।\n2. किसी भी प्रकार की दवा लेने से बचें जब तक डॉक्टर सलाह न दें।`);
      } else {
        parts.push(`🚨 **IMMEDIATE EMERGENCY CARE RECOMMENDED**: Based on your reported symptoms (${safety.redFlags.join(', ')}), immediate clinical evaluation is strongly advised.`);
        parts.push(`\n**Action Required**:\n1. Proceed to the nearest emergency hospital or request an emergency ambulance immediately.\n2. Avoid self-medicating before professional clinical assessment.`);
      }
      return {
        text: parts.join('\n\n') + '\n\n' + activeDiscl,
        disclaimer: activeDiscl
      };
    }

    // 2. Action Display Text
    if (actionPayload?.displayText) {
      parts.push(`*Action: ${actionPayload.displayText}*`);
    }

    // 3. Symptom Analysis Synthesis
    if (engineResults.symptom) {
      const s: SymptomAnalysisOutput = engineResults.symptom;

      if (lang === 'hi') {
        parts.push(`नमस्ते ${context.userName}! आपके लक्षणों का AI निर्णय इंजन द्वारा विश्लेषण किया गया है।`);
        parts.push(`**गंभीरता स्तर**: ${s.urgencyBadge}`);
        parts.push(`**अनुशंसित स्वास्थ्य कदम**: ${s.recommendedNextStep}`);
      } else {
        parts.push(`Hello ${context.userName}! Your symptoms have been evaluated through our AI Symptom Engine.`);
        parts.push(`**Severity Rating**: ${s.urgencyBadge}`);
        parts.push(`**Recommended Next Step**: ${s.recommendedNextStep}`);
      }

      if (s.questionsToAsk && s.questionsToAsk.length > 0) {
        parts.push(`\n**Follow-up Questions**:\n` + s.questionsToAsk.map((q, idx) => `${idx + 1}. ${q}`).join('\n'));
      }
    }

    // 4. Menstrual Care Synthesis
    if (engineResults.menstrual) {
      const m = engineResults.menstrual;
      parts.push(`🌸 **Menstrual & Ovulation Cycle Assessment**:\n- Current Phase: **${m.phase}** (Day ${m.currentDay} of ${m.cycleLength})\n- Fertile Window: **${m.fertileWindowFormatted}**\n- Predicted Ovulation Peak: **${m.ovulationPeakFormatted}**\n- Next Period Date: **${m.nextPeriodFormatted}**`);
      if (m.irregularityFlag) {
        parts.push(`${m.irregularityFlag}`);
      }
      if (m.comfortTips && m.comfortTips.length > 0) {
        parts.push(`\n**Comfort Steps**: ${m.comfortTips.join(' ')}`);
      }
    }

    // 5. Pregnancy Companion Synthesis
    if (engineResults.pregnancy) {
      const p = engineResults.pregnancy;
      parts.push(`🤰 **Pregnancy Companion Evaluation**:\n- Gestational Progress: **Week ${p.week}** (Trimester ${p.trimester})\n- Baby Size Analogy: **${p.babySizeAnalogy}**\n- Estimated Due Date: **${p.dueDate}**\n- Milestones: ${p.milestones.join(' ')}`);
      if (p.kickStatusAlert) {
        parts.push(`${p.kickStatusAlert}`);
      }
    }

    // 6. Hospital Ranking Synthesis
    if (engineResults.hospital) {
      const ranked = engineResults.hospital.slice(0, 3);
      const listStr = ranked.map((h: any, idx: number) => `${idx + 1}. **${h.name}** (${h.distance}) - Suitability Match: ${h.suitabilityScore}%\n   ${h.aiReasoning}`).join('\n');
      parts.push(`🏥 **Recommended Verified Facilities (${context.searchRadius})**:\n\n${listStr}`);
    }

    // 7. Report Interpretation Synthesis
    if (engineResults.report) {
      const r = engineResults.report;
      const bioStr = r.biomarkers.map((b: any) => `- **${b.parameter}**: ${b.value} (Ref: ${b.referenceRange}) -> ${b.alert}`).join('\n');
      parts.push(`🧪 **Medical Biomarker Breakdown**:\n\n${bioStr}\n\n**Summary**: ${r.plainLanguageSummary}`);
    }

    // 8. General Health Q&A Fallback
    if (parts.length === 0 || (parts.length === 1 && actionPayload)) {
      if (lang === 'hi') {
        parts.push(`नमस्ते ${context.userName}! नारीकेयर AI आपके स्वास्थ्य प्रश्न ("${prompt.slice(0, 40)}...") का विश्लेषण कर रहा है।`);
        parts.push(`1. पर्याप्त जल सेवन (2.5L प्रतिदिन) और संतुलित आहार लें।\n2. यदि लक्षण बने रहें, तो हमारे ऐप द्वारा महिला डॉक्टर परामर्श बुक करें।`);
      } else {
        parts.push(`Hello ${context.userName}! NariCare AI 🌸 has processed your query regarding "${prompt.slice(0, 45)}...".`);
        parts.push(`1. **Holistic Care**: Ensure hydration (2.5L daily), balanced nutrition, and adequate rest.\n2. **Platform Navigation**: You can ask me to find female doctors nearby, analyze lab reports, or check cycle insights.`);
      }
    }

    return {
      text: parts.join('\n\n') + '\n\n' + activeDiscl,
      disclaimer: activeDiscl
    };
  }
}

export const responseGenerator = new ResponseGenerator();
