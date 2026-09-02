import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, MicOff, Send, X, Volume2, VolumeX, Sparkles, RefreshCw, User, MessageSquare, Compass, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { askNariGemini } from '../../services/geminiService';
import { startSpeechRecognition, speakText, stopSpeech } from '../../services/speechService';
import FormattedText from './FormattedText';
import { stripCodeAndJsonFences } from '../../utils/textCleaner';

const SUGGESTED_QUESTIONS = [
  "Summarize all my health records in one paragraph",
  "Based on my previous menstrual records, what patterns have I logged?",
  "What is PCOS?",
  "Find a female gynecologist nearby",
  "Open pregnancy care"
];

const FloatingAIChat = () => {
  const navigate = useNavigate();
  const { language, currentLang, changeLanguage, t } = useLanguage();
  const activeLang = currentLang || language || 'en';
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const userKey = user?.email || user?.id || 'guest_user';

  // Load persistent user conversation history from localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`naricare_chat_history_${userKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [
      {
        id: 1,
        sender: 'nari',
        text: `Hello ${user?.name || 'there'}! I am **MahilaCare AI**, your 24/7 personal health companion. Ask me any health question or speak to navigate MahilaCare pages.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [continuousVoiceMode, setContinuousVoiceMode] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync state when active user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`naricare_chat_history_${userKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {}
    setMessages([
      {
        id: 1,
        sender: 'nari',
        text: `Hello ${user?.name || 'there'}! I am **MahilaCare AI**, your 24/7 personal health companion. Ask me any health question or speak to navigate MahilaCare pages.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [userKey]);

  // Persist every conversation update into localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`naricare_chat_history_${userKey}`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat history:', e);
    }
  }, [messages, userKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const processQueryAndExecuteActions = async (userPromptText) => {
    if (!userPromptText.trim() || isTyping) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const response = await askNariGemini({
        prompt: userPromptText,
        conversationHistory: messages,
        language: language,
        userProfile: user,
        pageContext: window.location.pathname
      });

      const cleanResponseText = stripCodeAndJsonFences(response.text) || response.text;

      const nariMsg = {
        id: Date.now() + 1,
        sender: 'nari',
        text: cleanResponseText,
        isError: response.error,
        failedQuery: response.error ? userPromptText : null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, nariMsg]);

      // Voice Output Playback
      if (isVoiceOutputEnabled && !response.error) {
        const cleanSpeechText = cleanResponseText.replace(/[*#_]/g, '');
        speakText(cleanSpeechText, language);
      }

      // Handle Smart Actions & Automatic Feature Navigation
      if (!response.error) {
        const routeMap = {
          OPEN_DASHBOARD: '/dashboard',
          OPEN_HOSPITALS: '/nearby',
          OPEN_APPOINTMENTS: '/nearby',
          OPEN_TRANSPORT: '/nearby',
          OPEN_PREGNANCY: '/pregnancy',
          OPEN_MENSTRUAL: '/menstrual',
          OPEN_MENSTRUAL_CARE: '/menstrual',
          OPEN_REPORTS: '/timeline',
          OPEN_REPORT: '/timeline',
          OPEN_TIMELINE: '/timeline',
          OPEN_EDUCATION: '/education',
          OPEN_PROFILE: '/profile',
          OPEN_REMINDERS: '/reminders',
          BOOK_APPOINTMENT: '/nearby'
        };

        let dest = null;
        let act = null;

        if (response.intentAction) {
          const { type, action, payload, destination, targetRoute } = response.intentAction;
          act = action || type;
          dest = destination || targetRoute || routeMap[act];

          if (act === 'SWITCH_LANGUAGE' && (payload?.targetLanguage || payload)) {
            changeLanguage(payload?.targetLanguage || payload);
          }
        }

        // Robust automatic feature navigation matcher
        if (!dest) {
          const pLower = userPromptText.toLowerCase();

          if (pLower.includes('menstrual') || pLower.includes('period') || pLower.includes('cycle') || pLower.includes('ovulation') || pLower.includes('pcos') || pLower.includes('pcod')) {
            dest = '/menstrual';
          } else if (pLower.includes('pregnancy') || pLower.includes('pregnant') || pLower.includes('trimester') || pLower.includes('maternity') || pLower.includes('baby')) {
            dest = '/pregnancy';
          } else if (pLower.includes('record') || pLower.includes('timeline') || pLower.includes('report') || pLower.includes('vault')) {
            dest = '/timeline';
          } else if (pLower.includes('nearby') || pLower.includes('doctor') || pLower.includes('hospital') || pLower.includes('appointment') || pLower.includes('gynecologist') || pLower.includes('clinic') || pLower.includes('healthcare') || pLower.includes('book')) {
            dest = '/nearby';
          } else if (pLower.includes('education') || pLower.includes('article') || pLower.includes('scheme') || pLower.includes('yojana') || pLower.includes('learn')) {
            dest = '/education';
          } else if (pLower.includes('reminder') || pLower.includes('medicine') || pLower.includes('pill')) {
            dest = '/reminders';
          } else if (pLower.includes('profile') || pLower.includes('setting')) {
            dest = '/profile';
          }
        }

        if (dest) {
          setTimeout(() => {
            navigate(dest);
          }, 500);
        }
      }

      // Continuous Voice Loop
      if (continuousVoiceMode) {
        setTimeout(() => {
          handleVoiceInput();
        }, 4000);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startSpeechRecognition(
      (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          processQueryAndExecuteActions(transcript);
        }
      },
      (error) => {
        console.warn('Speech Recognition Error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      language
    );
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    processQueryAndExecuteActions(text);
  };

  const handleSuggestedQuestion = (qText) => {
    processQueryAndExecuteActions(qText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-full shadow-2xl hover:shadow-purple-300/50 hover:scale-105 transition-all duration-300 active:scale-95"
          aria-label="Open Mahila AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-300"></span>
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide">Ask Nari 🌸</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[590px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-teal-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
                <Bot className="w-6 h-6 text-purple-100" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide flex items-center gap-1.5">
                  Nari 🌸 <span className="text-[10px] uppercase tracking-wider bg-teal-400/30 px-2 py-0.5 rounded-full border border-teal-300/40">AI</span>
                </h3>
                <p className="text-xs text-purple-100/90 font-light">Natural Voice & Intelligent Page Control</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const initial = [
                    {
                      id: Date.now(),
                      sender: 'nari',
                      text: `Hello ${user?.name || 'there'}! I am **MahilaCare AI**, your 24/7 personal health companion. Ask me any health question or speak to navigate MahilaCare pages.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ];
                  setMessages(initial);
                  try {
                    localStorage.setItem(`naricare_chat_history_${userKey}`, JSON.stringify(initial));
                  } catch (e) {}
                }}
                className="p-1.5 rounded-full hover:bg-white/20 transition text-purple-100 hover:text-white"
                title="Clear Chat History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsVoiceOutputEnabled(!isVoiceOutputEnabled);
                  if (isVoiceOutputEnabled) stopSpeech();
                }}
                className="p-1.5 rounded-full hover:bg-white/20 transition text-purple-100 hover:text-white"
                title={isVoiceOutputEnabled ? "Mute Voice Output" : "Enable Voice Output"}
              >
                {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  stopSpeech();
                }}
                className="p-1.5 rounded-full hover:bg-white/20 transition text-purple-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'nari' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400 flex items-center justify-center text-white shrink-0 text-xs shadow">
                    🌸
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-bl-none'
                      : 'bg-white text-slate-800 border border-purple-100 rounded-bl-none'
                  }`}
                >
                  <FormattedText text={msg.text} />
                  {msg.isError && msg.failedQuery && (
                    <button
                      onClick={() => processQueryAndExecuteActions(msg.failedQuery)}
                      className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Query
                    </button>
                  )}
                  <span className={`text-[10px] block mt-1.5 ${msg.sender === 'user' ? 'text-purple-200 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs border border-purple-200">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-slate-500 text-xs py-2 px-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  🌸
                </div>
                <div className="bg-white border border-purple-100 rounded-2xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
                  <span className="text-purple-600 font-medium">Nari is reasoning & executing actions...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Navigation Quick Actions / Suggested Commands */}
          <div className="px-3 py-2 bg-white border-t border-purple-50 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <Compass className="w-4 h-4 text-purple-500 shrink-0" />
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(q)}
                className="whitespace-nowrap text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200/60 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Voice Input & Controls Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-purple-100 flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
              }`}
              title={isListening ? "Listening to your voice..." : "Tap to Speak Voice Command"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Ask Nari or say 'Book appointment'..."}
              className="flex-1 bg-slate-50 border border-purple-100 rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-full hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingAIChat;
