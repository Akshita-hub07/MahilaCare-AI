import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Stethoscope,
  Clock,
  Bell,
  Calendar,
  Baby,
  BookOpen,
  UserCheck,
  Globe,
  LogOut,
  HeartPulse
} from 'lucide-react';
import LanguageSelectorModal from '../common/LanguageSelectorModal';

const DesktopSidebar = () => {
  const { t, currentLang, languages } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLangModalOpen, setIsLangModalOpen] = React.useState(false);

  const navItems = [
    { path: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { path: '/nearby', label: t('navNearby'), icon: MapPin },
    { path: '/ai-navigator', label: t('navAINavigator'), icon: Stethoscope },
    { path: '/timeline', label: t('navTimeline'), icon: Clock },
    { path: '/reminders', label: t('navReminders'), icon: Bell },
    { path: '/menstrual', label: t('navMenstrual'), icon: Calendar },
    { path: '/pregnancy', label: t('navPregnancy'), icon: Baby },
    { path: '/education', label: t('navEducation'), icon: BookOpen },
    { path: '/profile', label: t('navProfile'), icon: UserCheck }
  ];

  const activeLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 min-h-screen sticky top-0 z-30 p-4 shadow-sm">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-teal-400 p-0.5 shadow-md shadow-purple-500/20">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
            NariCare
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
              AI
            </span>
          </span>
          <p className="text-[10px] text-slate-500 font-medium">{t('tagline')}</p>
        </div>
      </div>

      {/* Language Quick Toggle */}
      <button
        onClick={() => setIsLangModalOpen(true)}
        className="w-full mb-6 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-100/80 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-200 transition-all text-xs font-medium text-slate-700"
      >
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <span>{activeLangObj.flag} {activeLangObj.native}</span>
        </div>
        <span className="text-[10px] bg-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded-md uppercase">{t('landing.changeLang', 'Change')}</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Mini Footer */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
              {user.name ? user.name[0] : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] text-teal-600 font-medium truncate">Radius: {user.radius || '10 km'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <LanguageSelectorModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </aside>
  );
};

export default DesktopSidebar;
