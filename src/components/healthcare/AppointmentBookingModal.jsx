import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, Navigation, Car, AlertCircle, FileText, Share2, Trash2 } from 'lucide-react';
import { createAppointmentBooking } from '../../services/hospitalBookingApi';
import { googleCalendarService, googleMapsService } from '../../services/googleServices';
import { useHealthData } from '../../context/HealthDataContext';

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

const AppointmentBookingModal = ({ isOpen, onClose, hospital, onTriggerTransport, initialNotes }) => {
  const { addHealthRecord } = useHealthData();

  const [selectedDate, setSelectedDate] = useState('2026-08-08');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [selectedDoctor, setSelectedDoctor] = useState(hospital?.doctorList?.[0] || 'Dr. Priya Nair (Gynecologist)');
  const [patientNotes, setPatientNotes] = useState(initialNotes || 'Routine gynecological checkup & medical consultation.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [cancelNotice, setCancelNotice] = useState(false);

  useEffect(() => {
    if (initialNotes && initialNotes.trim()) {
      setPatientNotes(initialNotes);
    }
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCancelNotice(false);

    const result = await createAppointmentBooking({
      hospitalName: hospital?.name || 'Apollo Women Healthcare',
      doctorName: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      cost: `₹${hospital?.consultFee || 800}`,
      patientNotes
    });

    setIsSubmitting(false);
    setConfirmedBooking(result.appointment);

    // Sync to Health Timeline
    addHealthRecord({
      title: `Confirmed OPD: ${selectedDoctor}`,
      doctor: hospital?.name || 'Apollo Women Center',
      date: `${selectedDate} at ${selectedTime}`,
      type: 'Doctor Appointment',
      status: 'Confirmed'
    });
  };

  const handleCancelAppointment = () => {
    setConfirmedBooking(null);
    setCancelNotice(true);
    setTimeout(() => {
      setCancelNotice(false);
    }, 4000);
  };

  const handleAddToCalendar = async () => {
    if (!confirmedBooking) return;
    const res = await googleCalendarService.addAppointmentToCalendar({
      title: confirmedBooking.title,
      details: `Appointment ID: ${confirmedBooking.appointmentId}\nHospital: ${confirmedBooking.hospital}\nRequired Docs: ${confirmedBooking.documentsRequired.join(', ')}`,
      location: confirmedBooking.hospital
    });
    window.open(res.calendarUrl, '_blank');
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

        {cancelNotice && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Appointment Cancelled Successfully</span>
            </span>
            <button onClick={() => setCancelNotice(false)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!confirmedBooking ? (
          /* STEP 1: Booking Form */
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4" />
                <span>Appointment Scheduler</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">OPD Scheduler</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Book Consultation at {hospital?.name || 'Hospital'}
              </h3>
              <p className="text-xs text-slate-500">{hospital?.address || 'Verified Healthcare Center'}</p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              {/* Doctor / Specialist Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Doctor / Specialist</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none"
                >
                  {hospital?.doctorList?.map((doc, idx) => (
                    <option key={idx} value={doc}>{doc}</option>
                  )) || <option>Dr. Priya Nair (Gynecologist)</option>}
                </select>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason / Patient Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Visit / Triage Notes</label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none"
                  placeholder="Describe your health concern..."
                ></textarea>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-purple-700 font-bold block">Consultation Fee</span>
                  <span className="text-[10px] text-purple-600">Payable at clinic or online</span>
                </div>
                <span className="text-xl font-black text-purple-900">₹{hospital?.consultFee || 800}</span>
              </div>

              {/* Submit & Cancel Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? 'Confirming OPD Appointment...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Confirmed Booking Details & Cancel Appointment Option */
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                Appointment Booking Confirmed
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                ID: {confirmedBooking.appointmentId}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved to your MahilaCare AI Health Timeline
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <p><strong>Doctor:</strong> {confirmedBooking.doctorName}</p>
              <p><strong>Hospital:</strong> {confirmedBooking.hospital}</p>
              <p><strong>Schedule:</strong> {confirmedBooking.date} at {confirmedBooking.time}</p>
              <p><strong>Consult Fee:</strong> {confirmedBooking.consultFee}</p>
            </div>

            {/* Actions: Add to Calendar, Trigger Transport, and CANCEL APPOINTMENT */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAddToCalendar}
                className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md hover:bg-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Add Appointment to Google Calendar</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onTriggerTransport) onTriggerTransport(hospital);
                }}
                className="w-full py-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs border border-teal-200 transition-all flex items-center justify-center space-x-2"
              >
                <Car className="w-4 h-4 text-teal-600" />
                <span>Book Ride to Hospital</span>
              </button>

              {/* CANCEL APPOINTMENT BUTTON */}
              <button
                onClick={handleCancelAppointment}
                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Cancel Appointment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBookingModal;
