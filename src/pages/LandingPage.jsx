import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LearnMoreModal from '../components/common/LearnMoreModal';
import LanguageSelectorModal from '../components/common/LanguageSelectorModal';
import {
  Sparkles,
  Stethoscope,
  MapPin,
  Clock,
  Bell,
  Calendar,
  Baby,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Globe,
  Heart
} from 'lucide-react';

const LandingPage = () => {
  const { t, currentLang, languages } = useLanguage();
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const navigate = useNavigate();

  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const activeLangObj = languages.find(l => l.code === currentLang) || languages[0];

  const handleStartJourney = () => {
    if (isAuthenticated) {
      if (hasCompletedOnboarding) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/signup');
    }
  };

  const featureCards = [
    {
      icon: Stethoscope,
      title: t('featureCards.aiNavTitle', 'AI Health Navigator'),
      desc: t('featureCards.aiNavDesc', 'Clinical-grade symptom analysis, instant risk triage & personalized action plans.'),
      color: "from-purple-500 to-indigo-600",
      link: "/ai-navigator"
    },
    {
      icon: MapPin,
      title: t('featureCards.nearbyTitle', 'Nearby Healthcare'),
      desc: t('featureCards.nearbyDesc', 'Find verified female doctors, book doorstep blood diagnostics & safe medical rides.'),
      color: "from-teal-400 to-emerald-600",
      link: "/nearby"
    },
    {
      icon: Clock,
      title: t('featureCards.timelineTitle', 'Health Timeline'),
      desc: t('featureCards.timelineDesc', 'Secure digital health records, past lab reports, and AI diagnostic insights.'),
      color: "from-pink-400 to-rose-500",
      link: "/timeline"
    },
    {
      icon: Bell,
      title: t('featureCards.remindersTitle', 'Smart Reminders'),
      desc: t('featureCards.remindersDesc', 'Timely alerts for supplements, water intake, doctor visits & period tracking.'),
      color: "from-amber-400 to-orange-500",
      link: "/reminders"
    },
    {
      icon: Calendar,
      title: t('featureCards.menstrualTitle', 'Menstrual Care'),
      desc: t('featureCards.menstrualDesc', 'Ovulation forecasting, symptom logging, and period wellness analytics.'),
      color: "from-violet-500 to-purple-700",
      link: "/menstrual"
    },
    {
      icon: Baby,
      title: t('featureCards.pregnancyTitle', 'Pregnancy Companion'),
      desc: t('featureCards.pregnancyDesc', 'Week-by-week trimester guidance, bump photo journal, and kick counter.'),
      color: "from-fuchsia-400 to-pink-600",
      link: "/pregnancy"
    },
    {
      icon: BookOpen,
      title: t('featureCards.educationTitle', 'AI Health Education'),
      desc: t('featureCards.educationDesc', 'Bite-sized articles, myth busters & video guides curated by top female obstetricians.'),
      color: "from-cyan-500 to-blue-600",
      link: "/education"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Language Selection Header Prompt Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm">
        <Globe className="w-4 h-4 text-yellow-300 animate-spin-slow" />
        <span>{t('landing.promptBanner', 'Select your preferred language:')} <strong>{activeLangObj.name} ({activeLangObj.native})</strong></span>
        <button
          onClick={() => setIsLangModalOpen(true)}
          className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-bold transition-all underline"
        >
          {t('landing.changeLang', 'Change Language')} ({languages.length})
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Decorative Glowing Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-300/30 via-pink-200/30 to-teal-200/30 blur-3xl rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold tracking-wide shadow-2xs">
                <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600" />
                <span>{t('landing.heroBadge', "Next-Gen Women's Healthcare Platform")}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                {t('appName')}
                <br />
                <span className="gradient-text">{t('tagline')}</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-600 font-normal max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {t('heroDescription')} {t('landing.heroSub', 'Designed specifically for women across India with 10 native languages, intelligent symptom checker, and trusted female doctors.')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleStartJourney}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white font-extrabold text-base shadow-xl shadow-purple-500/25 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
                >
                  <span>{isAuthenticated ? t('landing.goToDashboard', 'Go to Dashboard') : t('signup')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-700 font-bold text-base shadow-sm hover:shadow-md transition-all text-center"
                >
                  {t('login')}
                </Link>

                <button
                  onClick={() => setIsLearnModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-base transition-colors text-center"
                >
                  {t('learnMore')}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs font-semibold text-slate-500">{t('landing.safeConfidential', 'Safe & Confidential')}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">10+</p>
                  <p className="text-xs font-semibold text-slate-500">{t('landing.indianLanguages', 'Indian Languages')}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">24/7</p>
                  <p className="text-xs font-semibold text-slate-500">{t('landing.aiMedicalGuidance', 'AI Medical Guidance')}</p>
                </div>
              </div>
            </div>

            {/* Right Image Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-500 to-teal-400 opacity-30 blur-2xl"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="/indian_doctor.png"
                    alt="Verified Indian Female Gynecologist Doctor"
                    className="w-full h-[460px] object-contain bg-slate-50 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-2xl border border-white/60 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{t('landing.verifiedFemaleDoctors', 'Verified Female Doctors')}</p>
                      <p className="text-[11px] text-slate-600">{t('landing.connectGynaecologists', 'Connect with top gynecologists near you')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-purple-600 tracking-wider uppercase bg-purple-100 px-3 py-1 rounded-full inline-block">
              {t('landing.careEngineTitle', 'Comprehensive Care Engine')}
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {t('landing.careEngineHeading', 'Everything Every Woman Needs for Complete Health & Care')}
            </h3>
            <p className="text-slate-600 text-base">
              {t('landing.careEngineSub', "From monthly cycle tracking to emergency hospital care and AI symptom diagnosis, NariCare AI is built for every stage of a woman's life.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(isAuthenticated ? feat.link : '/login')}
                  className="group cursor-pointer bg-slate-50 hover:bg-white rounded-3xl p-8 border border-slate-100 hover:border-purple-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-extrabold text-purple-600 group-hover:translate-x-1 transition-transform">
                    <span>{t('landing.exploreFeature', 'Explore Feature')}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multilingual Highlight Banner */}
      <section className="py-16 gradient-soft border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">
            {t('landing.motherTongueTitle', 'Healthcare in Your Mother Tongue')}
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            {t('landing.motherTongueSub', 'No language barriers. Use NariCare AI effortlessly in English, Hindi, Hinglish, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, or Malayalam.')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto pt-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setIsLangModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-white border border-purple-200 text-slate-800 text-sm font-semibold hover:border-purple-500 hover:bg-purple-50 transition-all shadow-xs flex items-center space-x-2"
              >
                <span>{lang.flag}</span>
                <span>{lang.native}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <LearnMoreModal isOpen={isLearnModalOpen} onClose={() => setIsLearnModalOpen(false)} />
      <LanguageSelectorModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
