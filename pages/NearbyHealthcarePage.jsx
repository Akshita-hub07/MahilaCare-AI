import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import FloatingAIChat from '../components/common/FloatingAIChat';
import HospitalCard from '../components/healthcare/HospitalCard';
import AppointmentBookingModal from '../components/healthcare/AppointmentBookingModal';
import HomeDiagnosisModal from '../components/healthcare/HomeDiagnosisModal';
import TransportAssistanceModal from '../components/healthcare/TransportAssistanceModal';
import { useAuth } from '../context/AuthContext';
import { userHealthStorage } from '../services/userHealthStorage';
import { getRankedHospitals } from '../utils/hospitalRanking';
import { MapPin, Filter, Sparkles, Check } from 'lucide-react';

const NearbyHealthcarePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedRadius, setSelectedRadius] = useState(user.radius || '10 km');

  // Active Modals State
  const [bookingHospital, setBookingHospital] = useState(null);
  const [homeDiagHospital, setHomeDiagHospital] = useState(null);
  const [transportHospital, setTransportHospital] = useState(null);

  // Compute derived appointment reason based on conversation / triage context
  const derivedAppointmentReason = useMemo(() => {
    if (location.state?.reason) {
      return location.state.reason;
    }
    if (location.state?.symptoms) {
      return `Consultation regarding ${location.state.symptoms}.`;
    }

    const stored = userHealthStorage.loadUserData(user);
    if (stored?.symptomHistory && stored.symptomHistory.length > 0) {
      const latestTriage = stored.symptomHistory[0];
      if (latestTriage?.symptoms) {
        return `Consultation regarding ${latestTriage.symptoms}.`;
      }
    }

    const userKey = user?.email || user?.id || 'guest_user';
    try {
      const rawChat = localStorage.getItem(`naricare_chat_history_${userKey}`);
      if (rawChat) {
        const chatMsgs = JSON.parse(rawChat);
        for (let i = chatMsgs.length - 1; i >= 0; i--) {
          const msg = chatMsgs[i];
          if (msg.sender === 'user' && msg.text) {
            const lower = msg.text.toLowerCase();
            if (
              lower.includes('period') ||
              lower.includes('cramps') ||
              lower.includes('pain') ||
              lower.includes('bleeding') ||
              lower.includes('fever') ||
              lower.includes('symptom') ||
              lower.includes('pcos') ||
              lower.includes('discharge') ||
              lower.includes('pregnancy') ||
              lower.includes('irregular')
            ) {
              let cleanText = msg.text.trim();
              if (/^i've been having/i.test(cleanText) || /^i have been having/i.test(cleanText) || /^i have/i.test(cleanText)) {
                return `Consultation regarding ${cleanText.replace(/^i've been having|^i have been having|^i have/i, '').trim()}.`;
              }
              return `Consultation regarding ${cleanText}.`;
            }
          }
        }
      }
    } catch (e) {}

    return 'Consultation regarding general gynecological checkup & medical evaluation.';
  }, [location.state, user]);

  // Compute AI Ranked Hospitals
  const rankedHospitals = useMemo(() => {
    return getRankedHospitals(selectedRadius, user);
  }, [selectedRadius, user]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Healthcare Location Search & AI Ranking</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                Smart Suitability Match
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Find Nearby Healthcare & Hospitals
            </h1>
          </div>

          {/* Radius Filter Pills */}
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <span className="text-xs font-bold text-slate-500">Radius:</span>
            {['5 km', '10 km', '15 km'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRadius === r
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* AI Ranking Explanation Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-violet-600 to-teal-500 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">AI Hospital Suitability Rankings</h3>
              <p className="text-xs text-purple-100 mt-0.5">
                Hospitals are ranked based on distance, female-friendly infrastructure, privacy score, waiting times, and your onboarding preferences.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-xs font-bold shrink-0 border border-white/30">
            {rankedHospitals.length} Centers Found within {selectedRadius}
          </span>
        </div>

        {/* Map Simulator */}
        <div className="relative rounded-3xl overflow-hidden h-52 bg-slate-900 border border-slate-200 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200"
            alt="Map Preview"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-6 flex flex-col justify-between">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold self-start border border-white/30">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Searching within {selectedRadius} radius</span>
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">Showing Highest Ranked Hospitals First</h3>
            </div>
          </div>
        </div>

        {/* Ranked Hospitals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedHospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onBookAppointment={(h) => setBookingHospital(h)}
              onHomeDiagnosis={(h) => setHomeDiagHospital(h)}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <AppointmentBookingModal
        isOpen={!!bookingHospital}
        onClose={() => setBookingHospital(null)}
        hospital={bookingHospital}
        initialNotes={derivedAppointmentReason}
        onTriggerTransport={(h) => setTransportHospital(h)}
      />

      <HomeDiagnosisModal
        isOpen={!!homeDiagHospital}
        onClose={() => setHomeDiagHospital(null)}
        provider={homeDiagHospital?.name || 'Apollo Diagnostics'}
      />

      <TransportAssistanceModal
        isOpen={!!transportHospital}
        onClose={() => setTransportHospital(null)}
        destination={transportHospital?.name || 'Hospital'}
      />

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default NearbyHealthcarePage;
