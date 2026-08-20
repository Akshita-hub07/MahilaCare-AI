import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/layout/Navbar';
import { HeartPulse, Mail, Lock, ArrowRight, CheckSquare, Square, Globe } from 'lucide-react';

const LoginPage = () => {
  const { login, hasCompletedOnboarding } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('ananya.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email: emailOrPhone, name: emailOrPhone.split('@')[0] || 'Ananya' });

    if (hasCompletedOnboarding) {
      navigate('/dashboard');
    } else {
      navigate('/permissions');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden">
        {/* Background Glowing Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-300/30 blur-3xl rounded-full pointer-events-none"></div>

        {/* Glassmorphism Card */}
        <div className="w-full max-w-md bg-white/85 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/60 relative z-10">
          <div className="text-center mb-8 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 p-0.5 mx-auto shadow-lg shadow-purple-500/20 mb-3">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('auth.welcomeBack', 'Welcome Back')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('auth.signinSub', 'Sign in to access your personalized NariCare AI dashboard')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('auth.password', 'Password')}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-2 text-slate-600 hover:text-purple-700 transition-colors"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>{t('auth.rememberMe', 'Remember me')}</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white font-extrabold text-base shadow-xl shadow-purple-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('login', 'Login')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer Signup Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
            <p className="text-xs text-slate-600">
              {t('auth.needAccount', "Don't have an account?")}{' '}
              <Link to="/signup" className="font-extrabold text-purple-600 hover:text-purple-700 transition-colors">
                {t('signup', 'Sign Up')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
