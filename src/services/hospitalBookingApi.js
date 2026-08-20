/**
 * Hospital Appointment Booking API & Synchronization Service
 */

export const createAppointmentBooking = async (bookingDetails) => {
  console.log('[Hospital Booking API] Submitting appointment booking:', bookingDetails);
  
  // Simulate network API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const appointmentId = `NARI-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const confirmedRecord = {
    id: appointmentId,
    appointmentId,
    title: `Consultation: ${bookingDetails.doctorName || 'Senior Specialist'}`,
    doctor: bookingDetails.doctorName || 'Dr. Priya Nair',
    hospital: bookingDetails.hospitalName || 'Apollo Women Center',
    date: bookingDetails.date || 'Tomorrow',
    time: bookingDetails.time || '11:00 AM',
    estimatedCost: bookingDetails.cost || '₹800',
    type: 'Doctor Appointment',
    status: 'Confirmed',
    documentsRequired: [
      'Government Photo ID Proof (Aadhaar / Driving License)',
      'Previous Prescriptions & Lab Reports (if any)',
      'Health Insurance Card (if applicable)'
    ],
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    appointment: confirmedRecord
  };
};
