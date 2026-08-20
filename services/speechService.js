/**
 * Speech Recognition (STT) and Speech Synthesis (TTS) Helper
 * Uses Web Speech API with fallback placeholders & robust multi-voice fallback
 */

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  hinglish: 'hi-IN', // Indian accent / Hinglish voice synthesis
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  mr: 'mr-IN'
};

export function startSpeechRecognition(onResult, onError, onEnd, lang = 'en') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError && onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  const targetLangCode = LANG_MAP[lang] || (lang.includes('-') ? lang : 'en-IN');
  recognition.lang = targetLangCode;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0]?.transcript || '';
    onResult && onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError && onError(event.error);
  };

  recognition.onend = () => {
    onEnd && onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.warn('Speech recognition start failed:', e);
    onError && onError(e);
  }
  return recognition;
}

export function speakText(text, lang = 'en') {
  if (!('speechSynthesis' in window) || !text) {
    console.warn('Speech synthesis not supported or empty text');
    return;
  }

  window.speechSynthesis.cancel(); // Stop ongoing speech

  const targetLangCode = LANG_MAP[lang] || (lang.includes('-') ? lang : 'en-IN');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLangCode;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Voice lookup and graceful fallback
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length > 0) {
      // 1. Exact BCP-47 match (e.g., 'hi-IN', 'ta-IN')
      let matchingVoice = voices.find(v => v.lang === targetLangCode || v.lang.replace('_', '-') === targetLangCode);
      
      // 2. Prefix match (e.g., 'hi', 'ta')
      if (!matchingVoice) {
        const langPrefix = targetLangCode.split('-')[0];
        matchingVoice = voices.find(v => v.lang.startsWith(langPrefix));
      }

      // 3. Fallback to any Indian accent voice or default voice
      if (!matchingVoice) {
        matchingVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('en'));
      }

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }
  } catch (e) {
    console.warn('Voice matching error, using browser default voice:', e);
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
