/**
 * MahilaCare User-Scoped Health Storage Engine
 * 
 * Provides prototype persistent storage using browser localStorage scoped
 * strictly to the authenticated user's ID/email namespace.
 * 
 * Ensures:
 * - Data isolation between authenticated users.
 * - Prevention of duplicate entries during re-renders.
 * - Separation of original health records from AI interpretations.
 * - Zero external network/LLM API calls during storage operations.
 */

const STORAGE_PREFIX = 'naricare_usr_v1';

/**
 * Derives a clean, safe namespace key for the authenticated user.
 */
export const getUserStorageKey = (user) => {
  const identifier = user?.email || user?.id || user?.name || 'anonymous';
  const cleanId = String(identifier).toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${STORAGE_PREFIX}_${cleanId}`;
};

const getDynamicDateString = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
};

const getDynamicISODate = (daysOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

/**
 * Default initial seed data for demonstration user
 */
export const DEFAULT_INITIAL_RECORDS = [
  {
    id: 'rec_demo_101',
    isDemo: true,
    title: 'Complete Blood Count (CBC)',
    doctor: 'City Care Diagnostics',
    date: getDynamicDateString(-15),
    type: 'Lab Report',
    status: 'Report Available',
    description: 'Laboratory CBC blood report showing measured hemoglobin and hematocrit levels.',
    sampleValues: [
      { parameter: 'Hemoglobin', value: '10.2 g/dL', reference: '12.0 - 15.5 g/dL', status: 'LOW' },
      { parameter: 'Hematocrit', value: '31%', reference: '36% - 46%', status: 'LOW' },
      { parameter: 'RBC Count', value: '3.8 M/µL', reference: '4.0 - 5.2 M/µL', status: 'LOW' },
      { parameter: 'WBC Count', value: '6,500 /µL', reference: '4,500 - 11,000 /µL', status: 'NORMAL' },
      { parameter: 'Platelet Count', value: '250,000 /µL', reference: '150,000 - 450,000 /µL', status: 'NORMAL' }
    ],
    rawReportData: `Facility: City Care Diagnostics\n\nTEST PARAMETERS & RESULTS:\n1. Hemoglobin: 10.2 g/dL (Reference Range: 12.0 - 15.5 g/dL) [LOW]\n2. Hematocrit: 31% (Reference Range: 36% - 46%) [LOW]\n3. Red Blood Cell (RBC) Count: 3.8 Million/µL (Reference Range: 4.0 - 5.2 Million/µL) [LOW]\n4. White Blood Cell (WBC) Count: 6,500 /µL (Reference Range: 4,500 - 11,000 /µL) [NORMAL]\n5. Platelet Count: 250,000 /µL (Reference Range: 150,000 - 450,000 /µL) [NORMAL]\n\nClinical Impression: Microcytic hypochromic indices suggestive of mild iron-deficiency anemia.`
  },
  {
    id: 'rec_demo_102',
    isDemo: true,
    title: 'Thyroid Profile (T3, T4, TSH)',
    doctor: 'Metro Wellness Labs',
    date: getDynamicDateString(-30),
    type: 'Lab Report',
    status: 'Report Available',
    description: 'Endocrinology thyroid screening report showing measured TSH level.',
    sampleValues: [
      { parameter: 'Serum TSH', value: '6.8 mIU/L', reference: '0.4 - 4.2 mIU/L', status: 'HIGH' },
      { parameter: 'Total T4', value: '7.1 µg/dL', reference: '4.5 - 12.0 µg/dL', status: 'NORMAL' },
      { parameter: 'Total T3', value: '115 ng/dL', reference: '80 - 200 ng/dL', status: 'NORMAL' }
    ],
    rawReportData: `Facility: Metro Wellness Labs\n\nTEST PARAMETERS & RESULTS:\n1. Serum TSH (Thyroid Stimulating Hormone): 6.8 mIU/L (Reference Range: 0.4 - 4.2 mIU/L) [HIGH]\n2. Total T4 (Thyroxine): 7.1 µg/dL (Reference Range: 4.5 - 12.0 µg/dL) [NORMAL]\n3. Total T3 (Triiodothyronine): 115 ng/dL (Reference Range: 80 - 200 ng/dL) [NORMAL]\n\nClinical Impression: Elevated TSH with normal free thyroid hormone levels (mild subclinical hypothyroidism profile).`
  },
  {
    id: 'rec_demo_103',
    isDemo: true,
    title: 'Metabolic & Glycemic Panel',
    doctor: 'Apex Healthcare Center',
    date: getDynamicDateString(-48),
    type: 'Lab Report',
    status: 'Report Available',
    description: 'Metabolic screening report showing blood glucose & renal markers.',
    sampleValues: [
      { parameter: 'Fasting Blood Sugar (FBS)', value: '88 mg/dL', reference: '70 - 99 mg/dL', status: 'NORMAL' },
      { parameter: 'Postprandial Blood Sugar (PPBS)', value: '125 mg/dL', reference: '< 140 mg/dL', status: 'NORMAL' },
      { parameter: 'HbA1c', value: '5.4%', reference: '< 5.7%', status: 'NORMAL' },
      { parameter: 'Serum Creatinine', value: '0.8 mg/dL', reference: '0.6 - 1.1 mg/dL', status: 'NORMAL' }
    ],
    rawReportData: `Facility: Apex Healthcare Center\n\nTEST PARAMETERS & RESULTS:\n1. Fasting Blood Sugar (FBS): 88 mg/dL (Reference Range: 70 - 99 mg/dL) [NORMAL]\n2. Postprandial Blood Sugar (PPBS): 125 mg/dL (Reference Range: < 140 mg/dL) [NORMAL]\n3. HbA1c (Glycated Hemoglobin): 5.4% (Reference Range: < 5.7%) [NORMAL]\n4. Serum Creatinine: 0.8 mg/dL (Reference Range: 0.6 - 1.1 mg/dL) [NORMAL]\n\nClinical Impression: All glycemic and renal parameters within target normal reference ranges.`
  }
];

const DEFAULT_CYCLE_DATA = {
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: getDynamicISODate(-13),
  currentDay: 14,
  phase: 'Ovulation / Fertile Window',
  fertileDays: 'Not Calculated',
  chanceOfPregnancy: 'High',
  symptoms: ['Mild Cramps', 'Clear Skin', 'Energetic']
};

const DEFAULT_PREGNANCY_DETAILS = {
  enabled: false,
  week: 16,
  trimester: 2,
  dueDate: getDynamicDateString(168),
  babySize: 'Avocado (4.5 inches)',
  weightGain: '+3.2 kg',
  kicksToday: 8,
  bumpPhotos: []
};

const DEFAULT_REMINDERS = [
  { id: 1, title: 'Iron & Folic Acid Supplement', time: '02:00 PM', type: 'pill', completed: false, repeat: 'Daily' },
  { id: 2, title: 'Hydration Target (500ml Water)', time: '04:30 PM', type: 'water', completed: true, repeat: 'Hourly' },
  { id: 3, title: 'Dr. Priya Nair Consultation', time: 'Tomorrow, 11:00 AM', type: 'appointment', completed: false, repeat: 'Once' }
];

export const userHealthStorage = {
  /**
   * Hydrates all health data for a given user from browser storage
   */
  loadUserData(user) {
    const targetUser = user || { email: 'guest_user@naricare.ai', name: 'Guest User' };
    const userKey = getUserStorageKey(targetUser);

    try {
      if (typeof localStorage === 'undefined') {
        return {
          records: DEFAULT_INITIAL_RECORDS,
          cycleData: DEFAULT_CYCLE_DATA,
          pregnancyDetails: DEFAULT_PREGNANCY_DETAILS,
          isPregnancyEnabled: false,
          reminders: DEFAULT_REMINDERS,
          symptomHistory: [],
          chatHistory: []
        };
      }

      const rawData = localStorage.getItem(userKey);
      if (!rawData) {
        // Seed default records so all users have initial demo records available
        const initialData = {
          records: DEFAULT_INITIAL_RECORDS,
          cycleData: DEFAULT_CYCLE_DATA,
          pregnancyDetails: DEFAULT_PREGNANCY_DETAILS,
          isPregnancyEnabled: false,
          reminders: DEFAULT_REMINDERS,
          symptomHistory: [],
          chatHistory: []
        };
        
        localStorage.setItem(userKey, JSON.stringify(initialData));
        return initialData;
      }

      const parsed = JSON.parse(rawData);
      // Ensure default demo records are present if empty or missing
      if (!parsed.records || parsed.records.length === 0) {
        parsed.records = DEFAULT_INITIAL_RECORDS;
      } else {
        const missingDemos = DEFAULT_INITIAL_RECORDS.filter(d => !parsed.records.some(r => r.id === d.id));
        if (missingDemos.length > 0) {
          parsed.records = [...DEFAULT_INITIAL_RECORDS.filter(d => missingDemos.some(m => m.id === d.id)), ...parsed.records];
        }

        parsed.records = parsed.records.map((r) => {
          const { cachedAnalysis, ...rest } = r;
          const matchDefault = DEFAULT_INITIAL_RECORDS.find((d) => d.id === r.id);
          if (matchDefault) {
            return { ...matchDefault, ...rest, sampleValues: matchDefault.sampleValues };
          }
          return rest;
        });
      }

      return parsed;
    } catch (err) {
      console.warn('userHealthStorage: Error loading user storage:', err);
      return {
        records: DEFAULT_INITIAL_RECORDS,
        cycleData: DEFAULT_CYCLE_DATA,
        pregnancyDetails: DEFAULT_PREGNANCY_DETAILS,
        isPregnancyEnabled: false,
        reminders: DEFAULT_REMINDERS,
        symptomHistory: [],
        chatHistory: []
      };
    }
  },

  /**
   * Saves updated health records array for the user
   */
  saveHealthRecords(user, records) {
    if (!user) return;
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      // Deduplicate records by ID
      const uniqueRecords = [];
      const seenIds = new Set();
      
      for (const rec of records) {
        const id = rec.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        if (!seenIds.has(String(id))) {
          seenIds.add(String(id));
          uniqueRecords.push({ ...rec, id });
        }
      }

      const updated = { ...existing, records: uniqueRecords };
      localStorage.setItem(userKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('userHealthStorage: Error saving health records:', err);
    }
  },

  /**
   * Saves updated cycle data for the user
   */
  saveCycleData(user, cycleData) {
    if (!user) return;
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      const updated = { ...existing, cycleData };
      localStorage.setItem(userKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('userHealthStorage: Error saving cycle data:', err);
    }
  },

  /**
   * Saves updated pregnancy companion details for the user
   */
  savePregnancyDetails(user, pregnancyDetails, isPregnancyEnabled) {
    if (!user) return;
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      const updated = {
        ...existing,
        pregnancyDetails,
        isPregnancyEnabled: isPregnancyEnabled ?? existing.isPregnancyEnabled
      };
      localStorage.setItem(userKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('userHealthStorage: Error saving pregnancy details:', err);
    }
  },

  /**
   * Saves reminders array for the user
   */
  saveReminders(user, reminders) {
    if (!user) return;
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      localStorage.setItem(userKey, JSON.stringify({ ...existing, reminders }));
    } catch (err) {
      console.warn('userHealthStorage: Error saving reminders:', err);
    }
  },

  /**
   * Appends or updates symptoms in user's symptom history log
   */
  saveSymptomHistory(user, symptomHistory) {
    if (!user) return;
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      localStorage.setItem(userKey, JSON.stringify({ ...existing, symptomHistory }));
    } catch (err) {
      console.warn('userHealthStorage: Error saving symptom history:', err);
    }
  },

  /**
   * Saves conversation chat messages for MahilaCare AI continuity
   */
  saveAIChatHistory(user, chatMessages) {
    if (!user) return;
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      localStorage.setItem(userKey, JSON.stringify({ ...existing, chatHistory: chatMessages }));
    } catch (err) {
      console.warn('userHealthStorage: Error saving chat history:', err);
    }
  },

  /**
   * Deletes a specific health record by ID
   */
  deleteHealthRecord(user, recordId) {
    if (!user || !recordId) return [];
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      const updatedRecords = (existing.records || []).filter(r => r.id !== recordId);
      localStorage.setItem(userKey, JSON.stringify({ ...existing, records: updatedRecords }));
      return updatedRecords;
    } catch (err) {
      console.warn('userHealthStorage: Error deleting health record:', err);
      return [];
    }
  },

  /**
   * Deletes a specific reminder by ID
   */
  deleteReminder(user, reminderId) {
    if (!user || !reminderId) return [];
    const userKey = getUserStorageKey(user);
    try {
      const existing = this.loadUserData(user) || {};
      const updatedReminders = (existing.reminders || []).filter(r => r.id !== reminderId);
      localStorage.setItem(userKey, JSON.stringify({ ...existing, reminders: updatedReminders }));
      return updatedReminders;
    } catch (err) {
      console.warn('userHealthStorage: Error deleting reminder:', err);
      return [];
    }
  }
};
