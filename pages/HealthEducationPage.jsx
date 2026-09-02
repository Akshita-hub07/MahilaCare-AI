import React, { useState } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import { BookOpen, Sparkles, ExternalLink, Search, RefreshCw, ShieldCheck, Heart, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { askNariGemini } from '../services/geminiService';
import FormattedText from '../components/common/FormattedText';
import { stripCodeAndJsonFences } from '../utils/textCleaner';

const TRUSTED_SOURCES = [
  { name: 'World Health Organization (WHO)', url: 'https://www.who.int/health-topics/women-s-health', tag: 'Global Clinical Standards' },
  { name: 'MoHFW - Govt of India', url: 'https://mohfw.gov.in/', tag: 'National Schemes & Guidelines' },
  { name: 'National Health Service (NHS UK)', url: 'https://www.nhs.uk/womens-health/', tag: 'Evidence-Based Care' },
  { name: 'CDC Women\'s Health', url: 'https://www.cdc.gov/women/index.htm', tag: 'Disease Prevention' }
];

const SUGGESTED_TOPICS = [
  "How does PCOS impact fertility and insulin resistance?",
  "What government maternity schemes (e.g. Pradhan Mantri Matru Vandana Yojana) exist in India?",
  "Signs and self-examination steps for Breast Health Awareness.",
  "Which vaccines (HPV, Tdap, Rubella) are essential for women?",
  "Nutrition guide for managing Mild Anemia with Indian superfoods."
];

const HealthEducationPage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [question, setQuestion] = useState('');
  const [aiEducationResponse, setAiEducationResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAskQuestion = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;

    setIsGenerating(true);
    try {
      const response = await askNariGemini({
        prompt: `Health Education Question: "${question}". Provide a concise, clear explanation based on medical science with key advice and guidelines.`,
        language,
        userProfile: user
      });
      const cleanText = stripCodeAndJsonFences(response.text) || response.text;
      setAiEducationResponse(cleanText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTopic = (topicText) => {
    setQuestion(topicText);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Medical Library</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                WHO & MoHFW Verified
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {t('educationPage.title', 'AI Health Education')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              {t('educationPage.subtitle', "Ask any women's health topic conversationally. MahilaCare AI synthesizes verified evidence into your selected language.")}
            </p>
          </div>
        </div>

        {/* Q&A Interactive Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <form onSubmit={handleAskQuestion} className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ask Any Healthcare Question
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What are early warning symptoms of Cervical Cancer and HPV vaccine schedules?"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !question.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-2xl font-bold text-xs shadow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate AI Guide
              </button>
            </div>
          </form>

          {/* Suggested Topics */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Explore Popular Topics</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.map((top, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTopic(top)}
                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-medium transition"
                >
                  {top}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Answer Display */}
        {aiEducationResponse && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-base border-b border-purple-100 pb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              MahilaCare AI Educational Summary
            </div>
            <div className="bg-purple-50/40 p-6 rounded-2xl border border-purple-100">
              <FormattedText text={aiEducationResponse} />
            </div>
          </div>
        )}

        {/* Trusted Medical Sources Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Trusted Medical Knowledge Sources & Government Links
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUSTED_SOURCES.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition space-y-3 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs">
                    <Award className="w-4 h-4" />
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-purple-700 transition">{src.name}</h4>
                <p className="text-[10px] text-teal-700 font-bold">{src.tag}</p>
              </a>
            ))}
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default HealthEducationPage;
