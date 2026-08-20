/**
 * AI Navigation & Route Action Engine
 * Evaluates natural language navigation triggers and executes React Router actions.
 */

export class NavigationAIEngine {
  evaluateNavigation(promptText) {
    const p = (promptText || '').toLowerCase().trim();

    // 1. Language Switching Triggers
    if (p.includes('hindi') || p.includes('हिंदी')) return { action: 'SWITCH_LANGUAGE', payload: 'hi', text: 'Switching application language to Hindi (हिंदी)...' };
    if (p.includes('punjabi') || p.includes('ਪੰਜਾਬੀ')) return { action: 'SWITCH_LANGUAGE', payload: 'pa', text: 'Switching application language to Punjabi (ਪੰਜਾਬੀ)...' };
    if (p.includes('bengali') || p.includes('বাংলা')) return { action: 'SWITCH_LANGUAGE', payload: 'bn', text: 'Switching application language to Bengali (বাংলা)...' };
    if (p.includes('tamil') || p.includes('தமிழ்')) return { action: 'SWITCH_LANGUAGE', payload: 'ta', text: 'Switching application language to Tamil (தமிழ்)...' };
    if (p.includes('telugu') || p.includes('తెలుగు')) return { action: 'SWITCH_LANGUAGE', payload: 'te', text: 'Switching application language to Telugu (తెలుగు)...' };
    if (p.includes('kannada') || p.includes('ಕನ್ನಡ')) return { action: 'SWITCH_LANGUAGE', payload: 'kn', text: 'Switching application language to Kannada (ಕನ್ನಡ)...' };
    if (p.includes('malayalam') || p.includes('മലയാളം')) return { action: 'SWITCH_LANGUAGE', payload: 'ml', text: 'Switching application language to Malayalam (മലയാളം)...' };
    if (p.includes('gujarati') || p.includes('ગુજરાતી')) return { action: 'SWITCH_LANGUAGE', payload: 'gu', text: 'Switching application language to Gujarati (ગુજરાતી)...' };
    if (p.includes('marathi') || p.includes('मराठी')) return { action: 'SWITCH_LANGUAGE', payload: 'mr', text: 'Switching application language to Marathi (मराठी)...' };
    if (p.includes('english')) return { action: 'SWITCH_LANGUAGE', payload: 'en', text: 'Switching application language to English...' };

    // 2. Page Routes
    if (p.includes('book') || p.includes('appointment') || p.includes('nearby hospital') || p.includes('gynecologist') || p.includes('find doctor') || p.includes('clinic')) {
      return { action: 'NAVIGATE', route: '/nearby', text: 'Opening Find Healthcare page to browse female doctors and hospitals...' };
    }
    if (p.includes('upload report') || p.includes('upload reports') || p.includes('my reports') || p.includes('health timeline') || p.includes('health record') || p.includes('lab vault')) {
      return { action: 'NAVIGATE', route: '/timeline', text: 'Opening Health Timeline & Digital Vault...' };
    }
    if (p.includes('pregnancy progress') || p.includes('trimester') || p.includes('baby bump') || p.includes('kick count')) {
      return { action: 'NAVIGATE', route: '/pregnancy', text: 'Opening Pregnancy Companion...' };
    }
    if (p.includes('period advice') || p.includes('menstrual') || p.includes('cramps') || p.includes('ovulation') || p.includes('cycle tracker')) {
      return { action: 'NAVIGATE', route: '/menstrual', text: 'Opening Menstrual Care AI...' };
    }
    if (p.includes('reminder') || p.includes('medicine timing') || p.includes('pill alert') || p.includes('alarm')) {
      return { action: 'NAVIGATE', route: '/reminders', text: 'Opening Smart Health Reminders...' };
    }
    if (p.includes('profile') || p.includes('settings') || p.includes('emergency contact') || p.includes('change radius')) {
      return { action: 'NAVIGATE', route: '/profile', text: 'Opening Profile & Settings...' };
    }
    if (p.includes('education') || p.includes('pcos guide') || p.includes('yojana') || p.includes('scheme') || p.includes('myths')) {
      return { action: 'NAVIGATE', route: '/education', text: 'Opening AI Health Education...' };
    }
    if (p.includes('symptom triage') || p.includes('feeling sick') || p.includes('fever') || p.includes('pain')) {
      return { action: 'NAVIGATE', route: '/ai-navigator', text: 'Opening AI Health Navigator...' };
    }

    return null;
  }
}

export const navigationAIEngine = new NavigationAIEngine();
