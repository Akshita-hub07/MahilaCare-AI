import React, { useState, useEffect } from 'react';
import { X, Car, ExternalLink, Info, ArrowRight, Trash2, Check } from 'lucide-react';
import { transportService } from '../../services/transportService';

const TransportAssistanceModal = ({ isOpen, onClose, destination }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedTrip, setConfirmedTrip] = useState(null);
  const [cancelNotice, setCancelNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, destination]);

  const loadOptions = async () => {
    setLoading(true);
    setBookingConfirmed(false);
    setConfirmedTrip(null);
    setCancelNotice(false);

    const pickup = await transportService.getUserCurrentLocation();
    const dest = typeof destination === 'string' ? { name: destination } : destination;
    const res = await transportService.getTransportOptions(pickup, dest);
    if (res.success && res.options?.length) {
      setOptions(res.options);
      setSelectedOption(res.options[0]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const handleBookTransport = async (opt) => {
    const targetOption = opt || selectedOption;
    if (!targetOption) return;

    const pickup = await transportService.getUserCurrentLocation();
    const dest = typeof destination === 'string' ? { name: destination } : destination;
    const trip = await transportService.bookRide(targetOption, pickup, dest);
    setConfirmedTrip(trip);

    // DIRECT IMMEDIATE EXTERNAL ACTION TRIGGER
    if (targetOption.category === 'emergency' && targetOption.deepLink === 'tel:108') {
      window.location.href = 'tel:108';
    } else if (targetOption.deepLink && targetOption.deepLink.startsWith('http')) {
      window.open(targetOption.deepLink, '_blank', 'noopener,noreferrer');
    }

    setBookingConfirmed(true);
  };

  const handleCancelRide = () => {
    setBookingConfirmed(false);
    setConfirmedTrip(null);
    setSelectedOption(null);
    setCancelNotice(true);
    setTimeout(() => {
      setCancelNotice(false);
    }, 4000);
  };

  const destName = typeof destination === 'string' ? destination : (destination?.name || 'Healthcare Center');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-auto max-h-[88vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {cancelNotice && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Ride Selection Cancelled Successfully</span>
            </span>
            <button onClick={() => setCancelNotice(false)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!bookingConfirmed ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
                <Car className="w-4 h-4" />
                <span>Medical Ride Assistance</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">
                  Uber • Ola • Rapido
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Transport to {destName}
              </h3>
              <p className="text-xs text-slate-500">
                Compare estimated fares and ETAs, then click to open Uber, Ola, or Rapido with prefilled location.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-500 space-y-2">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p>Loading real-time provider options...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {options.map((opt) => {
                  const isSel = selectedOption?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOption(opt)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSel
                          ? 'border-purple-600 bg-purple-50/80 shadow-sm'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-extrabold text-slate-900 text-sm">{opt.provider} - {opt.vehicleType}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${opt.badgeColor}`}>
                              {opt.safetyBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {opt.distanceKm} • {opt.estimatedTime} • ETA: {opt.eta}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="font-black text-slate-900 text-sm block">{opt.estimatedFare}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookTransport(opt);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1 ${
                            opt.category === 'emergency'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <span>{opt.actionText || `Book on ${opt.provider}`}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => handleBookTransport(selectedOption)}
                disabled={!selectedOption || loading}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{selectedOption?.actionText || `Book on ${selectedOption?.provider || 'Provider'}`}</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Redirecting to {confirmedTrip?.provider}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete your booking in the official {confirmedTrip?.provider} app or website.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 p-3 rounded-2xl flex items-center justify-around text-xs font-bold text-purple-900">
              <span>MahilaCare AI</span>
              <ArrowRight className="w-4 h-4 text-purple-500" />
              <span>Select {confirmedTrip?.provider}</span>
              <ArrowRight className="w-4 h-4 text-purple-500" />
              <span className="text-teal-700">Complete Booking</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-left">
              <p><strong>Provider:</strong> {confirmedTrip?.provider} ({confirmedTrip?.vehicleType})</p>
              <p><strong>Destination:</strong> {confirmedTrip?.destinationName}</p>
              <p><strong>Estimated Fare:</strong> {confirmedTrip?.estimatedFare}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-left text-[11px] text-amber-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Booking Instruction:</strong> Complete your booking in the provider app. Destination location prefilled.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {confirmedTrip?.deepLink && (
                <button
                  onClick={() => {
                    if (confirmedTrip.category === 'emergency' && confirmedTrip.deepLink === 'tel:108') {
                      window.location.href = 'tel:108';
                    } else if (confirmedTrip.deepLink) {
                      window.open(confirmedTrip.deepLink, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Re-open {confirmedTrip.provider} App / Web</span>
                  <ExternalLink className="w-4 h-4 text-white" />
                </button>
              )}

              {/* CANCEL RIDE BUTTON */}
              <button
                onClick={handleCancelRide}
                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Cancel Ride Selection</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportAssistanceModal;
