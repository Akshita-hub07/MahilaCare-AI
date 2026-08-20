/**
 * Action Handler Module
 * Evaluates intent analysis and engine outputs to construct actionable UI triggers
 * (Navigation, Language Switches, Appointment Booking, Emergency Modals, Report Explanations).
 */

import { StructuredIntentOutput } from './intentDetector';
import { UserHealthContext } from './conversationMemory';

export type ActionType =
  | 'NAVIGATE'
  | 'OPEN_HOSPITAL'
  | 'BOOK_APPOINTMENT'
  | 'OPEN_TRANSPORT'
  | 'OPEN_REPORT'
  | 'OPEN_MENSTRUAL_CARE'
  | 'OPEN_PREGNANCY'
  | 'CREATE_REMINDER'
  | 'ASK_FOLLOWUP'
  | 'SHOW_EMERGENCY_GUIDANCE'
  | 'SWITCH_LANGUAGE';

export interface ActionPayload {
  type: ActionType;
  destination?: string;
  payload?: Record<string, any>;
  displayText?: string;
}

export class ActionHandler {
  public determineAction(
    intentData: StructuredIntentOutput,
    engineResults: Record<string, any>,
    context: UserHealthContext
  ): ActionPayload | undefined {

    // 1. Emergency Action Priority
    if (intentData.primaryIntent === 'Emergency' || engineResults.safety?.isEmergency) {
      return {
        type: 'SHOW_EMERGENCY_GUIDANCE',
        destination: '/nearby',
        payload: {
          isEmergency: true,
          ambulanceRequested: true,
          redFlags: engineResults.safety?.redFlags || []
        },
        displayText: "Triggering Emergency Healthcare Assistance & Nearby Ambulances..."
      };
    }

    // 2. Language Switch Action
    if (intentData.languageTarget) {
      return {
        type: 'SWITCH_LANGUAGE',
        payload: { targetLanguage: intentData.languageTarget },
        displayText: `Switching application language to ${intentData.languageTarget.toUpperCase()}...`
      };
    }

    // 3. Navigation Intent Actions
    if (intentData.navigationTarget) {
      return {
        type: 'NAVIGATE',
        destination: intentData.navigationTarget,
        displayText: `Navigating to ${intentData.navigationTarget}...`
      };
    }

    // 4. Booking Action (e.g. "Book an appointment with the doctor I was viewing")
    if (intentData.primaryIntent === 'Appointment Booking' || intentData.requestedAction === 'BOOK_ACTIVE_DOCTOR') {
      const activeDoctor = context.activeState.activeDoctorInView || { id: 1, name: 'Dr. Priya Nair', hospital: 'Apollo Women Healthcare Center' };
      return {
        type: 'BOOK_APPOINTMENT',
        destination: '/nearby',
        payload: { doctor: activeDoctor },
        displayText: `Initiating appointment booking with ${activeDoctor.name}...`
      };
    }

    // 5. Domain Specific Page Actions & Feature Navigation Triggers
    if (intentData.requestedAction === 'OPEN_MENSTRUAL' || intentData.primaryIntent === 'Menstrual Care') {
      return {
        type: 'OPEN_MENSTRUAL_CARE',
        destination: '/menstrual',
        displayText: 'Opening Menstrual Care...'
      };
    }

    if (intentData.requestedAction === 'OPEN_PREGNANCY' || intentData.primaryIntent === 'Pregnancy') {
      return {
        type: 'OPEN_PREGNANCY',
        destination: '/pregnancy',
        displayText: 'Opening Pregnancy Companion...'
      };
    }

    if (intentData.requestedAction === 'OPEN_REPORT' || intentData.primaryIntent === 'Report Upload') {
      return {
        type: 'OPEN_REPORT',
        destination: '/timeline',
        displayText: 'Opening Digital Health Vault...'
      };
    }

    if (intentData.requestedAction === 'OPEN_HOSPITALS' || intentData.primaryIntent === 'Hospital Recommendation') {
      return {
        type: 'OPEN_HOSPITALS',
        destination: '/nearby',
        displayText: 'Opening Nearby Healthcare...'
      };
    }

    if (intentData.requestedAction === 'OPEN_EDUCATION' || intentData.primaryIntent === 'Health Education') {
      return {
        type: 'OPEN_EDUCATION',
        destination: '/education',
        displayText: 'Opening Health Education...'
      };
    }

    if (intentData.primaryIntent === 'Transport Assistance') {
      return {
        type: 'OPEN_TRANSPORT',
        destination: '/nearby',
        displayText: 'Opening Transport Assistance...'
      };
    }

    return undefined;
  }
}

export const actionHandler = new ActionHandler();
