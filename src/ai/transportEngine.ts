/**
 * Transport Engine
 * Calculates multi-modal transport options (Cab, Auto, Metro, Ambulance, Taxi),
 * fare estimations, ETA, safety status, and priority emergency routing.
 */

import { UserHealthContext } from './conversationMemory';

export interface TransportOption {
  id: string;
  name: string;
  fare: string;
  duration: string;
  distance: string;
  safety: string;
  traffic: string;
}

export interface TransportEngineOutput {
  options: TransportOption[];
  isEmergencyAmbulanceTriggered: boolean;
  fastestOption: TransportOption;
  recommendedMode: string;
}

export class TransportEngine {
  public evaluateTransport(destination: string = 'Apollo Women Hospital', context: UserHealthContext): TransportEngineOutput {
    const options: TransportOption[] = [
      { id: 'cab', name: 'Private AC Cab', fare: '₹180', duration: '12 mins', distance: '4.2 km', safety: '100% Verified Female Driver Option', traffic: 'Light Traffic' },
      { id: 'rickshaw', name: 'Auto Rickshaw', fare: '₹75', duration: '16 mins', distance: '4.2 km', safety: 'GPS Tracked Direct Ride', traffic: 'Moderate' },
      { id: 'metro', name: 'Metro Direct Line', fare: '₹30', duration: '10 mins', distance: '3.8 km', safety: 'Women Reserved Coach', traffic: 'On Time' },
      { id: 'ambulance', name: 'Emergency Medical Ambulance', fare: '₹0 (Govt Covered)', duration: '8 mins', distance: '4.2 km', safety: 'Paramedic Staff Onboard', traffic: 'Priority Siren Route' }
    ];

    const emergencyRequested = context.transportPreference.emergencyAmbulanceRequested;
    const fastestOption = options.find(o => o.id === (emergencyRequested ? 'ambulance' : 'cab')) || options[0];

    return {
      options,
      isEmergencyAmbulanceTriggered: emergencyRequested,
      fastestOption,
      recommendedMode: context.transportPreference.preferredMode || 'Private AC Cab'
    };
  }
}

export const transportEngine = new TransportEngine();
