import React, { useState } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import { useHealthData } from '../context/HealthDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { askNariGemini, generateAIReport } from '../services/geminiService.js';
import { Calendar as CalendarIcon, Heart, Droplets, Sparkles, Check, Activity, ShoppingBag, Truck, MapPin, Zap, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

import { userHealthStorage } from '../services/userHealthStorage.js';

const SYMPTOMS_LIST = [
  'Mild Cramps', 'Severe Cramps', 'Bloating', 'Clear Skin', 'Acne Breakout',
  'High Energy', 'Fatigue / Brain Fog', 'Mood Swings', 'Headache', 'Back Pain', 'Cravings'
];

const EMERGENCY_PRODUCTS = [
  { id: 1, name: 'Whisper Ultra Soft Sanitary Pads (XL+ Pack of 30)', price: '₹280', time: '20 mins', pharmacy: 'Apollo Pharmacy (800m away)', image: '/products/whisper_pads.png' },
  { id: 2, name: 'Sirona Reusable Medical Grade Menstrual Cup', price: '₹399', time: '30 mins', pharmacy: 'Nari Health Store (1.2 km away)', image: '/products/menstrual_cup.png' },
  { id: 3, name: 'Cramp Relief Herbal Heat Patches (Pack of 5)', price: '₹249', time: '25 mins', pharmacy: 'Wellness Forever Pharmacy', image: '/products/heat_patches.png' },
  { id: 4, name: 'Pee Safe Organic Cotton Tampons (Super)', price: '₹299', time: '35 mins', pharmacy: 'Apollo Pharmacy', image: '/products/pee_safe_tampons.png' }
];

// Helper to compute dynamic cycle parameters relative to current date
const getDynamicDefaultStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - 13);
  return d.toISOString().split('T')[0];
};

const computeCycleMetrics = (startDateStr, avgCycleLen = 28, avgPeriodLen = 5) => {
  const start = new Date(startDateStr || getDynamicDefaultStart());
  const cycle = Math.max(20, Math.min(45, Number(avgCycleLen) || 28));
  const period = Math.max(2, Math.min(10, Number(avgPeriodLen) || 5));

  const refDate = new Date();
  const diffMs = refDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let currentDay = ((diffDays % cycle) + cycle) % cycle + 1;
  if (isNaN(currentDay)) currentDay = 14;

  const cyclesElapsed = Math.floor(diffDays / cycle);
  const nextPeriodMs = start.getTime() + (cyclesElapsed + 1) * cycle * 86400000;
  const nextPeriodDateObj = new Date(nextPeriodMs);
  const daysUntilNextPeriod = Math.max(1, Math.ceil((nextPeriodMs - refDate.getTime()) / 86400000));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nextPeriodFormatted = `${months[nextPeriodDateObj.getMonth()]} ${String(nextPeriodDateObj.getDate()).padStart(2, '0')}, ${nextPeriodDateObj.getFullYear()}`;

  const ovulationDayInCycle = cycle - 14;
  const fertileStartDay = Math.max(1, ovulationDayInCycle - 5);
  const fertileEndDay = Math.min(cycle, ovulationDayInCycle + 1);

  const fertileStartMs = start.getTime() + (cyclesElapsed * cycle + fertileStartDay - 1) * 86400000;
  const fertileEndMs = start.getTime() + (cyclesElapsed * cycle + fertileEndDay - 1) * 86400000;

  const fertileStartObj = new Date(fertileStartMs);
  const fertileEndObj = new Date(fertileEndMs);
  const fertileDaysFormatted = `${months[fertileStartObj.getMonth()]} ${String(fertileStartObj.getDate()).padStart(2, '0')} - ${months[fertileEndObj.getMonth()]} ${String(fertileEndObj.getDate()).padStart(2, '0')}`;

  let phase = 'Follicular Phase';
  let chanceOfPregnancy = 'Low';

  if (currentDay <= period) {
    phase = 'Menstrual Phase';
    chanceOfPregnancy = 'Low';
  } else if (currentDay >= fertileStartDay && currentDay <= fertileEndDay) {
    phase = 'Ovulation / Fertile Window';
    chanceOfPregnancy = 'High';
  } else if (currentDay < fertileStartDay) {
    phase = 'Follicular Phase';
    chanceOfPregnancy = 'Moderate';
  } else {
    phase = 'Luteal Phase';
    chanceOfPregnancy = 'Low';
  }

  return {
    currentDay,
    phase,
    cycleLength: cycle,
    periodLength: period,
    nextPeriodFormatted,
    daysUntilNextPeriod,
    fertileDays: fertileDaysFormatted,
    chanceOfPregnancy
  };
};

const MenstrualCarePage = () => {
  const { cycleData, setCycleData } = useHealthData();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [lastPeriodStart, setLastPeriodStart] = useState(cycleData.lastPeriodStart || '2026-07-26');
  const [cycleLength, setCycleLength] = useState(cycleData.cycleLength || 28);
  const [periodLength, setPeriodLength] = useState(cycleData.periodLength || 5);
  const [loggedSymptoms, setLoggedSymptoms] = useState(cycleData.symptoms || []);
  const [flowLevel, setFlowLevel] = useState(cycleData.flowLevel || 'Medium');
  const [painLevel, setPainLevel] = useState(cycleData.painLevel !== undefined ? cycleData.painLevel : 4);
  const [mood, setMood] = useState(cycleData.mood || 'Energetic');
  const [saveAlert, setSaveAlert] = useState('');
  const [aiReport, setAiReport] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [orderedProduct, setOrderedProduct] = useState(null);

  // Dynamically computed cycle metrics based on user inputs or defaults
  const computedMetrics = computeCycleMetrics(lastPeriodStart, cycleLength, periodLength);

  const getFilteredEssentialsList = () => {
    const isNoneFlow = !flowLevel || flowLevel.toLowerCase() === 'none';
    const hasCramps = Number(painLevel) > 0 || loggedSymptoms.includes('Mild Cramps') || loggedSymptoms.includes('Severe Cramps');
    const normFlow = (flowLevel || 'none').toLowerCase();

    // Rule 2: Flow is None AND Pain is 0 AND No Cramps -> No essentials required
    if (isNoneFlow && !hasCramps) {
      return [];
    }

    // Rule 1: Flow is None BUT Pain > 0 or Cramps -> ONLY Heat Patches
    if (isNoneFlow && hasCramps) {
      return [
        "Cramp Relief Herbal Heat Patches (Pack of 5) (~₹249) - Fast 8-hour natural heat relief for cramps & muscle pain"
      ];
    }

    // Rule 3: Flow is Spotting or Light -> Menstrual Cup / Tampons AND Heat Patches
    if (normFlow === 'spotting' || normFlow === 'light') {
      const items = [
        "Sirona Reusable Medical Grade Menstrual Cup (~₹399) - Eco-friendly leak-proof protection for light flow",
        "Pee Safe Organic Cotton Tampons (Super) (~₹299) - Soft organic cotton protection for light/spotting flow"
      ];
      if (hasCramps) {
        items.push("Cramp Relief Herbal Heat Patches (Pack of 5) (~₹249) - Fast 8-hour natural heat relief for cramps");
      }
      return items;
    }

    // Rule 4: Flow is Medium or Heavy -> XL Pads AND Heat Patches
    if (normFlow === 'medium' || normFlow === 'heavy') {
      const items = [
        "Whisper Ultra Soft Sanitary Pads (XL+ Pack of 30) (~₹280) - Extra absorbent soft protection for medium/heavy flow"
      ];
      if (hasCramps) {
        items.push("Cramp Relief Herbal Heat Patches (Pack of 5) (~₹249) - Fast 8-hour natural heat relief for cramps");
      }
      return items;
    }

    return aiReport?.recommendedProducts || [];
  };

  const toggleSymptom = (sym) => {
    if (loggedSymptoms.includes(sym)) {
      setLoggedSymptoms(loggedSymptoms.filter(s => s !== sym));
    } else {
      setLoggedSymptoms([...loggedSymptoms, sym]);
    }
  };

  const updateCycleSettings = (newStart, newCycleLen, newPeriodLen) => {
    const metrics = computeCycleMetrics(newStart, newCycleLen, newPeriodLen);
    const updated = {
      ...cycleData,
      lastPeriodStart: newStart,
      cycleLength: metrics.cycleLength,
      periodLength: metrics.periodLength,
      currentDay: metrics.currentDay,
      phase: metrics.phase,
      fertileDays: metrics.fertileDays,
      chanceOfPregnancy: metrics.chanceOfPregnancy,
      flowLevel,
      painLevel,
      symptoms: loggedSymptoms
    };
    setCycleData(updated);
  };

  // Trigger Ollama AI analysis ONLY when user explicitly clicks the Analyze button
  const handleAnalyzeAI = async () => {
    setIsLoadingAI(true);
    setSaveAlert("Today's period flow & symptom log saved!");
    setTimeout(() => setSaveAlert(''), 3000);

    setCycleData({
      ...cycleData,
      symptoms: loggedSymptoms
    });

    try {
      const res = await generateAIReport({
        type: 'MENSTRUAL',
        userData: user,
        reportData: {
          currentDay: cycleData.currentDay,
          phase: cycleData.phase,
          flowLevel,
          painLevel,
          mood,
          symptoms: loggedSymptoms
        },
        prompt: `Logged Cycle Day ${cycleData.currentDay}, Phase: ${cycleData.phase}, Flow: ${flowLevel}, Pain: ${painLevel}/10, Mood: ${mood}, Symptoms: ${loggedSymptoms.join(', ')}. Analyze selected options and provide 2-3 next steps.`,
        language
      });
      setAiReport(res);
    } catch (e) {
      console.error('Menstrual AI analysis failed:', e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Hormonal & Cycle Intelligence</span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-bold">
                NariCare AI Menstrual Companion 🌸
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Menstrual Care & Ovulation AI
            </h1>
          </div>
        </div>

        {saveAlert && (
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-bold flex items-center space-x-2">
            <Check className="w-5 h-5 text-teal-600" />
            <span>{saveAlert}</span>
          </div>
        )}

        {/* Cycle Banner */}
        <div className="bg-gradient-to-tr from-purple-800 via-violet-700 to-pink-600 rounded-3xl p-8 text-white shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Current Phase</span>
              <h2 className="text-3xl font-black mt-1">{computedMetrics.phase}</h2>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-4xl font-black">Day {computedMetrics.currentDay}</span>
              <p className="text-xs text-purple-200 font-medium">Average Cycle: {computedMetrics.cycleLength} Days (Period: {computedMetrics.periodLength} Days)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-purple-200">Fertile Window</p>
              <p className="text-base font-bold mt-0.5">{computedMetrics.fertileDays}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-purple-200">Chance of Conception</p>
              <p className="text-base font-bold mt-0.5 text-teal-300">{computedMetrics.chanceOfPregnancy}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-purple-200">Next Period Prediction</p>
              <p className="text-base font-bold mt-0.5">{computedMetrics.nextPeriodFormatted} (in {computedMetrics.daysUntilNextPeriod} days)</p>
            </div>
          </div>
        </div>

        {/* AI Menstrual Report Box */}
        <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
              <Sparkles className="w-5 h-5 text-purple-600" />
              NariCare AI Menstrual Health Summary
            </div>
            <button
              onClick={handleAnalyzeAI}
              disabled={isLoadingAI}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              {isLoadingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate NariCare AI Analysis 🌸</span>
            </button>
          </div>

          {isLoadingAI ? (
            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 text-center space-y-2 animate-pulse">
              <RefreshCw className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-purple-900">
                NariCare AI is analyzing your logged cycle parameters (Day {computedMetrics.currentDay}, Flow: {flowLevel}, Pain: {painLevel}/10, Symptoms: {loggedSymptoms.join(', ') || 'None'})...
              </p>
            </div>
          ) : aiReport ? (
            aiReport.error ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{aiReport.summary || 'NariCare AI is temporarily unavailable. Please try again shortly.'}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                  {aiReport.summary}
                </div>

                {/* AI Recommended Essentials based on Flow & Cramps Rules */}
                {(() => {
                  const displayProducts = getFilteredEssentialsList();
                  if (displayProducts && displayProducts.length > 0) {
                    return (
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                          AI Recommended Health Care Essentials (Available in India)
                        </h4>
                        <div className="space-y-2 text-xs">
                          {displayProducts.map((prod, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 font-semibold text-purple-950 flex items-start space-x-2">
                              <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-[10px] font-black uppercase shrink-0 mt-0.5">
                                🇮🇳 Recommended
                              </span>
                              <span>{prod}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>No product essentials are required (flow is None with 0 pain/cramps).</span>
                    </div>
                  );
                })()}

                {/* 2-3 Next Steps */}
                {aiReport.nextSteps && aiReport.nextSteps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Recommended Next Steps (2-3 Actions)</h4>
                    <ul className="space-y-2 text-xs">
                      {aiReport.nextSteps.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-pink-50/60 p-3 rounded-xl border border-pink-100 text-pink-950 font-medium">
                          <CheckCircle className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiReport.whenToSeekCare && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    <strong>When to Seek Clinical Evaluation:</strong> {aiReport.whenToSeekCare}
                  </div>
                )}
              </div>
            )
          ) : (
            <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl">
              Select your current cycle flow, pain level, and symptoms below, then click "Generate NariCare AI Analysis 🌸" to receive personalized insights powered by NariCare AI.
            </p>
          )}
        </div>

        {/* Editable Cycle Settings & Symptom Logger Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-600" />
              {t('menstrualPage.logTitle', "Editable Cycle Settings & Daily Log")}
            </h3>
            <span className="text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1 rounded-full">
              Real-time Cycle Predictions
            </span>
          </div>

          {/* Editable Cycle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-pink-50/40 p-4 rounded-2xl border border-pink-100/80 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Period Start Date
              </label>
              <input
                type="date"
                value={lastPeriodStart}
                onChange={(e) => {
                  setLastPeriodStart(e.target.value);
                  updateCycleSettings(e.target.value, cycleLength, periodLength);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Typical Cycle Length (Days)
              </label>
              <input
                type="number"
                min="20"
                max="45"
                value={cycleLength}
                onChange={(e) => {
                  const val = e.target.value;
                  setCycleLength(val);
                  updateCycleSettings(lastPeriodStart, val, periodLength);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Period Duration (Days)
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={periodLength}
                onChange={(e) => {
                  const val = e.target.value;
                  setPeriodLength(val);
                  updateCycleSettings(lastPeriodStart, cycleLength, val);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Flow Level with "None" included */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('menstrualPage.flowLabel', 'Flow Level')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
                {['None', 'Spotting', 'Light', 'Medium', 'Heavy'].map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => {
                      setFlowLevel(fl);
                      updateCycleSettings(lastPeriodStart, cycleLength, periodLength);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      flowLevel === fl ? 'bg-pink-600 text-white border-pink-600 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain Scale */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('menstrualPage.painLabel', 'Pain Level')} ({painLevel}/10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(e.target.value)}
                className="w-full accent-pink-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>0 - No Pain</span>
                <span>5 - Moderate</span>
                <span>10 - Unbearable</span>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('menstrualPage.moodLabel', 'Primary Mood')}
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold"
              >
                <option>Energetic</option>
                <option>Happy / Calm</option>
                <option>Anxious / Stressed</option>
                <option>Irritable / Sensitive</option>
                <option>Low Energy / Tired</option>
              </select>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              {t('menstrualPage.symptomsLabel', 'Select Current Physical & Hormonal Symptoms')}
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS_LIST.map((sym) => {
                const isSelected = loggedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected ? 'bg-pink-100 text-pink-900 border border-pink-300' : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-pink-600" />}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleAnalyzeAI}
            disabled={isLoadingAI}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xs shadow hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            {isLoadingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate NariCare AI Analysis for Selected Options 🌸</span>
          </button>
        </div>

        {/* Emergency Menstrual Support Essentials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-rose-600" />
                Emergency Delivery (30 Mins)
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Emergency Menstrual Essentials</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Nearby Pharmacies Connected
            </span>
          </div>

          {orderedProduct && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
              <span>Order Confirmed! <strong>{orderedProduct.name}</strong> will arrive in {orderedProduct.time} via express courier.</span>
              <button onClick={() => setOrderedProduct(null)} className="underline">Dismiss</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EMERGENCY_PRODUCTS.map((prod) => (
              <div key={prod.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
                <div className="h-36 rounded-2xl overflow-hidden bg-white p-2 border border-slate-100 relative">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    ⚡ {prod.time}
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2">{prod.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{prod.pharmacy}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-black text-sm text-purple-700">{prod.price}</span>
                  <button
                    onClick={() => setOrderedProduct(prod)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
                  >
                    Quick Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default MenstrualCarePage;
