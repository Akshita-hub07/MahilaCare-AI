import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/layout/Navbar';
import { HeartPulse, User, Mail, Phone, Lock, Calendar, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: 'Ananya Sharma',
    age: '28',
    email: 'ananya.sharma@example.com',
    phone: '+91 98765 43210',
    password: 'password123',
    confirmPassword: 'password123'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup({
      name: formData.name,
      age: parseInt(formData.age, 10) || 28,
      email: formData.email,
      phone: formData.phone
    });
    navigate('/permissions');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden">
        {/* Background Glowing Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-300/20 blur-3xl rounded-full pointer-events-none"></div>

        {/* Glassmorphism Card */}
        <div className="w-full max-w-lg bg-white/85 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/60 relative z-10">
          <div className="text-center mb-8 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 p-0.5 mx-auto shadow-lg shadow-purple-500/20 mb-3">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('auth.createAccount', 'Create Your MahilaCare Account')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('auth.signupSub', 'Join thousands of women managing their health with intelligent AI')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Age Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('auth.name', 'Full Name')}
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ananya Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 text-sm text-slate-900 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('auth.age', 'Age')}
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="age"
                    required
                    min="12"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="28"
                    className="w-full pl-11 pr-3 py-3 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 text-sm text-slate-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ananya.sharma@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('auth.phone', 'Phone Number')}
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white font-extrabold text-base shadow-xl shadow-purple-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('signup', 'Sign Up')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
            <p className="text-xs text-slate-600">
              {t('auth.alreadyAccount', 'Already have an account?')}{' '}
              <Link to="/login" className="font-extrabold text-purple-600 hover:text-purple-700 transition-colors">
                {t('login', 'Login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
