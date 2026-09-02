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
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                {t('dashboardHeader')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                PRO ACTIVE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {getGreeting()}, {user?.displayName ? user.displayName.split(' ')[0] : 'Ananya'} 👋
            </h1>
          </div>

          {/* Quick Notification Toggle & Mode Switch */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-all shadow-2xs"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            <button
              onClick={() => setIsPregnancyEnabled(!isPregnancyEnabled)}
              className={`px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center space-x-2 transition-all shadow-2xs ${
                isPregnancyEnabled
                  ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Baby className="w-4 h-4 text-fuchsia-600" />
              <span>{isPregnancyEnabled ? 'Pregnancy Mode Active' : 'Enable Pregnancy Mode'}</span>
            </button>
          </div>
        </header>

        {/* Notifications Modal Overlay */}
        {isNotificationsOpen && (
          <div className="relative z-40 bg-white p-5 rounded-3xl border border-slate-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600" />
                <span>Health Notifications & Reminders</span>
              </h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {reminders.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <div>
                      <strong className="text-slate-800 font-bold block">{r.title}</strong>
                      <span className="text-[10px] text-slate-500">{r.time} • {r.dosage}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${r.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {r.completed ? 'Taken' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero AI Quick Triage Banner */}
        <section className="bg-gradient-to-r from-purple-700 via-violet-600 to-teal-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>AI Symptom Triage Engine Active</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              How are you feeling today, Ananya?
            </h2>

            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-xl">
              Describe your symptoms in natural language. Our AI navigator offers private triage, recommended specialists, and instant appointment booking.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/ai-navigator')}
                className="px-6 py-3.5 rounded-2xl bg-white text-purple-700 font-extrabold text-xs shadow-lg hover:bg-purple-50 transition-all flex items-center space-x-2"
              >
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>Start AI Symptom Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/nearby')}
                className="px-6 py-3.5 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-extrabold text-xs border border-white/30 transition-all flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-teal-300" />
                <span>Find Nearby Hospitals</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard Core Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menstrual Cycle Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Menstrual Health</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Cycle Status</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 text-[10px] font-extrabold">
                {cycleData?.phase || 'Follicular Phase'}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900">
                {cycleData?.daysUntilNext || 12} Days
              </p>
              <p className="text-xs text-slate-500">
                Until next predicted period ({cycleData?.nextPeriodDate || 'Sep 12, 2026'})
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600">
              <Link to="/menstrual" className="hover:underline flex items-center gap-1">
                <span>View Cycle Insights</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Upcoming Reminder Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Medication Schedule</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Next Due</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                {nextUncompletedReminder?.time || '08:00 PM'}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 truncate">
                {nextUncompletedReminder?.title || 'Folic Acid Supplement'}
              </p>
              <p className="text-xs text-slate-500">
                Dosage: {nextUncompletedReminder?.dosage || '1 Tablet after dinner'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <Link to="/reminders" className="hover:underline flex items-center gap-1">
                <span>Manage Reminders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Upcoming Appointment Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Next Appointment</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Confirmed</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold">
                Tomorrow
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {upcomingDoctor?.name || 'Dr. Priya Nair (Gynecologist)'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {upcomingDoctor?.hospital || 'Apollo Women Specialty Hospital'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
              <Link to="/nearby" className="hover:underline flex items-center gap-1">
                <span>Healthcare Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Modules Grid (WITHOUT Separate Transport Card) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Healthcare Companion Services
            </h3>
            <span className="text-xs font-bold text-purple-600">8 Modules Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moduleCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => !card.isDisabled && navigate(card.link)}
                  className={`bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                    card.isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {card.isDisabled ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.sub}
                    </p>
                  </div>

                  {card.isDisabled && card.disabledMsg && (
                    <span className="text-[10px] text-fuchsia-700 bg-fuchsia-50 px-2 py-1 rounded-md font-bold block">
                      {card.disabledMsg}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Health Records & Document Explainer Section */}
        {records && records.length > 0 && (
          <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Uploaded Medical Reports & AI Summaries</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">{records.length} Documents Loaded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {records.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 truncate">{rec.title || rec.name || 'Medical Report'}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-md">Report</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{rec.summary || 'Lab report uploaded. Click to analyze with AI.'}</p>
                  <button
                    onClick={() => setSelectedReportForAnalysis(rec)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain Report with AI</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Report Explainer Modal */}
      {selectedReportForAnalysis && (
        <ReportExplainerModal
          isOpen={!!selectedReportForAnalysis}
          onClose={() => setSelectedReportForAnalysis(null)}
          report={selectedReportForAnalysis}
          onSaveAnalysis={saveAnalysis}
        />
      )}

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default DashboardPage;
