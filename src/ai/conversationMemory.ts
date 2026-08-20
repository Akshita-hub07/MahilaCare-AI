/**
 * Real Conversation Memory Module
 * Manages multi-turn conversation history, active domain context, anaphoric references,
 * active page, viewing entity (e.g. selected doctor), and health history.
 */

export interface MessageRecord {
  id: string;
  sender: 'user' | 'nari';
  text: string;
  timestamp: string;
  intentData?: any;
  engineOutput?: any;
  actionTrigger?: any;
}

export interface ActiveContextState {
  currentPage: string;
  activeDoctorInView?: { id: number; name: string; hospital: string; consultFee: string };
  activeHospitalInView?: { id: number; name: string };
  activeReportInView?: { id: string; title: string };
  lastMentionedDomain?: 'menstrual' | 'pregnancy' | 'symptom' | 'hospital' | 'report' | 'reminder' | 'transport';
  lastSymptoms: string[];
  lastEntities: string[];
}

export interface UserHealthContext {
  language: string; // 'en', 'hi', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'gu', 'mr'
  userName: string;
  userAge: number;
  searchRadius: string;
  femaleDoctorsOnly: boolean;
  existingConditions: string[];
  symptomHistory: Array<{ date: string; symptom: string; urgency: string; region?: string }>;
  reportHistory: Array<{ id: string; title: string; date: string; status: string; highlights?: any[] }>;
  pregnancyDetails: {
    enabled: boolean;
    week: number;
    trimester: number;
    dueDate: string;
    kicksToday: number;
    weight: string;
    bloodPressure: string;
    bloodSugar: string;
  };
  menstrualHistory: {
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: string;
    currentDay: number;
    phase: string;
    symptomsLogged: string[];
    painLevel: number;
    flowLevel: string;
  };
  bookedAppointments: Array<{ id: string; hospital: string; doctor: string; date: string; time: string; fee: string }>;
  preferredHospitals: Array<{ id: number; name: string; suitabilityScore: number }>;
  transportPreference: {
    enabled: boolean;
    preferredMode: string;
    emergencyAmbulanceRequested: boolean;
  };
  reminders: Array<{ id: number; title: string; time: string; type: string; completed: boolean; repeat: string }>;
  activeState: ActiveContextState;
}

class ConversationMemoryManager {
  private messages: MessageRecord[] = [];
  private context: UserHealthContext;

  constructor() {
    this.context = {
      language: 'en',
      userName: 'Ananya Sharma',
      userAge: 28,
      searchRadius: '10 km',
      femaleDoctorsOnly: true,
      existingConditions: ['Mild Anemia'],
      symptomHistory: [],
      reportHistory: [],
      pregnancyDetails: {
        enabled: false,
        week: 16,
        trimester: 2,
        dueDate: '2027-01-15',
        kicksToday: 8,
        weight: '62.5 kg',
        bloodPressure: '118/76 mmHg',
        bloodSugar: '92 mg/dL'
      },
      menstrualHistory: {
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: '2026-07-26',
        currentDay: 13,
        phase: 'Ovulation / Fertile Window',
        symptomsLogged: ['Mild Cramps', 'Clear Skin'],
        painLevel: 4,
        flowLevel: 'Medium'
      },
      bookedAppointments: [],
      preferredHospitals: [],
      transportPreference: {
        enabled: true,
        preferredMode: 'Private AC Cab',
        emergencyAmbulanceRequested: false
      },
      reminders: [
        { id: 1, title: 'Iron & Folic Acid Supplement', time: '02:00 PM', type: 'pill', completed: false, repeat: 'Daily' },
        { id: 2, title: 'Hydration Target (500ml Water)', time: '04:30 PM', type: 'water', completed: true, repeat: 'Hourly' }
      ],
      activeState: {
        currentPage: 'Dashboard',
        activeDoctorInView: { id: 1, name: 'Dr. Priya Nair', hospital: 'Apollo Women Healthcare Center', consultFee: '₹800' },
        lastSymptoms: [],
        lastEntities: []
      }
    };
  }

  public getContext(): UserHealthContext {
    return this.context;
  }

  public updateContext(partialContext: Partial<UserHealthContext>): void {
    this.context = { ...this.context, ...partialContext };
  }

  public updateActiveState(partialState: Partial<ActiveContextState>): void {
    this.context.activeState = { ...this.context.activeState, ...partialState };
  }

  public addMessage(message: MessageRecord): void {
    this.messages.push(message);
  }

  public getMessages(): MessageRecord[] {
    return this.messages;
  }

  public getLastMessage(): MessageRecord | undefined {
    return this.messages[this.messages.length - 1];
  }

  /**
   * Resolves anaphora or corrections in user prompts (e.g. "I also have pain", "Actually I meant pregnancy, not periods")
   */
  public resolveContextualPrompt(prompt: string): { resolvedPrompt: string; domainOverride?: string } {
    const p = prompt.toLowerCase();

    // Check for correction intent (e.g. "Actually I meant pregnancy, not periods")
    if (p.includes('meant pregnancy') || p.includes('not periods') || p.includes('pregnancy not period')) {
      this.context.activeState.lastMentionedDomain = 'pregnancy';
      this.context.pregnancyDetails.enabled = true;
      return {
        resolvedPrompt: prompt,
        domainOverride: 'pregnancy'
      };
    }

    // Check for continuation ("also", "and", "plus")
    if ((p.includes('also') || p.startsWith('and ') || p.includes('plus')) && this.context.activeState.lastMentionedDomain) {
      const domain = this.context.activeState.lastMentionedDomain;
      return {
        resolvedPrompt: `[Context: Continued ${domain} discussion] ${prompt}`,
        domainOverride: domain
      };
    }

    return { resolvedPrompt: prompt };
  }

  public setLanguage(lang: string): void {
    this.context.language = lang;
  }

  public setCurrentPage(pageName: string): void {
    this.context.activeState.currentPage = pageName;
  }

  public clearMemory(): void {
    this.messages = [];
  }

  /**
   * Hydrates memory context from active user's persistent storage
   */
  public hydrateFromUserStorage(storedData: any, user: any): void {
    if (!user) return;
    this.context.userName = user.name || 'User';
    this.context.userAge = user.age || 28;
    if (storedData) {
      if (storedData.records) {
        this.context.reportHistory = storedData.records.map((r: any) => ({
          id: String(r.id),
          title: r.title,
          date: r.date,
          status: r.status,
          highlights: r.cachedAnalysis ? [r.cachedAnalysis.summary] : []
        }));
      }
      if (storedData.cycleData) {
        this.context.menstrualHistory = {
          cycleLength: storedData.cycleData.cycleLength || 28,
          periodLength: storedData.cycleData.periodLength || 5,
          lastPeriodStart: storedData.cycleData.lastPeriodStart || '2026-07-26',
          currentDay: storedData.cycleData.currentDay || 1,
          phase: storedData.cycleData.phase || 'Follicular Phase',
          symptomsLogged: storedData.cycleData.symptoms || [],
          painLevel: storedData.cycleData.painLevel || 0,
          flowLevel: storedData.cycleData.flowLevel || 'Medium'
        };
      }
      if (storedData.pregnancyDetails) {
        this.context.pregnancyDetails = {
          enabled: !!storedData.isPregnancyEnabled,
          week: storedData.pregnancyDetails.week || 16,
          trimester: storedData.pregnancyDetails.trimester || 2,
          dueDate: storedData.pregnancyDetails.dueDate || '2027-01-15',
          kicksToday: storedData.pregnancyDetails.kicksToday || 0,
          weight: storedData.pregnancyDetails.weightGain || '62 kg',
          bloodPressure: '118/76 mmHg',
          bloodSugar: '92 mg/dL'
        };
      }
      if (storedData.reminders) {
        this.context.reminders = storedData.reminders;
      }
      if (storedData.symptomHistory) {
        this.context.symptomHistory = storedData.symptomHistory;
      }
    }
  }
}

export const conversationMemory = new ConversationMemoryManager();
