/**
 * Google Services & Firebase Integration Service Wrappers (Placeholders)
 * Ready for production API key configuration and SDK integration.
 */

// Configuration Placeholders
export const GOOGLE_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSy_MOCK_GOOGLE_API_KEY',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSy_MOCK_GEMINI_API_KEY',
  mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSy_MOCK_MAPS_API_KEY',
  firebase: {
    apiKey: "AIzaSy_MOCK_FIREBASE_KEY",
    authDomain: "naricare-ai.firebaseapp.com",
    projectId: "naricare-ai",
    storageBucket: "naricare-ai.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abcdef123456"
  }
};

/**
 * 1. Google Maps & Places API Service
 */
export const googleMapsService = {
  // Geolocation API
  getCurrentLocation: async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 12.9716, lng: 77.5946 }) // Default Bengaluru coordinates
        );
      } else {
        resolve({ lat: 12.9716, lng: 77.5946 });
      }
    });
  },

  // Places API Search Nearby
  searchNearbyPlaces: async (lat, lng, radiusKm, placeType = 'hospital') => {
    // API Placeholder call for https://maps.googleapis.com/maps/api/place/nearbysearch/json
    console.log(`[Google Places API] Querying '${placeType}' within ${radiusKm}km of (${lat}, ${lng})`);
    return {
      status: 'OK',
      radiusKm,
      source: 'Google Places API Placeholder'
    };
  },

  // Distance Matrix API
  calculateDistanceMatrix: async (origin, destinations) => {
    // API Placeholder call for https://maps.googleapis.com/maps/api/distancematrix/json
    console.log(`[Google Distance Matrix API] Calculating route matrix from`, origin, `to`, destinations);
    return destinations.map((d, idx) => ({
      destination: d,
      distanceKm: (2.4 + idx * 1.8).toFixed(1),
      durationMins: Math.round(8 + idx * 7)
    }));
  },

  // Navigation Deep Link Generator
  getNavigationUrl: (addressOrCoords) => {
    const encoded = encodeURIComponent(addressOrCoords);
    return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  }
};

/**
 * 2. Google Calendar API Service
 */
export const googleCalendarService = {
  // Add Appointment to Google Calendar
  addAppointmentToCalendar: async (appointment) => {
    console.log('[Google Calendar API] Creating calendar event for:', appointment.title);
    
    // Format start & end date for Google Calendar Web URL
    const startDate = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointment.title)}&details=${encodeURIComponent(appointment.details)}&location=${encodeURIComponent(appointment.location)}&sf=true&output=xml`;

    return {
      success: true,
      calendarUrl,
      eventId: `gcal_${Date.now()}`
    };
  }
};

/**
 * 3. Speech-to-Text & Text-to-Speech (Google Cloud Speech / Web Speech API)
 */
export const speechService = {
  // Speech Recognition (Speech-to-Text)
  startSpeechToText: (onResult, onError) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Speech API] Browser does not support Web Speech Recognition natively. Using fallback STT engine.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      onResult(transcript);
    };

    recognition.onerror = (err) => {
      if (onError) onError(err);
    };

    recognition.start();
    return recognition;
  },

  // Text-to-Speech (TTS Voice Output)
  speakText: (text, langCode = 'en') => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05; // Friendly warm female voice pitch

    // Find voice matching language code if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode)) || voices[0];
    if (matchingVoice) utterance.voice = matchingVoice;

    window.speechSynthesis.speak(utterance);
  },

  stopSpeech: () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
};

/**
 * 4. Firebase Authentication, Firestore, Storage & Messaging Placeholders
 */
export const firebaseService = {
  // Auth
  signInWithGoogle: async () => {
    console.log('[Firebase Auth] Triggering GoogleAuthProvider Sign-In');
    return {
      uid: `usr_fb_${Date.now()}`,
      displayName: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    };
  },

  // Firestore Database Sync
  saveUserRecordFirestore: async (collectionName, documentData) => {
    console.log(`[Firebase Firestore] Writing document to collection '${collectionName}':`, documentData);
    return { id: `doc_${Date.now()}`, success: true };
  },

  // Storage Upload
  uploadHealthReportFile: async (file) => {
    console.log('[Firebase Storage] Uploading medical document file:', file?.name);
    return {
      downloadUrl: `https://storage.googleapis.com/naricare-ai.appspot.com/reports/${file?.name || 'report.pdf'}`,
      path: `reports/${file?.name || 'report.pdf'}`
    };
  },

  // Cloud Messaging (FCM Push Notifications)
  requestFCMToken: async () => {
    console.log('[Firebase Cloud Messaging] Requesting FCM push notification device token');
    return `fcm_token_${Math.random().toString(36).substring(2)}`;
  }
};
