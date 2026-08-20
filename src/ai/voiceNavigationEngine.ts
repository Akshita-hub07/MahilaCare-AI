/**
 * Voice Navigation Engine
 * Interprets natural voice commands and natural language triggers to automate React Router navigation
 * and application-wide language switching.
 */

export interface VoiceNavigationOutput {
  actionType: 'NAVIGATE' | 'SWITCH_LANGUAGE' | 'NO_ACTION';
  targetRoute?: string;
  targetLanguage?: string;
  speechResponse: string;
}

export class VoiceNavigationEngine {
  public processVoiceCommand(promptText: string): VoiceNavigationOutput {
    const p = (promptText || '').toLowerCase().trim();

    // 1. Language Change Intents
    if (p.includes('hindi') || p.includes('हिंदी')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'hi', speechResponse: 'Switching application language to Hindi.' };
    if (p.includes('punjabi') || p.includes('ਪੰਜਾਬੀ')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'pa', speechResponse: 'Switching application language to Punjabi.' };
    if (p.includes('bengali') || p.includes('বাংলা')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'bn', speechResponse: 'Switching application language to Bengali.' };
    if (p.includes('tamil') || p.includes('தமிழ்')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'ta', speechResponse: 'Switching application language to Tamil.' };
    if (p.includes('telugu') || p.includes('తెలుగు')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'te', speechResponse: 'Switching application language to Telugu.' };
    if (p.includes('kannada') || p.includes('ಕನ್ನಡ')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'kn', speechResponse: 'Switching application language to Kannada.' };
    if (p.includes('malayalam') || p.includes('മലയാളം')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'ml', speechResponse: 'Switching application language to Malayalam.' };
    if (p.includes('gujarati') || p.includes('ગુજરાતી')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'gu', speechResponse: 'Switching application language to Gujarati.' };
    if (p.includes('marathi') || p.includes('मराठी')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'mr', speechResponse: 'Switching application language to Marathi.' };
    if (p.includes('english')) return { actionType: 'SWITCH_LANGUAGE', targetLanguage: 'en', speechResponse: 'Switching application language to English.' };

    // 2. Navigation Triggers
    if (p.includes('book') || p.includes('appointment') || p.includes('nearby hospital') || p.includes('gynecologist') || p.includes('find doctor') || p.includes('clinic')) {
      return { actionType: 'NAVIGATE', targetRoute: '/nearby', speechResponse: 'Opening Find Healthcare page to browse verified female doctors and book appointments.' };
    }
    if (p.includes('upload report') || p.includes('my reports') || p.includes('health timeline') || p.includes('health record') || p.includes('lab vault')) {
      return { actionType: 'NAVIGATE', targetRoute: '/timeline', speechResponse: 'Opening Health Timeline & Records Vault.' };
    }
    if (p.includes('pregnancy progress') || p.includes('trimester') || p.includes('baby bump') || p.includes('kick count')) {
      return { actionType: 'NAVIGATE', targetRoute: '/pregnancy', speechResponse: 'Opening Pregnancy Companion.' };
    }
    if (p.includes('period advice') || p.includes('menstrual') || p.includes('cycle tracker')) {
      return { actionType: 'NAVIGATE', targetRoute: '/menstrual', speechResponse: 'Opening Menstrual Care AI.' };
    }
    if (p.includes('reminders') || p.includes('medicine timing') || p.includes('pill alert')) {
      return { actionType: 'NAVIGATE', targetRoute: '/reminders', speechResponse: 'Opening Smart Health Reminders.' };
    }
    if (p.includes('profile') || p.includes('settings') || p.includes('emergency contact')) {
      return { actionType: 'NAVIGATE', targetRoute: '/profile', speechResponse: 'Opening Profile & Settings.' };
    }
    if (p.includes('education') || p.includes('health articles') || p.includes('yojana') || p.includes('pcos guide')) {
      return { actionType: 'NAVIGATE', targetRoute: '/education', speechResponse: 'Opening AI Health Education.' };
    }
    if (p.includes('symptom triage') || p.includes('feeling sick')) {
      return { actionType: 'NAVIGATE', targetRoute: '/ai-navigator', speechResponse: 'Opening AI Health Navigator.' };
    }

    return { actionType: 'NO_ACTION', speechResponse: '' };
  }
}

export const voiceNavigationEngine = new VoiceNavigationEngine();
