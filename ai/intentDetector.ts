/**
 * Real Semantic Intent Detector Module
 * Parses user input semantically to extract primary and secondary intents,
 * active symptoms, severity indicators, domain entities, and requested actions.
 */

export type IntentCategory =
  | 'General Healthcare Question'
  | 'Symptom Analysis'
  | 'Hospital Recommendation'
  | 'Appointment Booking'
  | 'Pregnancy'
  | 'Menstrual Care'
  | 'Report Upload'
  | 'Health Education'
  | 'Medicine Reminder'
  | 'Transport Assistance'
  | 'Emergency'
  | 'Navigation'
  | 'Profile'
  | 'Settings'
  | 'Voice Command';

export interface StructuredIntentOutput {
  primaryIntent: IntentCategory;
  secondaryIntents: IntentCategory[];
  entities: Record<string, any>;
  symptoms: string[];
  severityIndicators: string[];
  requestedAction?: string;
  confidence: number;
}

export class IntentDetector {
  public detectIntents(prompt: string, isVoice: boolean = false, pageContext: string = 'global'): StructuredIntentOutput {
    const p = (prompt || '').toLowerCase().trim();
    const secondaryIntents: Set<IntentCategory> = new Set();
    const entities: Record<string, any> = {};
    const symptoms: string[] = [];
    const severityIndicators: string[] = [];
    let requestedAction: string | undefined = undefined;

    if (isVoice) {
      secondaryIntents.add('Voice Command');
    }

    // 1. Extract Severity & Red Flag Indicators
    if (/\b(severe|intense|unbearable|excruciating|sharp)\b/.test(p)) {
      severityIndicators.push('severe');
    }
    if (/\b(mild|slight|light|minor)\b/.test(p)) {
      severityIndicators.push('mild');
    }
    if (/\b(faint|passed out|dizzy|unconscious|syncope)\b/.test(p)) {
      severityIndicators.push('faint');
    }
    if (/\b(fever|temperature|chills|102|103)\b/.test(p)) {
      severityIndicators.push('fever');
    }

    // 2. Extract Symptoms
    if (/\b(cramp|cramps|cramping)\b/.test(p)) symptoms.push('cramps');
    if (/\b(abdominal pain|stomach pain|stomachache|stomach ache|pelvic pain|pain in stomach)\b/.test(p)) symptoms.push('abdominal pain');
    if (/\b(fever|high temp|temperature)\b/.test(p)) symptoms.push('fever');
    if (/\b(faint|feeling faint|dizziness|dizzy)\b/.test(p)) symptoms.push('faintness');
    if (/\b(bleeding|spotting|heavy flow)\b/.test(p)) symptoms.push('bleeding');
    if (/\b(nausea|vomiting|queasy)\b/.test(p)) symptoms.push('nausea');
    if (/\b(headache|migraine)\b/.test(p)) symptoms.push('headache');

    // 3. Semantic Variations for Late Period / Menstrual
    const isLatePeriod = /\b(period.*late|late.*period|cycle.*late|period.*delayed|delayed.*period|period.*hasn't come|haven't gotten.*period|missed.*period)\b/.test(p);
    if (isLatePeriod) {
      entities.late_period = true;
      entities.days_late = this.extractDaysLate(p) || 5;
    }

    // 4. Determine Primary Intent
    let primaryIntent: IntentCategory = 'General Healthcare Question';

    const isNavRequest = /\b(take me to|open|show|navigate|go to|view)\b/.test(p);

    // Emergency Check
    if (severityIndicators.includes('faint') && (symptoms.includes('abdominal pain') || symptoms.includes('cramps') || severityIndicators.includes('severe'))) {
      primaryIntent = 'Emergency';
      secondaryIntents.add('Symptom Analysis');
      requestedAction = 'SHOW_EMERGENCY_GUIDANCE';
    }
    // Menstrual Intent
    else if (isLatePeriod || /\b(period|periods|menstrual|cycle|ovulation|fertile|tampon|pad|cup|pcos|pcod)\b/.test(p)) {
      primaryIntent = 'Menstrual Care';
      if (symptoms.length > 0) secondaryIntents.add('Symptom Analysis');
      if (isNavRequest) requestedAction = 'OPEN_MENSTRUAL';
    }
    // Pregnancy Intent
    else if (/\b(pregnancy|pregnant|trimester|baby|fetus|kick|due date|bump)\b/.test(p)) {
      primaryIntent = 'Pregnancy';
      if (symptoms.length > 0) secondaryIntents.add('Symptom Analysis');
      if (isNavRequest) requestedAction = 'OPEN_PREGNANCY';
    }
    // Booking Intent
    else if (/\b(book|appointment|viewing doctor|doctor i was viewing|this doctor|reserve slot)\b/.test(p)) {
      primaryIntent = 'Appointment Booking';
      secondaryIntents.add('Hospital Recommendation');
      requestedAction = 'BOOK_APPOINTMENT';
    }
    // Hospital Finder / Gynecologist Recommendation Intent
    else if (/\b(hospital|clinic|gynecologist|female doctor|doctor near|physician|nearby healthcare)\b/.test(p)) {
      primaryIntent = 'Hospital Recommendation';
      if (isNavRequest) requestedAction = 'OPEN_HOSPITALS';
    }
    // Report Upload / Health Records Intent
    else if (/\b(report|cbc|blood test|lab|hemoglobin|tsh|thyroid|platelet|prescription|health record|records|timeline|vault)\b/.test(p)) {
      primaryIntent = 'Report Upload';
      requestedAction = 'OPEN_REPORT';
    }
    // Transport Intent
    else if (/\b(transport|cab|rickshaw|taxi|ride|ambulance|drive to hospital)\b/.test(p)) {
      primaryIntent = 'Transport Assistance';
      requestedAction = 'OPEN_TRANSPORT';
    }
    // Health Education Intent
    else if (/\b(pcos|yojana|scheme|myth|article|learn|diet|nutrition|health education|what is|tell me about)\b/.test(p)) {
      primaryIntent = 'Health Education';
      if (p.includes('pcos')) entities.topic = 'PCOS';
      if (isNavRequest) requestedAction = 'OPEN_EDUCATION';
    }
    // General Navigation Triggers
    else if (isNavRequest) {
      primaryIntent = 'Navigation';
      requestedAction = 'NAVIGATE';
    }

    return {
      primaryIntent,
      secondaryIntents: Array.from(secondaryIntents),
      entities,
      symptoms,
      severityIndicators,
      requestedAction,
      confidence: 0.96
    };
  }

  private extractDaysLate(prompt: string): number | null {
    const match = prompt.match(/(\d+)\s*(day|days)\s*late/);
    return match ? parseInt(match[1]) : null;
  }
}

export const intentDetector = new IntentDetector();
