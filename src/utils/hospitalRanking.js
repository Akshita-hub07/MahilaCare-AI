/**
 * AI Hospital Ranking & Geographic Suitability Scoring Engine for MahilaCare AI
 * Calculates exact Haversine distances from active user location and strictly filters by selected radius.
 */

export const MOCK_HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'Apollo Women & Child Specialty Hospital',
    type: 'Multi-Specialty Hospital',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
    lat: 12.9780,
    lng: 77.6400,
    address: '12th Main Road, Indiranagar, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.9,
    reviewsCount: 480,
    femaleFriendlyScore: 98,
    privacyScore: 96,
    waitTimeMins: 12,
    homeDiagnosisAvailable: true,
    services: ['High-Risk Pregnancy Suite', 'Fetal Echocardiography & Doppler', 'Preeclampsia Management'],
    doctorList: ['Dr. Priya Nair (Senior Gynecologist)', 'Dr. Anjali Gupta (Fetal Medicine)'],
    consultFee: 800
  },
  {
    id: 'hosp-2',
    name: 'Cloudnine Maternity & Wellness Hospital',
    type: 'Women & Child Super-Specialty',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    lat: 12.9568,
    lng: 77.6482,
    address: 'Old Airport Road, Kodihalli, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.8,
    reviewsCount: 390,
    femaleFriendlyScore: 96,
    privacyScore: 95,
    waitTimeMins: 18,
    homeDiagnosisAvailable: true,
    services: ['Advanced IVF & ICSI Lab', 'Egg Freezing & Embryo Banking', 'Hormonal Ovulation Induction'],
    doctorList: ['Dr. Sunita Reddy (Senior Obstetrician)'],
    consultFee: 1200
  },
  {
    id: 'hosp-3',
    name: 'MahilaCare Partner Diagnostic & Gynec Center',
    type: 'Diagnostic & Women Clinic',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
    lat: 12.9352,
    lng: 77.6245,
    address: '100 Feet Road, Koramangala, Bengaluru',
    openStatus: 'Closes at 8:00 PM',
    rating: 4.7,
    reviewsCount: 210,
    femaleFriendlyScore: 94,
    privacyScore: 92,
    waitTimeMins: 10,
    homeDiagnosisAvailable: true,
    services: ['PCOS & Thyroid Blood Panels', 'Digital Mammography Scans', '3D Pelvic Ultrasound'],
    doctorList: ['Dr. Meera Deshmukh (Reproductive Endocrinology)'],
    consultFee: 950
  },
  {
    id: 'hosp-4',
    name: 'Manipal Hospital Women Unit',
    type: 'Multi-Speciality Hospital',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=600',
    lat: 12.9299,
    lng: 77.5824,
    address: '3rd Block, Jayanagar, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.9,
    reviewsCount: 520,
    femaleFriendlyScore: 97,
    privacyScore: 94,
    waitTimeMins: 15,
    homeDiagnosisAvailable: true,
    services: ['3D Keyhole Gynec Surgery', 'Endometriosis Excision', 'Uterine Fibroid Embolization'],
    doctorList: ['Dr. Sudha Ramachandran (Gynecologist)', 'Dr. Reena Patel (Obstetrician)'],
    consultFee: 1000
  },
  {
    id: 'hosp-5',
    name: 'Fortis La Femme Speciality Center',
    type: 'Super-Specialty Hospital',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    lat: 12.9611,
    lng: 77.6012,
    address: 'Richmond Road, Richmond Town, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.6,
    reviewsCount: 310,
    femaleFriendlyScore: 90,
    privacyScore: 91,
    waitTimeMins: 25,
    homeDiagnosisAvailable: false,
    services: ['Colposcopy & Pap Smear Screening', 'HPV Vaccination & Cervical Clinic', 'Ovarian Cancer Screening'],
    doctorList: ['Dr. Kavita Rao (Gynecologist)'],
    consultFee: 1100
  },
  {
    id: 'hosp-6',
    name: "St. John's Medical College & Women Hospital",
    type: 'Medical College & Hospital',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
    lat: 12.9281,
    lng: 77.6189,
    address: 'Sarjapur Road, Koramangala, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.8,
    reviewsCount: 610,
    femaleFriendlyScore: 95,
    privacyScore: 93,
    waitTimeMins: 20,
    homeDiagnosisAvailable: true,
    services: ['Level-3 Neonatal ICU (NICU)', 'Kangaroo Mother Care Unit', 'Infant Pediatric Cardiology'],
    doctorList: ['Dr. Sister Mary Joseph', 'Dr. Ramesh Kumar'],
    consultFee: 650
  }
];

/**
 * Calculates approximate geographic distance (km) using Haversine formula
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;

  // Round to 1 decimal place with minimum 0.5 km threshold for display realism
  return Math.max(0.5, Math.round(rawDist * 10) / 10);
}

/**
 * Ranks hospitals based on geographic distance from user location and radius filter
 */
export function getRankedHospitals(radiusFilter = '10 km', userCoords = { lat: 12.9716, lng: 77.5946 }, userPreferences = {}) {
  const maxRadiusKm = parseFloat(radiusFilter) || 10;
  const { lat: userLat, lng: userLng } = userCoords;

  // Calculate exact Haversine distance & filter strictly within maxRadiusKm
  const filtered = MOCK_HOSPITALS.map((hosp) => {
    const distKm = calculateHaversineDistance(userLat, userLng, hosp.lat, hosp.lng);

    // Compute AI Suitability Score (Distance + Rating + Female Friendly Score)
    const distancePenalty = Math.min(30, distKm * 3);
    const suitabilityScore = Math.min(99, Math.max(70, Math.round(
      (hosp.femaleFriendlyScore * 0.4) +
      (hosp.rating * 10 * 0.3) +
      (100 - distancePenalty) * 0.3
    )));

    return {
      ...hosp,
      distanceKm: distKm,
      suitabilityScore
    };
  }).filter((hosp) => hosp.distanceKm <= maxRadiusKm);

  // Sort strictly by distance (nearest first)
  filtered.sort((a, b) => a.distanceKm - b.distanceKm);

  return filtered;
}
