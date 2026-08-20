import React from 'react';
import { X, Sparkles, HeartPulse, ShieldCheck, Stethoscope, Car, FileText, Globe } from 'lucide-react';

const LearnMoreModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">About NariCare AI</h3>
            <p className="text-sm text-purple-600 font-medium">Empowering Women's Health with Intelligent AI</p>
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-5 mb-6 text-slate-700 leading-relaxed text-sm">
          <p className="font-medium text-purple-900 mb-2">Our Mission:</p>
          "NariCare AI is an AI-powered healthcare platform designed specifically for women. It provides intelligent healthcare guidance, symptom analysis, hospital recommendations, appointment booking, home diagnostics, transport assistance, menstrual and pregnancy care, digital health records, multilingual support and personalized healthcare management."
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Stethoscope className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Symptom Checker & Triage</h4>
              <p className="text-xs text-slate-500">24/7 clinical AI symptom evaluation tuned for female physiology.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <HeartPulse className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Cycle & Pregnancy Tracker</h4>
              <p className="text-xs text-slate-500">Ovulation alerts, period forecasting & week-by-week pregnancy guides.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Car className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Home Labs & Transport</h4>
              <p className="text-xs text-slate-500">Sample collection at home & safe medical transit to trusted clinics.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
            <Globe className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">10 Indian Languages</h4>
              <p className="text-xs text-slate-500">Speak and read in Hindi, Tamil, Bengali, Punjabi, Telugu & more.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-md"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;
