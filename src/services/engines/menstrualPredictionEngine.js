/**
 * AI Menstrual & Ovulation Prediction Engine
 * Analyzes period start dates, cycle lengths, flow levels, and pain scales
 * to calculate fertile windows, ovulation peaks, and hormonal insights.
 */

export class MenstrualPredictionEngine {
  predictCycle(cycleData = {}) {
    const cycleLength = cycleData.cycleLength || 28;
    const periodLength = cycleData.periodLength || 5;
    const currentDay = cycleData.currentDay || 13;
    const lastStartStr = cycleData.lastPeriodStart || '2026-07-26';

    const lastStartDate = new Date(lastStartStr);
    
    // Calculate Next Period Date
    const nextPeriodDate = new Date(lastStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    // Ovulation is typically 14 days before next period
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    // Fertile Window: Ovulation - 5 days to Ovulation + 1 day
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    // Determine Current Phase
    let phase = 'Follicular Phase';
    let chanceOfPregnancy = 'Low';

    if (currentDay >= 1 && currentDay <= periodLength) {
      phase = 'Menstrual Phase';
      chanceOfPregnancy = 'Very Low';
    } else if (currentDay > periodLength && currentDay < 11) {
      phase = 'Follicular Phase';
      chanceOfPregnancy = 'Moderate';
    } else if (currentDay >= 11 && currentDay <= 16) {
      phase = 'Ovulation Peak / Fertile Window';
      chanceOfPregnancy = 'High Peak';
    } else {
      phase = 'Luteal Phase';
      chanceOfPregnancy = 'Low';
    }

    return {
      currentDay,
      cycleLength,
      phase,
      chanceOfPregnancy,
      nextPeriodFormatted: nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      fertileWindowFormatted: `${fertileStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${fertileEnd.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`,
      ovulationPeakFormatted: ovulationDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      pcosRiskFlag: cycleLength > 35 || cycleLength < 21 ? '⚠️ Irregular Cycle Duration Flagged' : '✓ Normal Regular Cycle'
    };
  }

  evaluateSymptomLog(flow, painLevel, mood, symptoms = []) {
    let comfortAdvice = [];
    if (painLevel >= 6) {
      comfortAdvice.push("Apply a warm heating pad to lower abdomen for 15-20 minutes.");
      comfortAdvice.push("Sip chamomile or ginger tea to relax smooth uterine muscles.");
    }
    if (symptoms.includes('Acne Breakout') || symptoms.includes('Severe Cramps')) {
      comfortAdvice.push("Limit caffeine and refined sugar; increase Magnesium & Zinc intake.");
    }

    return {
      flow,
      painLevel,
      mood,
      loggedSymptoms: symptoms,
      comfortAdvice
    };
  }
}

export const menstrualPredictionEngine = new MenstrualPredictionEngine();
