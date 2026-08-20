import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useHealthData } from '../context/HealthDataContext';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import ReportExplainerModal from '../components/healthcare/ReportExplainerModal';

import {
  Bell,
  Sparkles,
  MapPin,
  Stethoscope,
  Clock,
  Calendar,
  Baby,
  BookOpen,
  UserCheck,
  ArrowRight,
  Heart,
  Droplet,
  Pill,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  ChevronRight,
  FileText,
  X
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    reminders,
    cycleData,
    isPregnancyEnabled,
    setIsPregnancyEnabled,
    doctors,
    records,
    saveAnalysis
  } = useHealthData();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedReportForAnalysis, setSelectedReportForAnalysis] = useState(null);

  // Time based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const nextUncompletedReminder = reminders.find(r => !r.completed) || reminders[0];
  const upcomingDoctor = doctors[0];

  const moduleCards = [
    {
      id: 'nearby',
      title: t('cards.nearby'),
      sub: t('cards.nearbySub'),
      icon: MapPin,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      gradient: "from-purple-500 to-indigo-600",
      link: "/nearby"
    },
    {
      id: 'ai-navigator',
      title: t('cards.aiNav'),
      sub: t('cards.aiNavSub'),
      icon: Stethoscope,
      color: "bg-teal-100 text-teal-700 border-teal-200",
      gradient: "from-teal-400 to-emerald-600",
      link: "/ai-navigator"
    },
    {
      id: 'timeline',
      title: t('cards.timeline'),
      sub: t('cards.timelineSub'),
      icon: Clock,
      color: "bg-pink-100 text-pink-700 border-pink-200",
      gradient: "from-pink-400 to-rose-500",
      link: "/timeline"
    },
    {
      id: 'reminders',
      title: t('cards.reminders'),
      sub: t('cards.remindersSub'),
      icon: Bell,
      color: "bg-amber-100 text-amber-700 border-amber-200",
      gradient: "from-amber-400 to-orange-500",
      link: "/reminders"
    },
    {
      id: 'menstrual',
      title: t('cards.menstrual'),
      sub: t('cards.menstrualSub'),
      icon: Calendar,
      color: "bg-violet-100 text-violet-700 border-violet-200",
      gradient: "from-violet-500 to-purple-700",
      link: "/menstrual"
    },
    {
      id: 'pregnancy',
      title: t('cards.pregnancy'),
      sub: t('cards.pregnancySub'),
      icon: Baby,
      color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
      gradient: "from-fuchsia-400 to-pink-600",
      link: "/pregnancy",
      isDisabled: !isPregnancyEnabled,
      disabledMsg: t('cards.pregnancyDisabledMsg')
    },
    {
      id: 'education',
      title: t('cards.education'),
      sub: t('cards.educationSub'),
      icon: BookOpen,
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      gradient: "from-cyan-500 to-blue-600",
      link: "/education"
    },
    {
      id: 'profile',
      title: t('cards.profile'),
      sub: t('cards.profileSub'),
      icon: UserCheck,
      color: "bg-slate-100 text-slate-700 border-slate-200",
      gradient: "from-slate-700 to-slate-900",
      link: "/profile"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-purple-600">{getGreeting()} 👋</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                Radius: {user.radius || '10 km'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {user.name}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-300 shadow-xs transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">Notifications (3)</h4>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-100">
                      <strong>Fertile Window Alert:</strong> High probability of ovulation today.
                    </div>
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900 border border-teal-100">
                      <strong>Medication Reminder:</strong> Iron & Folic acid tablet due at 2:00 PM.
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
                      <strong>Doctor Appointment:</strong> Dr. Priya Nair confirmed for tomorrow.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SOS Emergency Button */}
            <a
              href="tel:108"
              className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs flex items-center space-x-2 transition-all"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>SOS Emergency (108)</span>
            </a>
          </div>
        </div>

        {/* Top Summary Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Widget 1: Today's Health Tip */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-purple-500/15 relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                {t('todaysTip')}
              </span>
              <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              "Include iron-rich spinach, pomegranate, and Vitamin C in your diet today to combat luteal fatigue and maintain hemoglobin level above 12 g/dL."
            </p>
            <div className="text-[11px] text-purple-200 flex items-center gap-1 font-medium">
              <span>Verified by Senior Gynecologist AI</span>
            </div>
          </div>

          {/* Widget 2: Next Reminder & Appointment */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('nextReminder')}
                </span>
                <Pill className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">
                {nextUncompletedReminder?.title || 'Iron Supplement'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Scheduled for {nextUncompletedReminder?.time || '02:00 PM'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Upcoming Consult</span>
                <p className="text-xs font-bold text-slate-800">{upcomingDoctor.name}</p>
              </div>
              <button
                onClick={() => navigate('/reminders')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
              >
                View Alerts
              </button>
            </div>
          </div>

          {/* Widget 3: Current Menstrual Cycle Summary */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                {t('currentCycle')}
              </span>
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>

            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{t('day')} {cycleData.currentDay}</span>
                <span className="text-xs font-bold text-teal-600">/ {cycleData.cycleLength} Days</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Phase: <span className="text-purple-700">{cycleData.phase}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Fertile Window: {cycleData.fertileDays}
              </p>
            </div>

            <button
              onClick={() => navigate('/menstrual')}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-900 text-xs font-bold transition-all flex items-center justify-center space-x-1"
            >
              <span>{t('dashboard.logSymptomsBtn', 'Log Symptoms & Period')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Module Cards Grid (8 Core Features) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('dashboard.modulesTitle', 'NariCare Modules')}
              </h2>
              <p className="text-xs text-slate-500">{t('dashboard.modulesSub', 'Access all your health companions in one place')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moduleCards.map((card) => {
              const Icon = card.icon;

              if (card.isDisabled) {
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative flex flex-col justify-between space-y-4 group hover:border-pink-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center border`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t('dashboard.disabledTag', 'Disabled')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg mb-1">{card.title}</h3>
                      <p className="text-xs text-slate-500">{card.disabledMsg}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsPregnancyEnabled(true);
                        navigate('/pregnancy');
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{t('cards.enableButton')}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={card.id}
                  onClick={() => navigate(card.link)}
                  className="bg-white hover:bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.sub}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t('dashboard.openModule', 'Open Module')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Records & NariCare AI Report Explainer */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Health Records AI Vault</span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                  Vault & Saved Health Records
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Lab Reports & AI Explainer
              </h2>
            </div>
            <button
              onClick={() => navigate('/timeline')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>View All Vault Records</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(records || []).slice(0, 3).map((rec) => (
              <div key={rec.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs">
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {rec.date}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{rec.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{rec.description || rec.doctor}</p>

                  {rec.sampleValues && rec.sampleValues.length > 0 && (
                    <div className="pt-2 space-y-1">
                      {rec.sampleValues.slice(0, 2).map((val, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl font-bold">
                          <span className="text-slate-700">{val.parameter}</span>
                          <span className={val.status === 'LOW' ? 'text-rose-600' : val.status === 'HIGH' ? 'text-amber-600' : 'text-teal-700'}>
                            {val.value} ({val.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedReportForAnalysis(rec)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-2xl font-bold text-xs shadow hover:opacity-95 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <span>Explain Report with NariCare AI</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* AI Report Explainer Modal */}
      <ReportExplainerModal
        isOpen={!!selectedReportForAnalysis}
        onClose={() => setSelectedReportForAnalysis(null)}
        reportRecord={selectedReportForAnalysis}
        onSaveAnalysis={(id, res) => {
          if (saveAnalysis) saveAnalysis(id, res);
        }}
      />

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default DashboardPage;
