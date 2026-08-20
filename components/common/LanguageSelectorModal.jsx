import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, X, Check } from 'lucide-react';

const LanguageSelectorModal = ({ isOpen, onClose }) => {
  const { currentLang, changeLanguage, languages, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t('selectLanguage')}</h3>
            <p className="text-sm text-slate-500">{t('welcomeSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  onClose();
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/80 text-purple-900 shadow-sm'
                    : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-semibold text-base">{lang.native}</div>
                    <div className="text-xs text-slate-500">{lang.name}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 text-center">
          ✨ You can change your language preference anytime from your Profile & Settings without losing your saved health data.
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
