import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, Navigation, Car, AlertCircle, FileText, Share2, Plus, Upload, Check } from 'lucide-react';
import { createAppointmentBooking } from '../../services/hospitalBookingApi';
import { googleCalendarService, googleMapsService } from '../../services/googleServices';
import { useHealthData } from '../../context/HealthDataContext';
import { extractTextFromFile } from '../../utils/documentExtractor';

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

const AppointmentBookingModal = ({ isOpen, onClose, hospital, onTriggerTransport, initialNotes }) => {
  const { addHealthRecord, updateHealthRecord } = useHealthData();

  const [selectedDate, setSelectedDate] = useState('2026-08-08');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [selectedDoctor, setSelectedDoctor] = useState(hospital?.doctorList?.[0] || 'Dr. Priya Nair (Gynecologist)');
  const [patientNotes, setPatientNotes] = useState(initialNotes || 'Routine gynecological checkup & medical consultation.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [createdRecordId, setCreatedRecordId] = useState(null);
  const [attachedFileName, setAttachedFileName] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const appointmentFileInputRef = useRef(null);

  useEffect(() => {
    if (initialNotes && initialNotes.trim()) {
      setPatientNotes(initialNotes);
    }
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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

    const newRecordId = `apt_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setCreatedRecordId(newRecordId);

    // Sync to Health Timeline
    addHealthRecord({
      id: newRecordId,
      title: `Confirmed OPD: ${selectedDoctor}`,
      doctor: hospital?.name || 'Apollo Women Center',
      date: `${selectedDate} at ${selectedTime}`,
      type: 'Doctor Appointment',
      status: 'Confirmed (Awaiting Report)',
      rawReportData: patientNotes
    });
  };

  const handleAttachReportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAttaching(true);
    const blobUrl = URL.createObjectURL(file);
    const res = await extractTextFromFile(file);
    setIsAttaching(false);

    setAttachedFileName(file.name);

    if (createdRecordId && updateHealthRecord) {
      updateHealthRecord(createdRecordId, {
        fileName: file.name,
        fileUrl: blobUrl,
        fileObjectUrl: blobUrl,
        fileTypeStr: file.type || '',
        rawReportData: res.success ? res.text : (patientNotes || `Attached report: ${file.name}`),
        status: 'Report Attached',
        hasUnextractableContent: !res.success
      });
    }
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

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Time Slot</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patient Symptoms / Notes</label>
                <textarea
                  rows="3"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Describe any ongoing symptoms or medical history..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none"
                ></textarea>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-purple-50 p-4 rounded-2xl flex items-center justify-between text-xs text-purple-900 border border-purple-100">
                <span>Estimated Consultation Fee:</span>
                <span className="text-base font-black text-purple-900">₹{hospital?.consultFee || 800}</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all"
                >
                  {isSubmitting ? 'Confirming Appointment...' : 'Confirm OPD Appointment'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Confirmed Receipt Screen */
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs font-bold text-teal-700">Booking ID: {confirmedBooking.appointmentId}</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Doctor / Specialist:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.doctor}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Hospital / Center:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.hospital}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Date & Time:</span>
                <span className="font-bold text-purple-700">{confirmedBooking.date} at {confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Estimated Fee:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.estimatedCost}</span>
              </div>
            </div>

            {/* Attach Medical Report to Appointment Section */}
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-teal-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-teal-700" />
                    Attach Report to this Appointment
                  </h4>
                  <p className="text-[11px] text-teal-800">Upload lab results or medical reports from your computer/desktop.</p>
                </div>
                <button
                  type="button"
                  onClick={() => appointmentFileInputRef.current?.click()}
                  disabled={isAttaching}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0 flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAttaching ? 'Attaching...' : attachedFileName ? 'Change Report' : 'Upload Report'}</span>
                </button>
              </div>

              {attachedFileName && (
                <div className="p-2 bg-white rounded-xl border border-teal-200 text-xs text-teal-950 font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">Attached: {attachedFileName}</span>
                </div>
              )}

              <input
                type="file"
                ref={appointmentFileInputRef}
                onChange={handleAttachReportFile}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.csv"
              />
            </div>

            {/* Documents Checklist */}
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-purple-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-700" />
                Required Documents Checklist:
              </h4>
              <ul className="text-xs text-purple-950 space-y-1">
                {confirmedBooking.documentsRequired.map((doc, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confirmation Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCalendar}
                className="py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Google Calendar</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onTriggerTransport) onTriggerTransport(hospital);
                }}
                className="py-3 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Car className="w-4 h-4" />
                <span>Transport Assistance</span>
              </button>
            </div>

            <div className="flex justify-between text-xs font-semibold pt-2">
              <a
                href={googleMapsService.getNavigationUrl(hospital?.address || 'Apollo Hospital')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate on Google Maps
              </a>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700">Close Receipt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBookingModal;
