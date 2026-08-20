import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { LayoutDashboard, MapPin, Stethoscope, Calendar, UserCheck } from 'lucide-react';

const MobileBottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { path: '/nearby', label: t('navNearby'), icon: MapPin },
    { path: '/ai-navigator', label: t('navAINavigator'), icon: Stethoscope },
    { path: '/menstrual', label: t('navMenstrual'), icon: Calendar },
    { path: '/profile', label: t('navProfile'), icon: UserCheck }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 py-2 px-3 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-purple-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] truncate max-w-[64px] text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
