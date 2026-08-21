/**
 * Menstrual Engine
 * Calculates menstrual cycle phases, fertile windows, ovulation peaks,
 * pain scale relief measures, and hormonal irregularity flags.
 */

import type { UserHealthContext } from './conversationMemory';

export interface MenstrualEngineOutput {
  currentDay: number;
  cycleLength: number;
  phase: string;
  chanceOfPregnancy: string;
  nextPeriodFormatted: string;
  fertileWindowFormatted: string;
  ovulationPeakFormatted: string;
  irregularityFlag?: string;
  comfortTips: string[];
}

export class MenstrualEngine {
  public evaluateCycle(context: UserHealthContext): MenstrualEngineOutput {
    const mData = context.menstrualHistory;
    const cycleLength = mData.cycleLength || 28;
    const periodLength = mData.periodLength || 5;
    const currentDay = mData.currentDay || 13;
    const lastStartStr = mData.lastPeriodStart || '2026-07-26';

    const lastStartDate = new Date(lastStartStr);
    const nextPeriodDate = new Date(lastStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

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

    const comfortTips: string[] = [];
    if (mData.painLevel >= 5) {
      comfortTips.push("Apply a warm heat patch or water bag to lower pelvis for 15-20 minutes.");
      comfortTips.push("Sip warm chamomile or ginger tea to reduce uterine muscular spasms.");
    }
    if (mData.symptomsLogged.includes('Severe Cramps') || mData.symptomsLogged.includes('Acne Breakout')) {
      comfortTips.push("Maintain a low glycemic index diet and increase Magnesium & Zinc intake.");
    }

    return {
      currentDay,
      cycleLength,
      phase,
      chanceOfPregnancy,
      nextPeriodFormatted: nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      fertileWindowFormatted: `${fertileStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${fertileEnd.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`,
      ovulationPeakFormatted: ovulationDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      irregularityFlag: cycleLength > 35 || cycleLength < 21 ? '⚠️ Irregular Cycle Duration Flagged (PCOS/Thyroid Evaluation Advised)' : undefined,
      comfortTips
    };
  }
}

export const menstrualEngine = new MenstrualEngine();
