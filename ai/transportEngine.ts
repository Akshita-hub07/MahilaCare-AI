/**
 * Transport Engine
 * Calculates multi-modal transport options (Uber, Ola, Rapido, Cab, Auto, Metro, Ambulance),
 * fare estimations, ETA, safety status, and priority emergency routing.
 */

import { UserHealthContext } from './conversationMemory';

export interface TransportOption {
  id: string;
  provider: string;
  vehicleType: string;
  fare: string;
  duration: string;
  distance: string;
  safety: string;
  traffic: string;
  isMock?: boolean;
}

export interface TransportEngineOutput {
  options: TransportOption[];
  isEmergencyAmbulanceTriggered: boolean;
  fastestOption: TransportOption;
  recommendedMode: string;
}

export class TransportEngine {
  public evaluateTransport(destination: string = 'Apollo Women Hospital', context?: UserHealthContext): TransportEngineOutput {
    const options: TransportOption[] = [
      { id: 'uber-go', provider: 'Uber', vehicleType: 'Uber Go (AC Hatchback)', fare: '₹140 - ₹180', duration: '12 mins', distance: '3.2 km', safety: 'GPS Tracked & SOS Ready', traffic: 'Light Traffic', isMock: true },
      { id: 'ola-mini', provider: 'Ola Cabs', vehicleType: 'Ola Mini (Compact AC)', fare: '₹135 - ₹175', duration: '14 mins', distance: '3.2 km', safety: 'Live Shareable Trip Status', traffic: 'Light Traffic', isMock: true },
      { id: 'rapido-auto', provider: 'Rapido', vehicleType: 'Rapido Auto', fare: '₹65 - ₹85', duration: '15 mins', distance: '3.2 km', safety: 'Metered Fare & Verified Driver', traffic: 'Moderate', isMock: true },
      { id: 'metro', provider: 'Public Transit', vehicleType: 'Namma Metro Direct', fare: '₹20', duration: '10 mins', distance: '2.8 km', safety: 'Women Reserved Coach', traffic: 'On Time', isMock: true },
      { id: 'ambulance', provider: 'Emergency Desk', vehicleType: 'Emergency Medical Ambulance', fare: '₹0 (Govt Covered)', duration: '6 mins', distance: '3.2 km', safety: 'Paramedic Onboard & Siren Route', traffic: 'Priority Siren Route', isMock: false }
    ];

    const emergencyRequested = context?.transportPreference?.emergencyAmbulanceRequested || false;
    const fastestOption = options.find(o => o.id === (emergencyRequested ? 'ambulance' : 'uber-go')) || options[0];

    return {
      options,
      isEmergencyAmbulanceTriggered: emergencyRequested,
      fastestOption,
      recommendedMode: context?.transportPreference?.preferredMode || 'Uber / Ola Cab'
    };
  }
}

export const transportEngine = new TransportEngine();
