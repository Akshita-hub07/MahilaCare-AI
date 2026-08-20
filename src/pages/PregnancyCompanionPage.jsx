import React, { useState } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import { useHealthData } from '../context/HealthDataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { askNariGemini, generateAIReport } from '../services/geminiService.js';
import { Baby, Heart, Camera, Activity, Calendar, Check, Plus, Minus, Sparkles, ShoppingBag, MapPin, ShieldCheck, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const PREGNANCY_ESSENTIALS = [
  { id: 1, name: 'Prega News Advanced Pregnancy Test Kit (Pack of 3)', price: '₹180', pharmacy: 'Apollo Pharmacy (600m away)', image: '/products/prega_news_test_kit.png' },
  { id: 2, name: 'Methylfolate & DHA Prenatal Supplements (60 Veg Softgels)', price: '₹650', pharmacy: 'Cloudnine Maternity Pharmacy', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Elemental Iron + Vitamin C Complex (30 Tablets)', price: '₹320', pharmacy: 'Nari Wellness Store', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: 'Doctor Recommended Anti-Stretch Mark Cocoa Oil', price: '₹450', pharmacy: 'Wellness Pharmacy', image: '/products/anti_stretch_mark_oil.png' }
];

const PregnancyCompanionPage = () => {
  const { pregnancyDetails, setPregnancyDetails, isPregnancyEnabled, setIsPregnancyEnabled } = useHealthData();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [kickCount, setKickCount] = useState(pregnancyDetails.kicksToday || 8);
  const [weight, setWeight] = useState('62.5 kg');
  const [bp, setBp] = useState('118/76 mmHg');
  const [bloodSugar, setBloodSugar] = useState('92 mg/dL');
  const [aiPregnancyReport, setAiPregnancyReport] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [orderedProduct, setOrderedProduct] = useState(null);

  const incrementKick = () => {
    const updated = kickCount + 1;
    setKickCount(updated);
    setPregnancyDetails({ ...pregnancyDetails, kicksToday: updated });
  };

  const decrementKick = () => {
    const updated = Math.max(0, kickCount - 1);
    setKickCount(updated);
    setPregnancyDetails({ ...pregnancyDetails, kicksToday: updated });
  };

  const handleAskAIGuidance = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await generateAIReport({
        type: 'PREGNANCY',
        userData: user,
        reportData: {
          week: pregnancyDetails.week,
          trimester: pregnancyDetails.trimester,
          weight,
          bp,
          bloodSugar,
          kicksToday: kickCount
        },
        prompt: `Pregnancy Companion Request: Week ${pregnancyDetails.week}, Trimester ${pregnancyDetails.trimester}. Weight: ${weight}, BP: ${bp}, Sugar: ${bloodSugar}.`,
        language
      });
      setAiPregnancyReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
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
              <span className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider">Maternal & Fetal Care</span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-bold">
                {isPregnancyEnabled ? `Trimester ${pregnancyDetails.trimester} Active` : 'Mode Standby'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Pregnancy Companion
            </h1>
          </div>

          <button
            onClick={() => setIsPregnancyEnabled(!isPregnancyEnabled)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow transition ${
              isPregnancyEnabled ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            }`}
          >
            {isPregnancyEnabled ? t('pregnancyPage.disableButton', 'Disable Pregnancy Mode') : t('pregnancyPage.enableButton', 'Activate Pregnancy Mode')}
          </button>
        </div>

        {!isPregnancyEnabled ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 mx-auto">
              <Baby className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{t('pregnancyPage.activateTitle', 'Activate Pregnancy Companion')}</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {t('pregnancyPage.activateSub', 'Planning pregnancy or currently expecting? Enable Pregnancy Mode to unlock week-by-week baby development insights, bump diary, kick counter, and nutrition guidance.')}
            </p>
            <button
              onClick={() => setIsPregnancyEnabled(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-xs shadow hover:opacity-95 transition"
            >
              {t('pregnancyPage.enableButton', 'Enable Companion Now')}
            </button>
          </div>
        ) : (
          <>
            {/* Trimester Banner */}
            <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 rounded-3xl p-8 text-white shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-100">{t('pregnancyPage.gestationalWeek', 'Week')} {pregnancyDetails.week} of 40</span>
                  <h2 className="text-3xl font-black mt-1">{t('pregnancyPage.babySize', 'Baby is the size of an Avocado 🥑')}</h2>
                  <p className="text-xs text-pink-100 mt-1">{t('pregnancyPage.estimatedLength', 'Estimated length: ~4.5 inches (11.6 cm) • Weight: ~100 grams')}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-center">
                  <span className="text-xs text-pink-100">{t('pregnancyPage.dueDateLabel', 'Estimated Due Date')}</span>
                  <p className="text-lg font-black">{pregnancyDetails.dueDate}</p>
                </div>
              </div>
            </div>

            {/* AI Guidance Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {t('pregnancyPage.aiBoxHeader', 'NariCare AI Weekly Guidance & Nutrition')}
                </h3>
                <button
                  onClick={handleAskAIGuidance}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow"
                >
                  {isGeneratingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate AI Pregnancy & Nutrition Analysis 🌸</span>
                </button>
              </div>

              {isGeneratingAI ? (
                <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 text-center space-y-2 animate-pulse">
                  <RefreshCw className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-purple-900">
                    NariCare AI is analyzing Week {pregnancyDetails.week} fetal development milestones, kick count ({kickCount}), and maternal vitals ({weight}, {bp}, {bloodSugar})...
                  </p>
                </div>
              ) : aiPregnancyReport ? (
                aiPregnancyReport.error ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{aiPregnancyReport.summary || 'NariCare AI is temporarily unavailable. Please try again shortly.'}</span>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in text-xs text-slate-700">
                    <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 leading-relaxed font-medium whitespace-pre-line">
                      {aiPregnancyReport.summary}
                    </div>

                    {/* AI Recommended Indian Branded Pregnancy Care Products */}
                    {aiPregnancyReport.recommendedProducts && aiPregnancyReport.recommendedProducts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                          AI Recommended Maternal & Prenatal Essentials (Available in India)
                        </h4>
                        <div className="space-y-2 text-xs">
                          {aiPregnancyReport.recommendedProducts.map((prod, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 font-semibold text-purple-950 flex items-start space-x-2">
                              <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-[10px] font-black uppercase shrink-0 mt-0.5">
                                🇮🇳 Recommended
                              </span>
                              <span>{prod}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2-3 Next Steps */}
                    {aiPregnancyReport.nextSteps && aiPregnancyReport.nextSteps.length > 0 && (
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Recommended Next Steps (2-3 Actions)</h4>
                        <ul className="space-y-2 text-xs">
                          {aiPregnancyReport.nextSteps.slice(0, 3).map((step, idx) => (
                            <li key={idx} className="flex items-start space-x-2 bg-pink-50/60 p-3 rounded-xl border border-pink-100 text-pink-950 font-medium">
                              <CheckCircle className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiPregnancyReport.whenToSeekCare && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                        <strong>When to Seek Doctor Evaluation:</strong> {aiPregnancyReport.whenToSeekCare}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl">
                  Tap "Generate AI Pregnancy & Nutrition Analysis 🌸" above to generate personalized week {pregnancyDetails.week} nutrition and baby development milestones.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kick Counter */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Activity className="w-6 h-6 text-pink-600" />
                    <h3 className="text-xl font-extrabold text-slate-900">Fetal Kick Counter</h3>
                  </div>
                  <p className="text-xs text-slate-500">Log baby movements to ensure healthy fetal activity.</p>
                </div>

                <div className="text-center py-6 bg-pink-50 rounded-2xl border border-pink-100">
                  <span className="text-5xl font-black text-pink-600">{kickCount}</span>
                  <p className="text-xs font-bold text-pink-900 mt-2">Kicks Logged Today</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={decrementKick}
                    disabled={kickCount <= 0}
                    className="py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                    <span>- Subtract Kick</span>
                  </button>
                  <button
                    onClick={incrementKick}
                    className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-md hover:scale-[1.01] transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>+ Log Fetal Kick</span>
                  </button>
                </div>
              </div>

              {/* Vital Signs Logger */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Log Maternal Vitals
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Weight Tracking</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fasting Blood Sugar</label>
                    <input
                      type="text"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pregnancy Essentials Store */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900">Pregnancy Essentials & Supplements</h3>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" /> Nearby Maternity Pharmacies
                </span>
              </div>

              {orderedProduct && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <span>Order Placed! <strong>{orderedProduct.name}</strong> scheduled for delivery!</span>
                  <button onClick={() => setOrderedProduct(null)} className="underline">Dismiss</button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PREGNANCY_ESSENTIALS.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
                    <div className="h-36 rounded-2xl overflow-hidden bg-white p-2 border border-slate-100 flex items-center justify-center">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2">{prod.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{prod.pharmacy}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-black text-sm text-purple-700">{prod.price}</span>
                      <button
                        onClick={() => setOrderedProduct(prod)}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold hover:opacity-95 transition"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default PregnancyCompanionPage;
