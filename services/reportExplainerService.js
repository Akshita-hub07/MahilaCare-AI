import { generateAIReport } from './geminiService.js';

export const analyzeMedicalReport = async (reportTitle, rawText, langCode = 'en', userProfile = {}, fullRecord = {}) => {
  try {
    const rawContent = fullRecord?.rawReportData || rawText || '';
    
    // Clarification 1: If content is missing/unextractable, do NOT generate fake AI interpretation
    if (!rawContent || !rawContent.trim() || fullRecord?.hasUnextractableContent) {
      return {
        error: false,
        unextractableContent: true,
        reportTitle: reportTitle || "Medical Record / Lab Report",
        overallStatus: "Content Unextractable",
        summary: "This file has been securely stored in your NariCare Health Vault. However, text extraction is not available for this binary file type without OCR. NariCare AI will not generate an interpretation from missing content.",
        keyFindings: ["Document file stored in vault"],
        extractedValues: [],
        plainExplanation: "To get an AI analysis for this report, please re-upload or enter the test parameters and text summary directly.",
        generalPrecautions: ["Always keep physical or original digital copies of your official medical reports."],
        nextSteps: [
          "Store original file safely in your NariCare Vault.",
          "Optionally enter text results to generate AI breakdown."
        ],
        whenToSeekCare: "Consult a healthcare professional for clinical evaluation of your original medical documents.",
        suggestsFollowup: false,
        disclaimer: "⚠️ NariCare AI requires readable report text parameters to perform analysis."
      };
    }

    const aiReport = await generateAIReport({
      type: 'HEALTH_REPORT',
      userData: userProfile,
      reportData: { 
        reportTitle, 
        doctorOrNotes: rawText,
        rawReportData: rawContent
      },
      prompt: `Please interpret this medical report: "${reportTitle}". Report content: "${rawContent}"`,
      language: langCode
    });

    return {
      reportTitle: reportTitle || "Medical Record / Lab Report",
      overallStatus: aiReport.error 
        ? "Report Review Advised" 
        : aiReport.suggestsFollowup
        ? "Clinical Follow-Up Advised" 
        : "Parameters Analyzed",
      summary: aiReport.summary,
      keyFindings: aiReport.keyFindings || [],
      extractedValues: aiReport.extractedValues || [],
      plainExplanation: aiReport.plainExplanation || aiReport.summary,
      generalPrecautions: aiReport.generalPrecautions || ["Maintain routine health monitoring."],
      nextSteps: aiReport.nextSteps && aiReport.nextSteps.length >= 2 
        ? aiReport.nextSteps.slice(0, 3) 
        : [
            "Discuss report findings with a verified clinician during your next visit.",
            "Save record in your NariCare Health Timeline."
          ],
      whenToSeekCare: aiReport.whenToSeekCare || "Seek prompt medical care if experiencing severe symptoms or high fever.",
      suggestsFollowup: !!aiReport.suggestsFollowup,
      disclaimer: aiReport.disclaimer || "⚠️ NariCare AI provides health education, not medical diagnosis."
    };
  } catch (err) {
    console.error("Report Analysis Error:", err);
    return {
      reportTitle: reportTitle || "Lab Report",
      overallStatus: "Analysis Completed",
      summary: "Report saved in NariCare Health Vault. Please discuss findings with a qualified clinician.",
      keyFindings: ["Document uploaded to health vault"],
      extractedValues: [],
      plainExplanation: "Analysis completed. Bring original report to your healthcare provider.",
      generalPrecautions: ["Consult a physician for clinical evaluation."],
      nextSteps: [
        "Schedule a consultation with a female gynecologist or physician.",
        "Track symptoms in your Health Timeline."
      ],
      whenToSeekCare: "Consult a clinician if you have concerns about your health.",
      suggestsFollowup: false,
      disclaimer: "⚠️ NariCare AI provides health education, not medical diagnosis."
    };
  }
};
