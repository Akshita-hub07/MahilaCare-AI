/**
 * AI Pregnancy Companion Engine
 * Calculates gestational milestone benchmarks, fetal size analogies,
 * maternal vitals tracking, and trimester guidance.
 */

export class PregnancyCompanionEngine {
  evaluatePregnancy(pregnancyDetails = {}) {
    const week = pregnancyDetails.week || 16;
    const trimester = week <= 12 ? 1 : week <= 27 ? 2 : 3;

    const sizeAnalogies = {
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

    const babySize = sizeAnalogies[Math.floor(week / 4) * 4] || "Avocado 🥑";

    const milestoneGuidance = [];
    if (trimester === 1) {
      milestoneGuidance.push("Folic Acid Supplementation is crucial for neural tube development.");
      milestoneGuidance.push("Schedule your NT scan between weeks 11-13.");
    } else if (trimester === 2) {
      milestoneGuidance.push("Schedule your Anomaly Scan between weeks 18-22.");
      milestoneGuidance.push("Monitor fetal movement kick counts daily after week 20.");
      milestoneGuidance.push("Maintain side-sleeping posture (left side preferred).");
    } else {
      milestoneGuidance.push("Prepare hospital bag and review birth plan with your obstetrician.");
      milestoneGuidance.push("Track fetal movement: Aim for 10 kicks within 2 hours.");
    }

    return {
      week,
      trimester,
      babySize,
      dueDate: pregnancyDetails.dueDate || '2027-01-15',
      milestoneGuidance,
      kicksEvaluated: pregnancyDetails.kicksToday || 8
    };
  }

  evaluateVitals(weight, bloodPressure, bloodSugar) {
    const alerts = [];
    if (bloodPressure && bloodPressure.includes('/')) {
      const sys = parseInt(bloodPressure.split('/')[0]);
      if (sys > 130) alerts.push("⚠️ Elevated Systolic Blood Pressure - Flag for Preeclampsia screening.");
    }
    if (bloodSugar) {
      const sugar = parseInt(bloodSugar);
      if (sugar > 95) alerts.push("⚠️ Fasting Blood Sugar above 95 mg/dL - Gestational Diabetes evaluation recommended.");
    }

    return {
      weight,
      bloodPressure,
      bloodSugar,
      alerts
    };
  }
}

export const pregnancyCompanionEngine = new PregnancyCompanionEngine();
