import React, { useState } from 'react';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserCheck, Globe, ShieldCheck, Phone, Check, LogOut, Save, Eye, Bell, Navigation, User } from 'lucide-react';

const ProfileSettingsPage = () => {
  const { user, setUser, permissions, updatePermissions, logout } = useAuth();
  const { currentLang, changeLanguage, languages, t } = useLanguage();

  const [name, setName] = useState(user.name || 'Ananya Sharma');
  const [email, setEmail] = useState(user.email || 'ananya.sharma@example.com');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [age, setAge] = useState(user.age || 28);
  const [radius, setRadius] = useState(user.radius || '10 km');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98111 22233');
  const [femaleOnly, setFemaleOnly] = useState(user.femaleDoctorsOnly ?? true);
  const [transportPref, setTransportPref] = useState(user.transportAssistance ?? true);
  const [highContrast, setHighContrast] = useState(false);

  const [localPerms, setLocalPerms] = useState(permissions);
  const [savedAlert, setSavedAlert] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      email,
      phone,
      age,
      radius,
      femaleDoctorsOnly: femaleOnly,
      transportAssistance: transportPref
    });
    updatePermissions(localPerms);
    setSavedAlert("Profile & Preferences updated instantly!");
    setTimeout(() => setSavedAlert(''), 3000);
  };

  const handleLanguageSwitch = (langCode) => {
    changeLanguage(langCode);
    setUser({ ...user, preferredLanguage: langCode });
    setSavedAlert(`Application language switched to ${languages.find(l => l.code === langCode)?.name}!`);
    setTimeout(() => setSavedAlert(''), 3000);
  };

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'} flex font-sans pb-20 lg:pb-0`}>
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">{t('profilePage.accountTag', 'Account Settings')}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">
                {t('profilePage.preferencesBadge', 'Preferences')}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">
              {t('profilePage.title', 'Profile & Settings')}
            </h1>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            {t('logout', 'Logout')}
          </button>
        </div>

        {savedAlert && (
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-bold flex items-center space-x-2">
            <Check className="w-5 h-5 text-teal-600" />
            <span>{savedAlert}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              {t('profilePage.personalInfo', 'Personal Information')}
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t('profilePage.fullName', 'Full Name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t('profilePage.age', 'Age')}</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t('profilePage.email', 'Email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t('profilePage.phone', 'Phone Number')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-500" />
                  {t('profilePage.emergencyHeader', 'Emergency Contact')}
                </h4>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">{t('profilePage.emergencyPhone', 'Emergency Contact Number')}</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">{t('profilePage.healthcarePref', 'Healthcare Preferences')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">{t('profilePage.radiusLabel', 'Search Radius')}</label>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                    >
                      <option value="5 km">5 km Radius</option>
                      <option value="10 km">10 km Radius</option>
                      <option value="15 km">15 km Radius</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-800">{t('profilePage.femaleOnly', 'Female Doctors Preference')}</span>
                    <input
                      type="checkbox"
                      checked={femaleOnly}
                      onChange={(e) => setFemaleOnly(e.target.checked)}
                      className="w-4 h-4 accent-purple-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-2xl font-bold text-xs shadow hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('profilePage.saveBtn', 'Save Profile Changes')}
              </button>
            </form>
          </div>

          {/* Right Controls: Language & Accessibility */}
          <div className="lg:col-span-4 space-y-6">
            {/* Language Switcher Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Application Language
              </h3>
              <p className="text-xs text-slate-500">
                Switch default language for menus, AI responses, and medical explanations.
              </p>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageSwitch(l.code)}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                      currentLang === l.code ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility Controls */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                Accessibility Features
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800">High Contrast Mode</span>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700">
                  🔊 <strong>Voice Assistant:</strong> Screen reader and Speech synthesis compatible.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default ProfileSettingsPage;
