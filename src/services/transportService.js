/**
 * Transport Service Layer for MahilaCare AI (MahilaCare AI)
 * 
 * Architecture:
 * MahilaCare UI -> Transport Service Layer -> Serverless API / Provider Adapters -> Uber / Ola / Rapido / Ambulance / Transit APIs
 * 
 * Features:
 * - Geolocation acquisition with graceful manual input fallback
 * - Healthcare destination search & auto-fill
 * - Real-time comparison across Uber, Ola, Rapido, Emergency Ambulance & Transit
 * - Safety protocols (SOS hotline, Live status sharing, Driver background verification badge)
 * - Safe mock/demo ride confirmation flow without exposing private API keys.
 */

import { generateProviderEstimates } from '../api/transport';
import { registeredProviders } from './providers/transportProviders';

export const DEFAULT_PICKUP = {
  name: 'Current Location (Indiranagar, Bengaluru)',
  lat: 12.9716,
  lng: 77.5946
};

export const POPULAR_HEALTHCARE_DESTINATIONS = [
  { id: 'apollo-women', name: 'Apollo Women & Child Hospital', area: 'Jayanagar', distance: '3.2 km', lat: 12.9299, lng: 77.5824, type: 'Hospital' },
  { id: 'fortis-la-femme', name: 'Fortis La Femme Speciality Center', area: 'Richmond Town', distance: '4.5 km', lat: 12.9611, lng: 77.6012, type: 'Hospital' },
  { id: 'cloudnine-care', name: 'Cloudnine Maternity & Gynecological Hospital', area: 'Old Airport Road', distance: '2.8 km', lat: 12.9568, lng: 77.6482, type: 'Maternity Clinic' },
  { id: 'manipal-hospital', name: 'Manipal Hospital Women Unit', area: 'HAL Airport Road', distance: '5.1 km', lat: 12.9582, lng: 77.6508, type: 'Multi-Speciality Hospital' },
  { id: 'srl-diagnostics', name: 'MahilaCare Partner Diagnostic Center', area: 'Koramangala', distance: '3.8 km', lat: 12.9352, lng: 77.6245, type: 'Diagnostic Center' },
  { id: 'st-johns-med', name: "St. John's Medical College & Hospital", area: 'Sarjapur Road', distance: '6.2 km', lat: 12.9281, lng: 77.6189, type: 'Medical Center' }
];

export class TransportService {
  /**
   * Fetches user's current browser location
   */
  async getUserCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ ...DEFAULT_PICKUP, isGeolocated: false });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            name: `Live GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isGeolocated: true
          });
        },
        () => {
          // Permission denied or position unavailable fallback
          resolve({ ...DEFAULT_PICKUP, isGeolocated: false });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Generates aggregated transport estimates across providers
   */
  async getTransportOptions(pickup = DEFAULT_PICKUP, destination = POPULAR_HEALTHCARE_DESTINATIONS[0]) {
    try {
      const result = generateProviderEstimates(pickup, destination);
      return {
        success: true,
        pickup: result.pickup,
        destination: result.destination,
        distanceKm: result.distanceKm,
        options: result.options
      };
    } catch (error) {
      console.warn('Transport options generation error:', error);
      return {
        success: false,
        error: error.message,
        options: []
      };
    }
  }

  /**
   * Simulates booking a transport option and generating confirmation payload
   */
  async bookRide(option, pickup, destination) {
    const destName = typeof destination === 'string' ? destination : (destination?.name || 'Healthcare Center');

    return {
      bookingId: `RIDE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      provider: option.provider,
      vehicleType: option.vehicleType,
      estimatedFare: option.estimatedFare,
      pickupName: pickup?.name || 'Current Location',
      destinationName: destName,
      status: 'Redirecting to Provider App',
      timestamp: new Date().toLocaleTimeString(),
      category: option.category,
      deepLink: option.deepLink
    };
  }

  /**
   * Returns registered ride providers metadata
   */
  getRegisteredProviders() {
    return registeredProviders;
  }
}

export const transportService = new TransportService();
