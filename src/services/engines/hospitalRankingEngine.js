/**
 * AI Hospital Ranking & Suitability Scoring Engine
 * Evaluates nearby healthcare providers using a multi-criteria decision matrix.
 */

export class HospitalRankingEngine {
  rankHospitals(hospitals, userLocation = 'Current Location', symptomsQuery = '', userProfile = {}) {
    return hospitals.map((hospital) => {
      let suitabilityScore = 75;
      const reasons = [];

      // 1. Female-Friendly Infrastructure Scoring
      if (hospital.femaleFriendly) {
        suitabilityScore += 10;
        reasons.push("100% Female-friendly facility with female gynecologists available");
      } else if (userProfile.femaleDoctorsOnly) {
        suitabilityScore -= 10;
      }

      // 2. Home Sample Collection
      if (hospital.homeDiagnosis) {
        suitabilityScore += 5;
        reasons.push("Doorstep home diagnostic sample pickup available");
      }

      // 3. Proximity Scoring
      const dist = parseFloat(hospital.distance || '5');
      if (dist <= 3) {
        suitabilityScore += 8;
        reasons.push(`Close proximity (${hospital.distance})`);
      } else if (dist <= 6) {
        suitabilityScore += 4;
        reasons.push(`Convenient distance (${hospital.distance})`);
      }

      // 4. Rating & Patient Reviews
      if (hospital.rating >= 4.8) {
        suitabilityScore += 6;
        reasons.push(`High patient rating (${hospital.rating}⭐)`);
      }

      // 5. Short Waiting Time
      if (hospital.waitingTime && hospital.waitingTime.includes('10') || hospital.waitingTime.includes('15')) {
        suitabilityScore += 3;
        reasons.push(`Short queue waiting time (~${hospital.waitingTime})`);
      }

      const finalScore = Math.min(suitabilityScore, 99);

      return {
        ...hospital,
        suitabilityScore: finalScore,
        aiReasoning: `Ranked #${hospital.id} because: ${reasons.join('; ')}.`
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
}

export const hospitalRankingEngine = new HospitalRankingEngine();
