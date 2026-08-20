import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Globe, Sparkles, User, LogOut, Menu, X, HeartPulse } from 'lucide-react';
import LanguageSelectorModal from '../common/LanguageSelectorModal';
import LearnMoreModal from '../common/LearnMoreModal';

const Navbar = () => {
  const { currentLang, languages, t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-nav transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <RouterLink to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-teal-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-purple-600 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                {t('appName')}
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold border border-purple-200">
                  AI
                </span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-slate-500 tracking-wide">
                {t('tagline')}
              </span>
            </div>
          </RouterLink>

          {/* Desktop Right Links */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector Pill */}
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 hover:text-purple-900 transition-all"
            >
              <Globe className="w-4 h-4 text-purple-600" />
              <span>{activeLangObj.flag} {activeLangObj.native}</span>
            </button>

            <button
              onClick={() => setIsLearnModalOpen(true)}
              className="text-sm font-semibold text-slate-600 hover:text-purple-600 px-3 py-2 rounded-xl transition-colors"
            >
              {t('learnMore')}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <RouterLink
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all"
                >
                  {t('navDashboard')}
                </RouterLink>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <RouterLink
                  to="/login"
                  className="px-4 py-2.5 rounded-2xl text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  {t('login')}
                </RouterLink>
                <RouterLink
                  to="/signup"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all"
                >
                  {t('signup')}
                </RouterLink>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsLangModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <span className="text-base">{activeLangObj.flag}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
            <button
              onClick={() => {
                setIsLearnModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-semibold text-slate-700"
            >
              {t('learnMore')}
            </button>
            {isAuthenticated ? (
              <RouterLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-2xl bg-purple-600 text-white font-semibold text-sm"
              >
                {t('landing.goToDashboard', 'Go to Dashboard')}
              </RouterLink>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <RouterLink
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm"
                >
                  {t('login')}
                </RouterLink>
                <RouterLink
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-2xl bg-purple-600 text-white font-semibold text-sm"
                >
                  {t('signup')}
                </RouterLink>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Modals */}
      <LanguageSelectorModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
      <LearnMoreModal isOpen={isLearnModalOpen} onClose={() => setIsLearnModalOpen(false)} />
    </>
  );
};

export default Navbar;
