import React from 'react';
import { HeartPulse, ShieldCheck, Mail, Phone, MapPin, Share2, MessageCircle, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-teal-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                NariCare <span className="text-purple-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('heroDescription')}
            </p>
            <div className="flex items-center space-x-3 text-slate-400 pt-2">
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white transition-colors" title="Share">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white transition-colors" title="Community">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600 hover:text-white transition-colors" title="Global Network">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Platform Features */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Platform Features</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#" className="hover:text-purple-300 transition-colors">AI Health Navigator</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Find Female Gynecologists</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Menstrual & Fertility Tracker</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Pregnancy Companion Guide</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Home Diagnostics Booking</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Medical Transport Assistance</a></li>
            </ul>
          </div>

          {/* Col 3: Legal & Safety */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal & Trust</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#" className="hover:text-purple-300 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">HIPAA & Clinical Compliance</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Data Encryption & Security</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Emergency Medical Disclaimer</a></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Emergency & Support</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>support@naricare.ai</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>24/7 Helpline: 1800-NARI-CARE</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>NariCare Innovation Hub, HSR Layout, Bengaluru, Karnataka 560102</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NariCare AI Technologies Private Limited. All rights reserved.</p>
          <div className="flex space-x-6 text-slate-400">
            <a href="#" className="hover:text-purple-300">Privacy</a>
            <a href="#" className="hover:text-purple-300">Terms</a>
            <a href="#" className="hover:text-purple-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
