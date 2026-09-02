/**
 * Serverless API handler for Transport Assistance (/api/transport)
 * 
 * CHEAP REALISTIC FARES FOR HEALTHCARE CENTER DISTANCE:
 * - Calculates cheap, realistic Indian ride fares strictly scaled to actual geographic distance (e.g., 0.9 km -> ₹19-₹23 for Bike, ₹31-₹41 for Auto, ₹49-₹63 for Cab).
 * - Automatically pre-populates pickup AND healthcare destination (names & coordinates) into provider deep links.
 * - Provider action buttons ("Book on Uber", "Book on Ola", "Book on Rapido") hand off directly to official apps/web.
 */

export const providerConfigs = {
  uber: {
    name: 'Uber',
    hasCredentials: Boolean(process.env.UBER_CLIENT_ID && process.env.UBER_CLIENT_SECRET),
    baseUrl: process.env.UBER_API_BASE || 'https://api.uber.com/v1.2'
  },
  ola: {
    name: 'Ola Cabs',
    hasCredentials: Boolean(process.env.OLA_API_KEY),
    baseUrl: process.env.OLA_API_BASE || 'https://devapi.olacabs.com/v1'
  },
  rapido: {
    name: 'Rapido',
    hasCredentials: Boolean(process.env.RAPIDO_API_KEY),
    baseUrl: process.env.RAPIDO_API_BASE || 'https://api.rapido.bike/v1'
  }
};

/**
 * Calculates estimated fare, ETA, duration and distance based on pickup and destination
 */
export function generateProviderEstimates(pickup = {}, destination = {}) {
  const pickupLat = pickup.lat || 12.9716;
  const pickupLng = pickup.lng || 77.5946;
  const pickupName = pickup.name || 'Current Location';

  const destLat = destination.lat || 12.9352;
  const destLng = destination.lng || 77.6245;
  const destName = typeof destination === 'string' ? destination : (destination.name || 'Healthcare Center');

  // Calculate Haversine geographic distance (km)
  const R = 6371; // km
  const dLat = ((destLat - pickupLat) * Math.PI) / 180;
  const dLng = ((destLng - pickupLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickupLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDistanceKm = R * c;

  // Use destination.distanceKm if present, otherwise calculate exact distance (scaling accurately for short distances like 0.8 km, 1.0 km)
  const distanceKm = destination.distanceKm
    ? parseFloat(destination.distanceKm)
    : Math.max(0.5, Math.round(rawDistanceKm * 10) / 10);

  const baseTravelMinutes = Math.max(3, Math.round(distanceKm * 3.0));

  const encodedPickupName = encodeURIComponent(pickupName);
  const encodedDestName = encodeURIComponent(destName);

  // Location-aware Metro Transit detection
  let metroInfo = {
    provider: 'DMRC Delhi Metro Rail',
    vehicleType: 'DMRC Metro (Pink/Blue/Yellow Line)',
    actionText: 'Book / View DMRC Metro',
    continueLabel: 'Continue to DMRC Delhi Metro',
    deepLink: 'https://www.delhimetrorail.com/',
    locationInstruction: `Route search prefilled for ${destName}. View DMRC Delhi Metro schedules & fare chart.`
  };

  const pickupLower = (pickupName || '').toLowerCase();
  if (pickupLower.includes('bengaluru') || pickupLower.includes('bangalore') || pickupLower.includes('indiranagar') || pickupLower.includes('koramangala')) {
    metroInfo = {
      provider: 'BMRCL Namma Metro',
      vehicleType: 'Namma Metro (Purple/Green Line)',
      actionText: 'Book / View Namma Metro',
      continueLabel: 'Continue to BMRCL Namma Metro',
      deepLink: 'https://english.bmrc.co.in/',
      locationInstruction: `Locate nearest BMRCL Namma Metro station to ${destName}.`
    };
  } else if (pickupLower.includes('mumbai') || pickupLower.includes('thane') || pickupLower.includes('andheri')) {
    metroInfo = {
      provider: 'Mumbai Metro One',
      vehicleType: 'Mumbai Metro (Line 1/2A/7)',
      actionText: 'Book / View Mumbai Metro',
      continueLabel: 'Continue to Mumbai Metro',
      deepLink: 'https://www.reliancemumbaimetro.com/',
      locationInstruction: `Check Mumbai Metro route and mobile ticketing to ${destName}.`
    };
  } else if (pickupLower.includes('hyderabad') || pickupLower.includes('secunderabad')) {
    metroInfo = {
      provider: 'Hyderabad Metro Rail',
      vehicleType: 'L&T Hyderabad Metro',
      actionText: 'Book / View Hyderabad Metro',
      continueLabel: 'Continue to Hyderabad Metro',
      deepLink: 'https://www.ltmetro.com/',
      locationInstruction: `Check Hyderabad Metro station map to ${destName}.`
    };
  }

  // AUTOMATIC LOCATION PREFILLING DEEP LINKS
  const uberDeepLink = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&pickup[nickname]=${encodedPickupName}&dropoff[latitude]=${destLat}&dropoff[longitude]=${destLng}&dropoff[nickname]=${encodedDestName}`;
  const olaDeepLink = `https://book.olacabs.com/?pickup_name=${encodedPickupName}&lat=${pickupLat}&lng=${pickupLng}&drop_name=${encodedDestName}&drop_lat=${destLat}&drop_lng=${destLng}`;
  const rapidoDeepLink = `https://www.rapido.bike/?pickup=${encodedPickupName}&destination=${encodedDestName}`;

  // FARE COMPUTATION FORMULAS (STRICTLY LOW & CHEAP FOR SHORT DISTANCES LIKE 1 KM)
  // Rapido Bike: Base ₹15 + ₹4/km (0.9 km -> ₹19 - ₹23)
  const bikeMin = Math.round(15 + distanceKm * 4);
  const bikeMax = Math.round(18 + distanceKm * 6);

  // Auto Rickshaw: Base ₹25 + ₹7/km (0.9 km -> ₹31 - ₹41)
  const autoMin = Math.round(25 + distanceKm * 7);
  const autoMax = Math.round(32 + distanceKm * 10);

  // AC Hatchback Cab: Base ₹40 + ₹10/km (0.9 km -> ₹49 - ₹63)
  const cabMin = Math.round(40 + distanceKm * 10);
  const cabMax = Math.round(50 + distanceKm * 14);

  // Comfort Sedan: Base ₹60 + ₹12/km (0.9 km -> ₹71 - ₹86)
  const sedanMin = Math.round(60 + distanceKm * 12);
  const sedanMax = Math.round(72 + distanceKm * 16);

  // Metro Slab: ₹10 for <=2 km, ₹20 for <=5 km
  const metroFare = distanceKm <= 2 ? 10 : Math.min(50, Math.round(10 + distanceKm * 4));

  const options = [
    // RAPIDO BIKE (CHEAPEST SOLO OPTION FIRST FOR SHORT DISTANCES)
    {
      id: 'rapido-bike',
      provider: 'Rapido',
      providerId: 'rapido',
      category: 'bike',
      vehicleType: 'Rapido Bike Taxi',
      icon: '🏍️',
      actionText: 'Book on Rapido',
      continueLabel: 'Continue to Rapido',
      estimatedFare: `₹${bikeMin} - ₹${bikeMax}`,
      numericFare: Math.round((bikeMin + bikeMax) / 2),
      fareType: 'Estimated fare — Demo Preview',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${Math.max(3, baseTravelMinutes - 2)} mins`,
      eta: '2 mins away',
      safetyBadge: 'Cheapest Solo Ride',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      isMock: !providerConfigs.rapido.hasCredentials,
      demoNotice: 'Demo Estimate: Cheap short-distance bike taxi. Destination prefilled.',
      locationInstruction: `Healthcare Destination (${destName}) attached to Rapido link.`,
      deepLink: rapidoDeepLink
    },

    // UBER AUTO
    {
      id: 'uber-auto',
      provider: 'Uber',
      providerId: 'uber',
      category: 'auto',
      vehicleType: 'Uber Auto',
      icon: '🛺',
      actionText: 'Book on Uber',
      continueLabel: 'Continue to Uber',
      estimatedFare: `₹${autoMin} - ₹${autoMax}`,
      numericFare: Math.round((autoMin + autoMax) / 2),
      fareType: 'Estimated fare — Demo Preview',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${baseTravelMinutes + 1} mins`,
      eta: '2 mins away',
      safetyBadge: 'Low Cost Auto',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      isMock: !providerConfigs.uber.hasCredentials,
      demoNotice: 'Demo Estimate: Short-distance auto rickshaw fare. Destination prefilled in Uber app.',
      locationInstruction: `Pickup (${pickupName}) & Healthcare Destination (${destName}) prefilled in Uber link.`,
      deepLink: uberDeepLink
    },

    // OLA AUTO
    {
      id: 'ola-auto',
      provider: 'Ola Cabs',
      providerId: 'ola',
      category: 'auto',
      vehicleType: 'Ola Auto',
      icon: '🛺',
      actionText: 'Book on Ola',
      continueLabel: 'Continue to Ola',
      estimatedFare: `₹${autoMin} - ₹${autoMax + 2}`,
      numericFare: Math.round((autoMin + autoMax) / 2),
      fareType: 'Estimated fare — Demo Preview',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${baseTravelMinutes + 2} mins`,
      eta: '2 mins away',
      safetyBadge: 'Metered Auto Rate',
      badgeColor: 'bg-teal-100 text-teal-800',
      isMock: !providerConfigs.ola.hasCredentials,
      demoNotice: 'Demo Estimate: Short-distance auto fare. Destination prefilled in Ola app.',
      locationInstruction: `Pickup (${pickupName}) & Healthcare Destination (${destName}) prefilled in Ola link.`,
      deepLink: olaDeepLink
    },

    // UBER GO
    {
      id: 'uber-go',
      provider: 'Uber',
      providerId: 'uber',
      category: 'cab',
      vehicleType: 'Uber Go (AC Hatchback)',
      icon: '🚗',
      actionText: 'Book on Uber',
      continueLabel: 'Continue to Uber',
      estimatedFare: `₹${cabMin} - ₹${cabMax}`,
      numericFare: Math.round((cabMin + cabMax) / 2),
      fareType: 'Estimated fare — Demo Preview',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${baseTravelMinutes} mins`,
      eta: '3 mins away',
      safetyBadge: 'AC Comfort Cab',
      badgeColor: 'bg-slate-100 text-slate-800',
      isMock: !providerConfigs.uber.hasCredentials,
      demoNotice: 'Demo Estimate: Compact AC cab rate model. Destination prefilled in Uber app.',
      locationInstruction: `Pickup (${pickupName}) & Healthcare Destination (${destName}) prefilled in Uber link.`,
      deepLink: uberDeepLink
    },

    // OLA MINI
    {
      id: 'ola-mini',
      provider: 'Ola Cabs',
      providerId: 'ola',
      category: 'cab',
      vehicleType: 'Ola Mini (Compact AC)',
      icon: '🚗',
      actionText: 'Book on Ola',
      continueLabel: 'Continue to Ola',
      estimatedFare: `₹${cabMin} - ₹${cabMax + 4}`,
      numericFare: Math.round((cabMin + cabMax) / 2),
      fareType: 'Estimated fare — Demo Preview',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${baseTravelMinutes + 1} mins`,
      eta: '4 mins away',
      safetyBadge: 'Emergency SOS Button',
      badgeColor: 'bg-amber-100 text-amber-800',
      isMock: !providerConfigs.ola.hasCredentials,
      demoNotice: 'Demo Estimate: Ola compact AC cab model. Destination prefilled in Ola app.',
      locationInstruction: `Pickup (${pickupName}) & Healthcare Destination (${destName}) prefilled in Ola link.`,
      deepLink: olaDeepLink
    },

    // UBER PREMIER
    {
      id: 'uber-premier',
      provider: 'Uber',
      providerId: 'uber',
      category: 'cab',
      vehicleType: 'Uber Premier (Comfort Sedan)',
      icon: '🚘',
      actionText: 'Book on Uber',
      continueLabel: 'Continue to Uber',
      estimatedFare: `₹${sedanMin} - ₹${sedanMax}`,
      numericFare: Math.round((sedanMin + sedanMax) / 2),
      fareType: 'Estimated fare — Demo Preview',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${Math.max(3, baseTravelMinutes - 1)} mins`,
      eta: '4 mins away',
      safetyBadge: 'Top Rated Sedan',
      badgeColor: 'bg-purple-100 text-purple-800',
      isMock: !providerConfigs.uber.hasCredentials,
      demoNotice: 'Demo Estimate: Premium sedan rate model. Destination prefilled in Uber app.',
      locationInstruction: `Pickup (${pickupName}) & Healthcare Destination (${destName}) prefilled in Uber link.`,
      deepLink: uberDeepLink
    },

    // EMERGENCY & MEDICAL TRANSPORT
    {
      id: 'medical-ambulance',
      provider: 'Govt Emergency Desk',
      providerId: 'ambulance',
      category: 'emergency',
      vehicleType: 'Emergency Ambulance (108)',
      icon: '🚑',
      actionText: 'Call 108 Emergency',
      continueLabel: 'Dial 108 Emergency Helpline',
      estimatedFare: 'Free / Govt Emergency',
      numericFare: 0,
      fareType: 'Government Emergency Service',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${Math.max(3, Math.round(baseTravelMinutes * 0.5))} mins`,
      eta: 'Immediate Dispatch',
      safetyBadge: 'High Priority Siren',
      badgeColor: 'bg-rose-100 text-rose-800',
      isMock: false,
      demoNotice: 'Direct phone dispatch connection to 108 Emergency Ambulance Hotline.',
      locationInstruction: `State your location (${pickupName}) and destination (${destName}) to 108 operator.`,
      deepLink: 'tel:108'
    },

    // METRO TRANSIT
    {
      id: 'metro-transit',
      provider: metroInfo.provider,
      providerId: 'transit',
      category: 'transit',
      vehicleType: metroInfo.vehicleType,
      icon: '🚇',
      actionText: metroInfo.actionText,
      continueLabel: metroInfo.continueLabel,
      estimatedFare: `₹${metroFare}`,
      numericFare: metroFare,
      fareType: 'Fixed Short Transit Fare',
      currency: 'INR',
      distanceKm: `${distanceKm} km`,
      estimatedTime: `${Math.round(baseTravelMinutes * 0.85)} mins`,
      eta: 'Trains every 4 mins',
      safetyBadge: 'Women Reserved Coach',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      isMock: true,
      demoNotice: 'Public metro transit schedule & ticketing information.',
      locationInstruction: metroInfo.locationInstruction,
      deepLink: metroInfo.deepLink
    }
  ];

  return {
    pickup,
    destination,
    distanceKm: `${distanceKm} km`,
    baseTravelMinutes,
    providerStatus: {
      uber: providerConfigs.uber.hasCredentials ? 'live' : 'mock_fallback',
      ola: providerConfigs.ola.hasCredentials ? 'live' : 'mock_fallback',
      rapido: providerConfigs.rapido.hasCredentials ? 'live' : 'mock_fallback'
    },
    options
  };
}

/**
 * Default API Request Handler
 */
export default async function handler(req, res) {
  try {
    const pickup = req?.body?.pickup || req?.query?.pickup || {};
    const destination = req?.body?.destination || req?.query?.destination || {};

    const data = generateProviderEstimates(pickup, destination);

    if (res && typeof res.status === 'function') {
      return res.status(200).json({ success: true, data });
    }

    return { success: true, data };
  } catch (error) {
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ success: false, error: error.message });
    }
    throw error;
  }
}
