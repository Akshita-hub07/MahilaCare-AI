/**
 * Hospital Ranking Engine
 * Multi-criteria decision matrix scoring hospitals based on female-friendly infrastructure,
 * distance radius, waiting times, ratings, and home sample collection.
 */

import type { UserHealthContext } from './conversationMemory';

export interface HospitalRecord {
  id: number;
  name: string;
  image?: string;
  distance: string;
  address: string;
  status: string;
  specialties: string[];
  femaleFriendly: boolean;
  homeDiagnosis: boolean;
  rating: number;
  reviews: number;
  waitingTime: string;
  consultFee: string;
  suitabilityScore?: number;
  aiReasoning?: string;
}

export class HospitalRankingEngine {
  public rankHospitals(hospitals: HospitalRecord[], context: UserHealthContext): HospitalRecord[] {
    return hospitals.map((h) => {
      let score = 75;
      const reasons: string[] = [];

      if (h.femaleFriendly) {
        score += 10;
        reasons.push("100% Female-friendly facility with female gynecologists available");
      } else if (context.femaleDoctorsOnly) {
        score -= 10;
      }

      if (h.homeDiagnosis) {
        score += 5;
        reasons.push("Doorstep home diagnostic sample pickup available");
      }

      const dist = parseFloat(h.distance || '5');
      if (dist <= 3) {
        score += 8;
        reasons.push(`Close proximity (${h.distance})`);
      } else if (dist <= 6) {
        score += 4;
        reasons.push(`Convenient distance (${h.distance})`);
      }

      if (h.rating >= 4.8) {
        score += 6;
        reasons.push(`High patient rating (${h.rating}⭐)`);
      }

      if (h.waitingTime && (h.waitingTime.includes('10') || h.waitingTime.includes('15'))) {
        score += 3;
        reasons.push(`Short queue waiting time (~${h.waitingTime})`);
      }

      const finalScore = Math.min(score, 99);

      return {
        ...h,
        suitabilityScore: finalScore,
        aiReasoning: `Ranked #${h.id} (${finalScore}% match): ${reasons.join('; ')}.`
      };
    }).sort((a, b) => (b.suitabilityScore || 0) - (a.suitabilityScore || 0));
  }
}

export const hospitalRankingEngine = new HospitalRankingEngine();
