/**
 * Clinical Symptom Analysis & Urgency Triage Classifier
 * Classifies symptoms into 🟢 Low, 🟡 Moderate, or 🔴 High Priority.
 * Explains rationale and recommends next steps.
 */

export const classifySymptomTriage = (symptomText, bodyRegion = 'pelvic', duration = '1 - 2 Days') => {
  const textLower = (symptomText || '').toLowerCase();

  // High Urgency Criteria (Severe pain, heavy bleeding, high fever, chest pressure, fainting)
  if (
    textLower.includes('severe bleeding') ||
    textLower.includes('faint') ||
    textLower.includes('unbearable pain') ||
    textLower.includes('chest pain') ||
    textLower.includes('shortness of breath') ||
    textLower.includes('high fever') ||
    textLower.includes('vision loss') ||
    textLower.includes('acute labor')
  ) {
    return {
      urgencyLevel: 'High Priority',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      iconColor: 'text-rose-600',
      priorityCode: 'RED',
      symbol: '🔴',
      whySelected: "Red Flag Symptoms Detected: Severe acute distress, potential blood loss, or high systemic inflammation flags require immediate clinical evaluation to prevent complications.",
      summary: "Immediate medical evaluation or emergency hospital admission required.",
      recommendedActions: [
        { label: "Call Emergency Ambulance (108)", type: "emergency", link: "tel:108" },
        { label: "Find Emergency Hospital Near Me", type: "hospital", route: "/nearby" }
      ],
      nextStepCategory: "Emergency Care"
    };
  }

  // Moderate Urgency Criteria (Irregular bleeding, persistent pain >3 days, fever 100°F, lumps, vomiting)
  if (
    textLower.includes('persistent') ||
    textLower.includes('irregular') ||
    textLower.includes('lump') ||
    textLower.includes('vomiting') ||
    textLower.includes('burning urination') ||
    textLower.includes('dizziness') ||
    duration === '3 - 7 Days' ||
    duration === 'More than a Week'
  ) {
    return {
      urgencyLevel: 'Moderate Priority',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      iconColor: 'text-amber-600',
      priorityCode: 'YELLOW',
      symbol: '🟡',
      whySelected: "Sub-acute Symptom Pattern: Symptoms have persisted beyond 48 hours or involve urinary/hormonal discomfort. Clinical consultation and diagnostic lab testing are advised.",
      summary: "Schedule a consultation with a female gynecologist within 24-48 hours.",
      recommendedActions: [
        { label: "Book Female Gynecologist Consult", type: "doctor", route: "/nearby" },
        { label: "Schedule Home Diagnostic Blood Test", type: "lab", route: "/nearby" }
      ],
      nextStepCategory: "Doctor Consultation / Diagnostic Tests"
    };
  }

  // Low Urgency Criteria (Mild cramping, fatigue, acne, bloating, mild headache)
  return {
    urgencyLevel: 'Low Priority',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
    iconColor: 'text-teal-600',
    priorityCode: 'GREEN',
    symbol: '🟢',
    whySelected: "Physiological Response: Symptoms align with routine physiological variations (e.g. standard luteal phase cramping or mild dehydration) with no red flag markers.",
    summary: "Manageable with targeted home care, rest, hydration, and warm compress.",
    recommendedActions: [
      { label: "View Home Care & Herbal Remedies", type: "homecare", route: "/education" },
      { label: "Set Pill & Hydration Reminder", type: "reminder", route: "/reminders" }
    ],
    nextStepCategory: "Home Care & Monitoring"
  };
};
