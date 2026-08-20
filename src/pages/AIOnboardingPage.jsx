import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/layout/Navbar';
import { Bot, Sparkles, Check, ArrowRight, Globe, UserCheck, Home, Car, Stethoscope, Compass } from 'lucide-react';

const EXISTING_CONDITIONS_LIST = [
  'PCOS / PCOD',
  'Mild Anemia (Iron Deficiency)',
  'Thyroid Imbalance (Hypo/Hyper)',
  'Endometriosis',
  'Diabetes / Pre-diabetes',
  'Migraine',
  'Irregular Cycles',
  'None / General Wellness'
];

const AIOnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const { currentLang, changeLanguage, languages } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Preference State
  const [prefLang, setPrefLang] = useState(currentLang);
  const [femaleDoctorsOnly, setFemaleDoctorsOnly] = useState(true);
  const [homeDiagnostics, setHomeDiagnostics] = useState(true);
  const [transportAssistance, setTransportAssistance] = useState(true);
  const [selectedConditions, setSelectedConditions] = useState(['PCOS / PCOD']);
  const [radius, setRadius] = useState('10 km');

  const toggleCondition = (cond) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleFinish = () => {
    changeLanguage(prefLang);
    completeOnboarding({
      preferredLanguage: prefLang,
      femaleDoctorsOnly,
      homeDiagnostics,
      transportAssistance,
      existingConditions: selectedConditions,
      radius
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
          {/* Header Banner */}
          <div className="flex items-center space-x-4 bg-purple-50 border border-purple-100 p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                Nari AI Assistant
                <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600" />
              </h3>
              <p className="text-xs text-purple-900 font-medium">
                "Hello! I'm Nari, your AI Health Companion. I'll personalize your healthcare experience."
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Personalization Progress</span>
              <span>Step {step} of 4</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-teal-400 transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* STEP 1: Language & Radius */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Select Preferred Language
                </h3>
                <p className="text-xs text-slate-500">Your entire dashboard and AI voice responses will adapt to this choice.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setPrefLang(lang.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      prefLang === lang.code
                        ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-purple-300 text-slate-700'
                    }`}
                  >
                    <span className="text-sm">{lang.flag} {lang.native}</span>
                    {prefLang === lang.code && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-600" />
                  Preferred Healthcare Search Radius
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {['5 km', '10 km', '15 km'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`py-3 rounded-2xl font-bold text-xs border transition-all ${
                        radius === r
                          ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r} Radius
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Doctor & Service Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  Care Preferences
                </h3>
                <p className="text-xs text-slate-500">Tailor your doctor search, diagnostic tests, and travel assistance.</p>
              </div>

              <div className="space-y-4">
                {/* Female Doctor Preference */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Preferred Female Doctors</h4>
                      <p className="text-xs text-slate-500">Filter nearby gynecologists to female specialists only</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={femaleDoctorsOnly}
                    onChange={(e) => setFemaleDoctorsOnly(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Home Diagnostics */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Home className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Home Diagnostics Preference</h4>
                      <p className="text-xs text-slate-500">Doorstep sample collection for blood work & lab tests</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={homeDiagnostics}
                    onChange={(e) => setHomeDiagnostics(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                  />
                </div>

                {/* Transport Assistance */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-pink-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Medical Transport Assistance</h4>
                      <p className="text-xs text-slate-500">Safe clinic rides & emergency vehicle assistance</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={transportAssistance}
                    onChange={(e) => setTransportAssistance(e.target.checked)}
                    className="w-5 h-5 accent-pink-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Medical Conditions */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                  Existing Medical Conditions (Optional)
                </h3>
                <p className="text-xs text-slate-500">Select any pre-existing conditions so Nari AI can tune health reminders and dietary advice.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {EXISTING_CONDITIONS_LIST.map((cond) => {
                  const isSel = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      onClick={() => toggleCondition(cond)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                        isSel
                          ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300'
                      }`}
                    >
                      {isSel ? `✓ ${cond}` : `+ ${cond}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Ready Summary */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Your Healthcare Profile is Ready!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nari AI has customized your dashboard with your language preference, search radius, and wellness parameters.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Preferred Language:</span>
                  <span className="font-bold text-purple-700">{languages.find(l => l.code === prefLang)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Search Radius:</span>
                  <span className="font-bold text-teal-700">{radius}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Female Doctor Filter:</span>
                  <span>{femaleDoctorsOnly ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Home Diagnostics:</span>
                  <span>{homeDiagnostics ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100"
              >
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 flex items-center space-x-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-purple-500/25 hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>Enter Dashboard</span>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOnboardingPage;
