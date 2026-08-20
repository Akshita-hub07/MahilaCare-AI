/**
 * AI Hospital Ranking & Suitability Scoring Engine
 * Compares healthcare centers based on distance, female-friendly score, privacy, wait times, and user preferences.
 */

export const MOCK_HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'Apollo Women & Child Specialty Hospital',
    type: 'Multi-Specialty Hospital',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600',
    distanceKm: 2.4,
    address: '12th Main Road, Indiranagar, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.9,
    reviewsCount: 480,
    femaleFriendlyScore: 98, // %
    privacyScore: 96, // %
    waitTimeMins: 12,
    homeDiagnosisAvailable: true,
    services: ['Female Gynecologists', 'NICU & Maternity', 'Ultrasound & MRI', 'Doorstep Blood Collection', '24/7 Ambulance'],
    doctorList: ['Dr. Priya Nair (Gynecologist)', 'Dr. Anjali Gupta (Fetal Medicine)'],
    consultFee: 800
  },
  {
    id: 'hosp-2',
    name: 'Cloudnine Maternity & Wellness Hospital',
    type: 'Women & Child Super-Specialty',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    distanceKm: 4.1,
    address: '100 Feet Road, Koramangala, Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.8,
    reviewsCount: 390,
    femaleFriendlyScore: 96,
    privacyScore: 95,
    waitTimeMins: 18,
    homeDiagnosisAvailable: true,
    services: ['PCOS Clinic', 'High-Risk Pregnancy Care', 'Lactation Consultation', 'Home Diagnostics'],
    doctorList: ['Dr. Sunita Reddy (Senior Obstetrician)'],
    consultFee: 1200
  },
  {
    id: 'hosp-3',
    name: 'Nari Wellness & Fertility Clinic',
    type: 'Specialized Women Clinic',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
    distanceKm: 6.8,
    address: '27th Main, HSR Layout, Bengaluru',
    openStatus: 'Closes at 8:00 PM',
    rating: 4.7,
    reviewsCount: 210,
    femaleFriendlyScore: 94,
    privacyScore: 92,
    waitTimeMins: 10,
    homeDiagnosisAvailable: true,
    services: ['Fertility & IVF', 'Hormonal Wellness', 'Preventive Mammography', 'Female Doctors Only'],
    doctorList: ['Dr. Meera Deshmukh (Reproductive Endocrinology)'],
    consultFee: 950
  },
  {
    id: 'hosp-4',
    name: 'Fortis La Femme Hospital',
    type: 'Super-Specialty Hospital',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=600',
    distanceKm: 9.2,
    address: 'Richmond Road, Central Bengaluru',
    openStatus: 'Open 24/7',
    rating: 4.6,
    reviewsCount: 310,
    femaleFriendlyScore: 90,
    privacyScore: 91,
    waitTimeMins: 25,
    homeDiagnosisAvailable: false,
    services: ['Robotic Gynecologic Surgery', 'Oncology', 'Routine OPD'],
    doctorList: ['Dr. Kavita Rao (Gynecologist)'],
    consultFee: 1100
  }
];

export const computeHospitalSuitabilityScore = (hospital, userPreferences = {}) => {
  let score = 70; // Base score

  // 1. Distance suitability (Max 15 points)
  const maxRadiusKm = parseInt(userPreferences.radius, 10) || 10;
  if (hospital.distanceKm <= maxRadiusKm) {
    score += (1 - hospital.distanceKm / maxRadiusKm) * 15;
  } else {
    score -= 10; // Outside radius penalty
  }

  // 2. Female Friendly Infrastructure (Max 15 points)
  score += (hospital.femaleFriendlyScore / 100) * 15;

  // 3. User Preference Alignment
  if (userPreferences.femaleDoctorsOnly && hospital.femaleFriendlyScore >= 92) {
    score += 5;
  }
  if (userPreferences.homeDiagnostics && hospital.homeDiagnosisAvailable) {
    score += 5;
  }

  // 4. Rating & Reviews (Max 10 points)
  score += (hospital.rating / 5) * 10;

  // 5. Waiting Time Factor
  if (hospital.waitTimeMins <= 15) {
    score += 5;
  }

  // Clamp score between 60% and 99%
  const finalPercent = Math.min(99, Math.max(60, Math.round(score)));
  return finalPercent;
};

export const getRankedHospitals = (radiusKm = '10 km', userPreferences = {}) => {
  const radiusNum = parseInt(radiusKm, 10) || 10;

  // Filter within radius
  const filtered = MOCK_HOSPITALS.filter(h => h.distanceKm <= radiusNum + 1.0);

  // Compute suitability scores
  const scored = filtered.map(h => ({
    ...h,
    suitabilityScore: computeHospitalSuitabilityScore(h, { ...userPreferences, radius: radiusKm })
  }));

  // Sort highest suitability score first
  scored.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return scored;
};
