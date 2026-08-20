import React, { useState } from 'react';
import { X, Car, Navigation, ShieldCheck, Zap, Phone, Check, Clock } from 'lucide-react';
import { googleMapsService } from '../../services/googleServices';

const TRANSPORT_OPTIONS = [
  {
    id: 'cab',
    name: 'Cab / Ride App (Uber / Ola)',
    icon: '🚗',
    estimatedFare: '₹140 - ₹180',
    distanceKm: '3.2 km',
    estimatedTime: '12 Mins',
    eta: '3 mins away',
    badge: 'Fastest Route',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'auto',
    name: 'Auto Rickshaw',
    icon: '🛺',
    estimatedFare: '₹65 - ₹85',
    distanceKm: '3.2 km',
    estimatedTime: '15 Mins',
    eta: 'Available Nearby',
    badge: 'Budget Friendly',
    badgeColor: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'metro',
    name: 'Namma Metro / Public Transit',
    icon: '🚇',
    estimatedFare: '₹20',
    distanceKm: '2.8 km',
    estimatedTime: '18 Mins',
    eta: 'Next train in 4 mins',
    badge: 'Eco Friendly',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'trusted',
    name: 'Trusted Family Contact Pickup',
    icon: '🤝',
    estimatedFare: 'Free',
    distanceKm: '3.2 km',
    estimatedTime: '15 Mins',
    eta: 'Contact Notified',
    badge: 'Safest Route',
    badgeColor: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'ambulance',
    name: 'Emergency Ambulance (108)',
    icon: '🚑',
    estimatedFare: 'Free (Govt Emergency)',
    distanceKm: '3.2 km',
    estimatedTime: '6 Mins',
    eta: 'Priority Dispatch',
    badge: 'High Priority',
    badgeColor: 'bg-rose-100 text-rose-800'
  }
];

const TransportAssistanceModal = ({ isOpen, onClose, destination = 'Apollo Women Hospital' }) => {
  const [selectedTransport, setSelectedTransport] = useState(TRANSPORT_OPTIONS[0]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleBookTransport = () => {
    setBookingConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto max-h-[88vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!bookingConfirmed ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
                <Car className="w-4 h-4" />
                <span>Multi-Modal Medical Transport</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">Medical Transport Options</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Transport Assistance to {destination}
              </h3>
              <p className="text-xs text-slate-500">Choose your preferred safe travel mode with real-time ETA & route safety badges.</p>
            </div>

            {/* Transport Options List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {TRANSPORT_OPTIONS.map((opt) => {
                const isSel = selectedTransport.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedTransport(opt)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isSel
                        ? 'border-purple-600 bg-purple-50/80 shadow-sm'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">{opt.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {opt.distanceKm} • {opt.estimatedTime} • ETA: {opt.eta}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm block">{opt.estimatedFare}</span>
                      {isSel && <span className="text-[10px] text-purple-700 font-bold">Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={handleBookTransport}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>Confirm {selectedTransport.name} Ride</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{selectedTransport.name} Arranged!</h3>
              <p className="text-xs text-slate-500 mt-1">Vehicle arriving in ~3 mins. Live GPS tracking enabled.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-left">
              <p><strong>Destination:</strong> {destination}</p>
              <p><strong>Estimated Fare:</strong> {selectedTransport.estimatedFare}</p>
              <p><strong>Estimated Duration:</strong> {selectedTransport.estimatedTime}</p>
              <p><strong>Safety Protocol:</strong> 🛡️ GPS Shared with NariCare Emergency Desk</p>
            </div>

            <div className="flex justify-between text-xs font-bold pt-2">
              <a
                href={googleMapsService.getNavigationUrl(destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-4 h-4" /> Open Navigation on Google Maps
              </a>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700">Close Window</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportAssistanceModal;
