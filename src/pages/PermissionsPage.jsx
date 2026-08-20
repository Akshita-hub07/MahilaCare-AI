import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/layout/Navbar';
import { MapPin, Bell, Mic, ShieldCheck, Check, ArrowRight } from 'lucide-react';

const PermissionsPage = () => {
  const { permissions, updatePermissions } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [localPerms, setLocalPerms] = useState(permissions);

  const togglePermission = (key) => {
    setLocalPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    updatePermissions(localPerms);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {t('permissionsPage.title', 'App Permissions & Privacy')}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {t('permissionsPage.subtitle', 'To deliver a seamless, personalized healthcare experience, NariCare AI requests the following permissions.')}
            </p>
          </div>

          <div className="space-y-4">
            {/* Location Permission */}
            <div
              onClick={() => togglePermission('location')}
              className={`cursor-pointer p-6 rounded-2xl border transition-all flex items-start space-x-4 ${
                localPerms.location
                  ? 'border-purple-500 bg-purple-50/70 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                localPerms.location ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{t('permissionsPage.location', 'Location Access')}</h3>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    localPerms.location ? 'bg-purple-600 text-white' : 'border border-slate-300'
                  }`}>
                    {localPerms.location && <Check className="w-4 h-4" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Locates top verified female gynecologists and clinics near your home.
                </p>
              </div>
            </div>

            {/* Notifications Permission */}
            <div
              onClick={() => togglePermission('notifications')}
              className={`cursor-pointer p-6 rounded-2xl border transition-all flex items-start space-x-4 ${
                localPerms.notifications
                  ? 'border-purple-500 bg-purple-50/70 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                localPerms.notifications ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{t('permissionsPage.notifications', 'Smart Health Alerts')}</h3>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    localPerms.notifications ? 'bg-purple-600 text-white' : 'border border-slate-300'
                  }`}>
                    {localPerms.notifications && <Check className="w-4 h-4" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sends timely pill alerts, water intake reminders, and period tracking updates.
                </p>
              </div>
            </div>

            {/* Microphone Permission */}
            <div
              onClick={() => togglePermission('microphone')}
              className={`cursor-pointer p-6 rounded-2xl border transition-all flex items-start space-x-4 ${
                localPerms.microphone
                  ? 'border-purple-500 bg-purple-50/70 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                localPerms.microphone ? 'bg-pink-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <Mic className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{t('permissionsPage.microphone', 'Microphone Access')}</h3>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    localPerms.microphone ? 'bg-purple-600 text-white' : 'border border-slate-300'
                  }`}>
                    {localPerms.microphone && <Check className="w-4 h-4" />}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Enables hands-free voice assistant commands and speech input in your preferred language.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => {
                setLocalPerms({ location: true, notifications: true, microphone: true });
              }}
              className="w-full sm:w-1/2 py-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-sm transition-colors"
            >
              {t('permissionsPage.allowAll', 'Enable All Recommended Permissions')}
            </button>

            <button
              onClick={handleContinue}
              className="w-full sm:w-1/2 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('permissionsPage.continue', 'Continue to Dashboard')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
