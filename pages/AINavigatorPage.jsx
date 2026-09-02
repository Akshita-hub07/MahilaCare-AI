import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { askNariGemini } from '../services/geminiService';
import { userHealthStorage } from '../services/userHealthStorage';
import { speakText } from '../services/speechService';
import FormattedText from '../components/common/FormattedText';
import { stripCodeAndJsonFences } from '../utils/textCleaner';

import {
  Stethoscope,
  Sparkles,
  Volume2,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  HeartPulse,
  Activity,
  FileText
} from 'lucide-react';

const BODY_REGIONS = [
  { id: 'pelvic', label: 'Lower Abdomen / Pelvic' },
  { id: 'head', label: 'Head & Neck' },
  { id: 'chest', label: 'Chest & Breasts' },
  { id: 'back', label: 'Lower Back & Spine' },
  { id: 'general', label: 'Fatigue & Systemic' }
];

const AINavigatorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLang, t } = useLanguage();

  // Clinical Triage State
  const [selectedRegion, setSelectedRegion] = useState('pelvic');
  const [triageText, setTriageText] = useState('Experiencing sharp pelvic cramps with mild fever on day 2 of period.');
  const [duration, setDuration] = useState('1 - 2 Days');
  const [triageResult, setTriageResult] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Handle Clinical Triage Execution via MahilaCare AI / Ollama
  const handleRunTriage = async (e) => {
    e?.preventDefault();
    if (!triageText.trim()) return;

    setIsTyping(true);

    try {
      const prompt = `Symptoms: ${triageText}. Affected Area: ${selectedRegion}. Duration: ${duration}. Please evaluate urgency (Low 🟢, Moderate 🟡, High 🔴), provide reasoning, ask relevant follow-up questions, and recommend next steps.`;
      
      const response = await askNariGemini({
        prompt,
        language: currentLang,
        userProfile: user,
        pageContext: 'ai-navigator'
      });

      const cleanText = stripCodeAndJsonFences(response.text) || response.text;

      let urgencyLevel = '🟢 Low Priority';
      let badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';

      if (cleanText.toLowerCase().includes('high priority') || cleanText.toLowerCase().includes('emergency') || cleanText.toLowerCase().includes('🔴')) {
        urgencyLevel = '🔴 High Priority';
        badgeBg = 'bg-rose-50 border-rose-200 text-rose-800';
      } else if (cleanText.toLowerCase().includes('moderate priority') || cleanText.toLowerCase().includes('🟡')) {
        urgencyLevel = '🟡 Moderate Priority';
        badgeBg = 'bg-amber-50 border-amber-200 text-amber-800';
      }

      const triageEntry = {
        id: `triage_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        region: selectedRegion,
        symptoms: triageText,
        duration,
        urgencyLevel,
        aiAnalysis: cleanText
      };

      try {
        const existingData = userHealthStorage.loadUserData(user) || {};
        const updatedHistory = [triageEntry, ...(existingData.symptomHistory || []).slice(0, 9)];
        userHealthStorage.saveSymptomHistory(user, updatedHistory);
      } catch (saveErr) {
        console.warn('Failed to save symptom triage history:', saveErr);
      }

      setTriageResult({
        urgencyLevel,
        badgeBg,
        text: cleanText
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Clinical Triage Engine</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                24/7 Medical Symptom Assessment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              AI Symptom Triage & Risk Evaluation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Enter your current physical symptoms to receive clinical risk triage, medical urgency guidance, and personalized next steps powered by MahilaCare AI.
            </p>
          </div>
        </div>

        {/* Focused Symptom Triage Layout: Input Form (Left) + AI Assessment & Results (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Clinical Triage Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                Symptom Triage Questionnaire
              </h3>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full">
                Step-by-Step Check
              </span>
            </div>

            <form onSubmit={handleRunTriage} className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">1. Affected Body Region</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BODY_REGIONS.map((reg) => (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => setSelectedRegion(reg.id)}
                      className={`p-3 rounded-2xl border text-left font-bold transition text-xs ${
                        selectedRegion === reg.id ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-2xs' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {reg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">2. Detailed Symptoms & Description</label>
                <textarea
                  rows={4}
                  value={triageText}
                  onChange={(e) => setTriageText(e.target.value)}
                  placeholder="Describe your pain, discomfort, fever, cramps, swelling, or nausea..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">3. Symptom Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-semibold focus:outline-none"
                >
                  <option>Less than 24 Hours</option>
                  <option>1 - 2 Days</option>
                  <option>3 - 5 Days</option>
                  <option>More than 1 Week</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isTyping || !triageText.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {isTyping ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>Evaluate Symptoms with MahilaCare AI 🌸</span>
              </button>
            </form>
          </div>

          {/* RIGHT PANEL: AI Triage Result Card & Medical Guidelines */}
          <div className="lg:col-span-6 space-y-6">
            {triageResult ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600 fill-purple-600" />
                    <h3 className="font-extrabold text-slate-900 text-lg">AI Clinical Triage Result</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${triageResult.badgeBg}`}>
                    {triageResult.urgencyLevel}
                  </span>
                </div>

                <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 text-xs sm:text-sm leading-relaxed text-slate-800">
                  <FormattedText text={triageResult.text} />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => speakText(triageResult.text.replace(/[*#_]/g, ''), currentLang)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-purple-100 text-purple-700 rounded-2xl font-bold text-xs hover:bg-purple-200 transition"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen to Speech Summary
                  </button>

                  <button
                    onClick={() => {
                      const reasonText = triageText ? `Consultation regarding ${triageText}` : 'Consultation for symptom evaluation';
                      navigate('/nearby', { state: { reason: reasonText } });
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-2xl font-bold text-xs shadow hover:opacity-95 transition"
                  >
                    <span>Find Female Doctors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 text-center flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="font-extrabold text-slate-900 text-xl">Clinical Triage Ready</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Submit your symptoms on the left to receive instant urgency triage, risk level estimation, and intelligent medical follow-up guidance powered by MahilaCare AI.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-2 text-left">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">100% Confidential</h4>
                      <p className="text-[11px] text-slate-500">Your health data is private & encrypted.</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <HeartPulse className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Urgency Alerts</h4>
                      <p className="text-[11px] text-slate-500">Instant triage level & red flag warnings.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default AINavigatorPage;
