import React, { useState } from 'react';
import { X, Home, CheckCircle2, AlertTriangle, FileText, Calendar, Clock } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

const PACKAGES = [
  { id: 'pkg-1', name: "Women's Complete Health Package (60+ tests)", price: '₹1,299', fasting: 'Fasting 8-10 Hours Required' },
  { id: 'pkg-2', name: "PCOS & Hormonal Panel (FSH, LH, Prolactin)", price: '₹1,699', fasting: 'Fasting 10 Hours Required' },
  { id: 'pkg-3', name: "Pregnancy & Hemoglobin Routine Check", price: '₹799', fasting: 'No Fasting Required' }
];

const HomeDiagnosisModal = ({ isOpen, onClose, provider = 'Apollo Diagnostics Doorstep' }) => {
  const { addHealthRecord } = useHealthData();

  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);
  const [collectionDate, setCollectionDate] = useState('2026-08-08');
  const [collectionSlot, setCollectionSlot] = useState('07:30 AM - 08:30 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen) return null;

  const handleBook = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const bookingId = `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const confirmed = {
        bookingId,
        provider,
        package: selectedPkg,
        date: collectionDate,
        slot: collectionSlot,
        deliveryTime: 'Within 24 Hours via WhatsApp & MahilaCare App'
      };
      setConfirmedBooking(confirmed);

      // Auto-save expected report to Health Timeline
      addHealthRecord({
        title: `Pending Report: ${selectedPkg.name}`,
        doctor: provider,
        date: `${collectionDate} (${collectionSlot})`,
        type: 'Lab Report',
        status: 'Sample Pickup Scheduled'
      });
    }, 800);
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

        {!confirmedBooking ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
                <Home className="w-4 h-4" />
                <span>Doorstep Sample Collection</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">Home Diagnostics</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Book Home Diagnostic Test
              </h3>
              <p className="text-xs text-slate-500">Provided by {provider} • Sterile kit & trained female phlebotomist.</p>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              {/* Package Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Diagnostic Package</label>
                <div className="space-y-2">
                  {PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        selectedPkg.id === pkg.id
                          ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{pkg.name}</h4>
                        <p className="text-[11px] text-amber-700 font-semibold mt-0.5">⚠️ {pkg.fasting}</p>
                      </div>
                      <span className="font-black text-slate-900 text-sm">{pkg.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Collection Date</label>
                  <input
                    type="date"
                    required
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                  <select
                    value={collectionSlot}
                    onChange={(e) => setCollectionSlot(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold"
                  >
                    <option>06:30 AM - 07:30 AM</option>
                    <option>07:30 AM - 08:30 AM</option>
                    <option>08:30 AM - 09:30 AM</option>
                  </select>
                </div>
              </div>

              {/* Preparation Notice */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong>Preparation Requirement:</strong>
                <p>{selectedPkg.fasting}. Drink plain water allowed. Avoid tea or coffee before sample collection.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-purple-600 text-white font-extrabold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all"
              >
                {isSubmitting ? 'Booking Sample Pickup...' : `Schedule Pickup (${selectedPkg.price})`}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Sample Collection Scheduled!</h3>
              <p className="text-xs font-bold text-teal-700 mt-1">Booking ID: {confirmedBooking.bookingId}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
              <p><strong>Package:</strong> {confirmedBooking.package.name}</p>
              <p><strong>Provider:</strong> {confirmedBooking.provider}</p>
              <p><strong>Collection Time:</strong> {confirmedBooking.date} ({confirmedBooking.slot})</p>
              <p><strong>Expected Delivery:</strong> {confirmedBooking.deliveryTime}</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 font-semibold border border-purple-100">
              ✨ Status automatically synced to your Health Timeline.
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs"
            >
              Done & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDiagnosisModal;
