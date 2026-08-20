/**
 * Pregnancy Engine
 * Evaluates gestational benchmarks, fetal development size analogies,
 * trimester milestones, maternal vitals alerts, and kick count activity.
 */

import type { UserHealthContext } from './conversationMemory.ts';

export interface PregnancyEngineOutput {
  enabled: boolean;
  week: number;
  trimester: number;
  babySizeAnalogy: string;
  dueDate: string;
  milestones: string[];
  kicksToday: number;
  kickStatusAlert?: string;
  vitalsAlerts: string[];
}

export class PregnancyEngine {
  public evaluatePregnancy(context: UserHealthContext): PregnancyEngineOutput {
    const pDetails = context.pregnancyDetails;
    const week = pDetails.week || 16;
    const trimester = week <= 12 ? 1 : week <= 27 ? 2 : 3;

    const sizeMap: Record<number, string> = {
      4: "Poppy Seed 🌾",
      8: "Raspberry 🫐",
      12: "Lime 🍋",
      16: "Avocado 🥑",
      20: "Banana 🍌",
      24: "Cantaloupe 🍈",
      28: "Eggplant 🍆",
      32: "Squash 🎃",
      36: "Honeydew Melon 🍈",
      40: "Watermelon 🍉"
    };

    const bucket = Math.floor(week / 4) * 4;
    const babySizeAnalogy = sizeMap[bucket] || "Avocado 🥑";

    const milestones: string[] = [];
    if (trimester === 1) {
      milestones.push("Daily Folic Acid supplementation for neural tube development.");
      milestones.push("Schedule NT Ultrasound scan between weeks 11-13.");
    } else if (trimester === 2) {
      milestones.push("Schedule Anomaly Ultrasound scan between weeks 18-22.");
      milestones.push("Daily fetal movement kick count monitoring after week 20.");
      milestones.push("Adopt left-side sleeping posture for optimal placental blood flow.");
    } else {
      milestones.push("Prepare hospital maternity bag & review birth plan.");
      milestones.push("Track fetal kick counts: Aim for 10 movements within 2 hours.");
    }

    const vitalsAlerts: string[] = [];
    if (pDetails.bloodPressure && pDetails.bloodPressure.includes('/')) {
      const sys = parseInt(pDetails.bloodPressure.split('/')[0]);
      if (sys > 130) vitalsAlerts.push("⚠️ Elevated Systolic Blood Pressure - Preeclampsia screening advised.");
    }
    if (pDetails.bloodSugar) {
      const sugar = parseInt(pDetails.bloodSugar);
      if (sugar > 95) vitalsAlerts.push("⚠️ Fasting Blood Sugar > 95 mg/dL - Gestational diabetes check advised.");
    }

    let kickStatusAlert: string | undefined = undefined;
    if (pDetails.kicksToday < 5 && week >= 24) {
      kickStatusAlert = "⚠️ Low Kick Count Warning: Fewer than 5 kicks logged today. Try drinking cold water or resting on left side.";
    }

    return {
      enabled: pDetails.enabled,
      week,
      trimester,
      babySizeAnalogy,
      dueDate: pDetails.dueDate,
      milestones,
      kicksToday: pDetails.kicksToday,
      kickStatusAlert,
      vitalsAlerts
    };
  }
}

export const pregnancyEngine = new PregnancyEngine();
