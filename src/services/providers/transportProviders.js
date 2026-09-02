/**
 * Modular Transport Provider Adapters
 * 
 * Each provider (Uber, Ola, Rapido, Ambulance, etc.) is implemented
 * as an independent adapter class conforming to a unified provider interface.
 * 
 * Provider APIs can easily be updated or plugged with live partner APIs
 * without changing any frontend UI code.
 */

import { generateProviderEstimates } from '../../api/transport';

export class BaseTransportProvider {
  constructor(id, name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }

  async fetchEstimates(pickup, destination) {
    throw new Error('fetchEstimates must be implemented by subclass');
  }
}

export class UberProviderAdapter extends BaseTransportProvider {
  constructor() {
    super('uber', 'Uber', '🚗');
  }

  async fetchEstimates(pickup, destination) {
    // In production backend, this calls Uber Rides API /v1.2/estimates/price
    const allEstimates = generateProviderEstimates(pickup, destination);
    return allEstimates.options.filter(o => o.providerId === 'uber');
  }
}

export class OlaProviderAdapter extends BaseTransportProvider {
  constructor() {
    super('ola', 'Ola Cabs', '🛺');
  }

  async fetchEstimates(pickup, destination) {
    // In production backend, this calls Ola API /v1/products
    const allEstimates = generateProviderEstimates(pickup, destination);
    return allEstimates.options.filter(o => o.providerId === 'ola');
  }
}

export class RapidoProviderAdapter extends BaseTransportProvider {
  constructor() {
    super('rapido', 'Rapido', '🏍️');
  }

  async fetchEstimates(pickup, destination) {
    // In production backend, this calls Rapido API /v1/fare-estimates
    const allEstimates = generateProviderEstimates(pickup, destination);
    return allEstimates.options.filter(o => o.providerId === 'rapido');
  }
}

export class EmergencyAmbulanceAdapter extends BaseTransportProvider {
  constructor() {
    super('ambulance', 'Emergency Desk (108)', '🚑');
  }

  async fetchEstimates(pickup, destination) {
    const allEstimates = generateProviderEstimates(pickup, destination);
    return allEstimates.options.filter(o => o.providerId === 'ambulance');
  }
}

export class PublicTransitAdapter extends BaseTransportProvider {
  constructor() {
    super('transit', 'Namma Metro Transit', '🚇');
  }

  async fetchEstimates(pickup, destination) {
    const allEstimates = generateProviderEstimates(pickup, destination);
    return allEstimates.options.filter(o => o.providerId === 'transit');
  }
}

export const registeredProviders = [
  new UberProviderAdapter(),
  new OlaProviderAdapter(),
  new RapidoProviderAdapter(),
  new EmergencyAmbulanceAdapter(),
  new PublicTransitAdapter()
];
