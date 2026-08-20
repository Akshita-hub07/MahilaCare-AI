import React from 'react';
import { MapPin, Star, Clock, ShieldCheck, Check, Navigation, Calendar, Home, ArrowRight, Heart } from 'lucide-react';
import { googleMapsService } from '../../services/googleServices';
import { useLanguage } from '../../context/LanguageContext';

const HospitalCard = ({ hospital, onBookAppointment, onHomeDiagnosis }) => {
  const { t } = useLanguage();
  const isFemaleFriendly = hospital.femaleFriendlyScore >= 92;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group relative overflow-hidden">
      {/* Top Banner & Suitability Badge */}
      <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-100">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

        {/* AI Suitability Score Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 border border-white/40">
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>{hospital.suitabilityScore}% AI Suitability Match</span>
        </div>

        {/* Female Friendly Badge */}
        {isFemaleFriendly && (
          <div className="absolute top-3 left-3 bg-teal-500/90 backdrop-blur-md text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm flex items-center space-x-1 border border-white/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Female Friendly Verified</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-300">
            <span>{hospital.openStatus}</span>
            <span>•</span>
            <span>{hospital.distanceKm} km away</span>
          </div>
          <h3 className="text-lg font-black tracking-tight leading-snug drop-shadow-sm">{hospital.name}</h3>
        </div>
      </div>

      {/* Hospital Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Women Rating</span>
          <p className="font-extrabold text-slate-900 flex items-center justify-center gap-0.5 mt-0.5 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{hospital.rating}</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Wait</span>
          <p className="font-extrabold text-slate-900 mt-0.5">{hospital.waitTimeMins} Mins</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Consult Fee</span>
          <p className="font-extrabold text-purple-700 mt-0.5">₹{hospital.consultFee}</p>
        </div>
      </div>

      {/* Services Tags */}
      <div>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Specialized Services</span>
        <div className="flex flex-wrap gap-1.5">
          {hospital.services.slice(0, 3).map((serv, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 text-[11px] font-semibold border border-purple-100">
              ✓ {serv}
            </span>
          ))}
          {hospital.services.length > 3 && (
            <span className="px-2 py-1 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold">
              +{hospital.services.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onBookAppointment(hospital)}
          className="col-span-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-1"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t('nearbyPage.bookAppointment', 'Book OPD')}</span>
        </button>

        <button
          onClick={() => onHomeDiagnosis(hospital)}
          className="col-span-1 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
        >
          <Home className="w-3.5 h-3.5 text-purple-600" />
          <span>{t('nearbyPage.homeDiagnostics', 'Home Test')}</span>
        </button>

        <a
          href={googleMapsService.getNavigationUrl(hospital.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center space-x-1 text-center"
        >
          <Navigation className="w-3.5 h-3.5 text-teal-600" />
          <span>Navigate</span>
        </a>
      </div>
    </div>
  );
};

export default HospitalCard;
