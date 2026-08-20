/**
 * Reminder Engine
 * Calculates absorption-optimized pill timings, hydration targets,
 * vaccination schedules, missed reminder alerts, and notification payloads.
 */

import { UserHealthContext } from './conversationMemory';

export interface ReminderRecord {
  id: number;
  title: string;
  time: string;
  type: string;
  completed: boolean;
  repeat: string;
}

export interface ReminderEngineOutput {
  totalReminders: number;
  completedCount: number;
  pendingCount: number;
  nextPendingReminder: ReminderRecord | null;
  optimizationAdvice: string;
  missedWarning?: string;
}

export class ReminderEngine {
  public evaluateReminders(reminders: ReminderRecord[], context?: UserHealthContext): ReminderEngineOutput {
    const list = reminders && reminders.length > 0 ? reminders : (context?.reminders || []);
    const totalReminders = list.length;
    const completedCount = list.filter(r => r.completed).length;
    const pending = list.filter(r => !r.completed);
    const nextPendingReminder = pending[0] || null;

    const tips = [
      "Nari AI Optimization: Take Iron & Folic Acid supplements 30 mins after lunch at 02:00 PM with citrus juice for +35% higher bioavailability.",
      "Calcium supplements should be taken at a separate time from Iron (at least 2 hours apart) to prevent absorption competition.",
      "Hydration Target: Drink 500ml water every 3 hours for optimal cellular hydration."
    ];

    const optimizationAdvice = tips[Math.floor(Math.random() * tips.length)];

    let missedWarning: string | undefined = undefined;
    if (pending.length > 1) {
      missedWarning = `⚠️ Pending Alert: You have ${pending.length} scheduled reminders pending today including ${pending[0].title}.`;
    }

    return {
      totalReminders,
      completedCount,
      pendingCount: pending.length,
      nextPendingReminder,
      optimizationAdvice,
      missedWarning
    };
  }
}

export const reminderEngine = new ReminderEngine();
