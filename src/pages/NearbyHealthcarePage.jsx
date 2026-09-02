import React, { useState, useMemo, useEffect } from 'react';
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
import { googleMapsService } from '../services/googleServices';
import { MapPin, Filter, Sparkles, AlertCircle, Crosshair, X, Info, Compass } from 'lucide-react';

const QUICK_CITIES = [
  { name: 'Bengaluru (Indiranagar)', lat: 12.9716, lng: 77.5946 },
  { name: 'Delhi NCR (Connaught Place)', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai (Andheri)', lat: 19.0760, lng: 72.8777 },
  { name: 'Hyderabad (Banjara Hills)', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai (T. Nagar)', lat: 13.0827, lng: 80.2707 }
];

const NearbyHealthcarePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedRadius, setSelectedRadius] = useState(user?.radius || '10 km');

  // Active Center Point Location State
  const [centerLocation, setCenterLocation] = useState({
    name: 'Bengaluru (Indiranagar)',
    lat: 12.9716,
    lng: 77.5946
  });
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Healthcare Search State
  const [rankedHospitals, setRankedHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [datasourceInfo, setDatasourceInfo] = useState('');
  const [configNotice, setConfigNotice] = useState(null);

  // Active Modals State
  const [bookingHospital, setBookingHospital] = useState(null);
  const [homeDiagHospital, setHomeDiagHospital] = useState(null);
  const [transportHospital, setTransportHospital] = useState(null);

  // Automatically fetch browser location & places on load
  useEffect(() => {
    handleDetectLocation();
  }, []);

  // Fetch healthcare facilities whenever centerLocation or selectedRadius changes
  useEffect(() => {
    fetchHealthcareFacilities();
  }, [centerLocation, selectedRadius]);

  const handleDetectLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation API is not supported by this browser.');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenterLocation({
          name: `Live GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsGeolocating(false);
        setGpsError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsGeolocating(false);
        if (err.code === 1) {
          setGpsError('Browser Location Permission Denied: Click the Lock 🔒 icon in your browser URL bar and set Location to "Allow". Or choose a quick city below.');
        } else if (err.code === 3) {
          setGpsError('GPS Request Timed Out: Ensure Windows Location services are enabled, or select a city below.');
        } else {
          setGpsError('Unable to acquire GPS coordinates from browser. Select a quick city below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchHealthcareFacilities = async () => {
    setLoadingHospitals(true);
    const res = await googleMapsService.fetchNearbyHealthcareFacilities(
      centerLocation.lat,
      centerLocation.lng,
      selectedRadius,
      user
    );

    setRankedHospitals(res.places || []);
    setDatasourceInfo(res.source || 'Healthcare Search Engine');
    setConfigNotice(res.configError || null);
    setLoadingHospitals(false);
  };

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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans pb-20 lg:pb-0">
      <DesktopSidebar />

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Healthcare Location Search & Radius Filter
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                Google Places & Distance Engine
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
            {['2 km', '5 km', '10 km', '15 km'].map((r) => (
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

        {/* Center Point Location Bar with Quick City Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="text-slate-500 font-semibold">Active Location:</span>
              <strong className="text-slate-900 truncate max-w-xs">{centerLocation.name}</strong>
            </div>
            <button
              onClick={handleDetectLocation}
              disabled={isGeolocating}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 flex items-center justify-center space-x-1.5 transition-all self-start sm:self-auto"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isGeolocating ? 'animate-spin' : ''}`} />
              <span>{isGeolocating ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
            </button>
          </div>

          {/* Quick City Buttons */}
          <div className="flex items-center space-x-2 pt-1 overflow-x-auto custom-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Compass className="w-3.5 h-3.5" />
              <span>Quick City:</span>
            </span>
            {QUICK_CITIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setCenterLocation({ name: c.name, lat: c.lat, lng: c.lng })}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all border ${
                  centerLocation.name === c.name
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Permission Error / Help Banner */}
        {gpsError && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block">GPS Access Notice</strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{gpsError}</p>
              </div>
            </div>
            <button onClick={() => setGpsError(null)} className="text-amber-500 hover:text-amber-700 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* System Server Notice */}
        {configNotice && (
          <div className="bg-purple-50/80 border border-purple-100 p-4 rounded-2xl text-xs text-purple-900 flex items-start space-x-2.5 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Healthcare Database & Distance Engine</span>
              <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                Displaying verified healthcare database with exact Haversine distance calculations.
              </p>
            </div>
          </div>
        )}

        {/* AI Ranking Explanation Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-violet-600 to-teal-500 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Geographic Radius & Suitability Match</h3>
              <p className="text-xs text-purple-100 mt-0.5">
                Showing healthcare centers within <strong className="text-white">{selectedRadius}</strong> of your location, sorted strictly by distance (nearest first).
              </p>
              <span className="text-[10px] text-purple-200 block mt-1">Data Source: {datasourceInfo}</span>
            </div>
          </div>
          <span className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-xs font-bold shrink-0 border border-white/30">
            {rankedHospitals.length} Centers Found within {selectedRadius}
          </span>
        </div>

        {/* Loading State or Cards Grid OR Empty State Banner */}
        {loadingHospitals ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold">Searching nearby healthcare facilities within {selectedRadius}...</p>
          </div>
        ) : rankedHospitals.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <MapPin className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                No healthcare facilities found within this radius
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                There are no registered healthcare centers strictly within <strong className="text-slate-800">{selectedRadius}</strong> of your active location. Try expanding your search radius to view available facilities.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              {['5 km', '10 km', '15 km'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRadius(r)}
                  className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  Expand to {r}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedHospitals.map((hosp) => (
              <HospitalCard
                key={hosp.id}
                hospital={hosp}
                onBookAppointment={(h) => setBookingHospital(h)}
                onHomeDiagnosis={(h) => setHomeDiagHospital(h)}
                onTransport={(h) => setTransportHospital(h)}
              />
            ))}
          </div>
        )}
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
        destination={transportHospital}
      />

      <MobileBottomNav />
      <FloatingAIChat />
    </div>
  );
};

export default NearbyHealthcarePage;
