/**
 * State store and persistent local storage synchronization
 * Handles user preferences, sustainability actions, community reports, alerts, and challenges
 */

export interface UserPreferences {
  wakeUpTime: string; // e.g. "06:30"
  workSchedule: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  exerciseSchedule: {
    time: string;  // "07:00"
    type: 'outdoor-running' | 'cycling' | 'walking' | 'indoor-gym' | 'yoga';
    durationMinutes: number;
  };
  commuteMode: 'metro' | 'bus' | 'bicycle' | 'carpool' | 'personal-car' | 'two-wheeler';
  commuteDurationMinutes: number;
  sensitivityProfile: 'healthy-adult' | 'sensitive-asthma' | 'elderly' | 'child' | 'cardiac-condition';
  notifyAQIThreshold: number; // default 150
  enableBrowserNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // e.g. "22:00"
    end: string;   // e.g. "07:00"
  };
}

export interface EcoAction {
  id: string;
  type: 'walking' | 'cycling' | 'public_transit' | 'carpooling' | 'avoided_idling' | 'tree_planted' | 'clean_commute';
  title: string;
  distanceKm?: number;
  estimatedCo2SavedKg: number; // Transparent estimate
  ecoPoints: number;
  timestamp: string;
  notes?: string;
}

export interface CommunityReport {
  id: string;
  category: 'visible_smoke' | 'road_dust' | 'garbage_burning' | 'construction_dust' | 'industrial_plume' | 'other';
  title: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'hazardous';
  reportedAt: string;
  upvotes: number;
  isVerified: boolean; // Must always be explicitly marked as citizen report
  verificationStatus: 'unverified' | 'under_review' | 'verified' | 'resolved';
  imageUrl?: string;
}

export interface AQIAlert {
  id: string;
  locationName: string;
  aqi: number;
  category: string;
  dominantPollutant: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface GreenChallenge {
  id: string;
  title: string;
  category: 'transit' | 'active_travel' | 'idling' | 'community';
  description: string;
  targetDays: number;
  currentProgress: number;
  ecoPoints: number;
  co2TargetKg: number;
  badgeName: string;
  badgeIcon: string;
  isJoined: boolean;
  isCompleted: boolean;
  expiresAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  wakeUpTime: '06:30',
  workSchedule: {
    start: '09:00',
    end: '18:00',
  },
  exerciseSchedule: {
    time: '07:00',
    type: 'outdoor-running',
    durationMinutes: 45,
  },
  commuteMode: 'metro',
  commuteDurationMinutes: 35,
  sensitivityProfile: 'healthy-adult',
  notifyAQIThreshold: 150,
  enableBrowserNotifications: false,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
};

// Initial community citizen reports for demonstration and hotspot mapping
export const INITIAL_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    category: 'garbage_burning',
    title: 'Open municipal plastic burning near bypass',
    description: 'Thick pungent smoke billowing across the residential colony from early morning waste disposal.',
    locationName: 'Ghazipur Border, Delhi',
    latitude: 28.6258,
    longitude: 77.3292,
    severity: 'hazardous',
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    upvotes: 24,
    isVerified: false,
    verificationStatus: 'under_review',
  },
  {
    id: 'rep-2',
    category: 'construction_dust',
    title: 'Uncovered aggregate demolition without water misting',
    description: 'High suspended particulate matter from flyover expansion without wind barriers or green tarpaulins.',
    locationName: 'Outer Ring Road, Bengaluru',
    latitude: 12.9352,
    longitude: 77.6946,
    severity: 'high',
    reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    upvotes: 18,
    isVerified: true,
    verificationStatus: 'verified',
  },
  {
    id: 'rep-3',
    category: 'road_dust',
    title: 'Unpaved road shoulder heavy silt dispersal',
    description: 'Fast-moving vehicular traffic is generating huge clouds of inhalable dust along the service lane.',
    locationName: 'Western Express Highway, Goregaon, Mumbai',
    latitude: 19.1663,
    longitude: 72.8526,
    severity: 'medium',
    reportedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    upvotes: 9,
    isVerified: false,
    verificationStatus: 'unverified',
  },
  {
    id: 'rep-4',
    category: 'industrial_plume',
    title: 'Smokestack emissions during night thermal inversion',
    description: 'Sulfurous smell and grey particulate cloud noted across industrial corridor sector.',
    locationName: 'Peenya Industrial Area, Bengaluru',
    latitude: 13.0315,
    longitude: 77.5186,
    severity: 'high',
    reportedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    upvotes: 31,
    isVerified: true,
    verificationStatus: 'resolved',
  },
  {
    id: 'rep-5',
    category: 'visible_smoke',
    title: 'Freight transit corridor heavy diesel exhaust',
    description: 'Stationary diesel trucks idling for hours at interstate checkpoint causing severe local soot build-up.',
    locationName: 'Hebbal Flyover Junction, Bengaluru',
    latitude: 13.0358,
    longitude: 77.5970,
    severity: 'medium',
    reportedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    upvotes: 14,
    isVerified: false,
    verificationStatus: 'unverified',
  },
];

// Initial eco actions
export const INITIAL_ECO_ACTIONS: EcoAction[] = [
  {
    id: 'act-1',
    type: 'public_transit',
    title: 'Metro commute to business hub',
    distanceKm: 14,
    estimatedCo2SavedKg: 2.5,
    ecoPoints: 40,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Took Blue Line instead of solo cab',
  },
  {
    id: 'act-2',
    type: 'cycling',
    title: 'Evening errands by cycle',
    distanceKm: 3.5,
    estimatedCo2SavedKg: 0.7,
    ecoPoints: 25,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    notes: 'Clean zero-tailpipe transportation',
  },
  {
    id: 'act-3',
    type: 'avoided_idling',
    title: 'Turned off vehicle engine at 3 long red signals',
    estimatedCo2SavedKg: 0.3,
    ecoPoints: 15,
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    notes: 'Prevented unnecessary hotspot idling',
  },
];

// Initial environmental alerts for notifications center
export const INITIAL_ALERTS: AQIAlert[] = [
  {
    id: 'alert-1',
    locationName: 'Electronic City, Bengaluru',
    aqi: 168,
    category: 'Moderate',
    dominantPollutant: 'PM2.5',
    message: 'Particulate matter crossed your 150 AQI threshold. Sensitive groups should wear an N95 mask.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: false,
    severity: 'warning',
  },
  {
    id: 'alert-2',
    locationName: 'Home (Bengaluru)',
    aqi: 72,
    category: 'Satisfactory',
    dominantPollutant: 'PM10',
    message: 'Air quality improved to Satisfactory. Ideal window for outdoor activities.',
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    read: true,
    severity: 'info',
  },
  {
    id: 'alert-3',
    locationName: 'Outer Ring Road, Bengaluru',
    aqi: 224,
    category: 'Poor',
    dominantPollutant: 'PM2.5',
    message: 'High traffic congestion generated a severe particulate spike. Indoor workouts advised.',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    read: true,
    severity: 'critical',
  },
];

// Active Green Community Challenges
export const INITIAL_CHALLENGES: GreenChallenge[] = [
  {
    id: 'chal-1',
    title: 'Metro Mile Champions',
    category: 'transit',
    description: 'Take metro or electric rail for at least 4 commutes this week to curb diesel exhaust.',
    targetDays: 4,
    currentProgress: 3,
    ecoPoints: 150,
    co2TargetKg: 8.5,
    badgeName: 'Transit Pioneer',
    badgeIcon: 'Train',
    isJoined: true,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(),
  },
  {
    id: 'chal-2',
    title: 'Zero-Emission 20K Stride',
    category: 'active_travel',
    description: 'Walk or cycle for neighborhood errands under 3 km instead of taking a motorized vehicle.',
    targetDays: 5,
    currentProgress: 5,
    ecoPoints: 200,
    co2TargetKg: 6.0,
    badgeName: 'Pedal Guardian',
    badgeIcon: 'Bike',
    isJoined: true,
    isCompleted: true,
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 'chal-3',
    title: 'Signal Idling Stopper',
    category: 'idling',
    description: 'Turn off vehicle ignition whenever waiting at traffic junctions longer than 15 seconds.',
    targetDays: 6,
    currentProgress: 2,
    ecoPoints: 100,
    co2TargetKg: 3.2,
    badgeName: 'Clean Intersection',
    badgeIcon: 'ShieldAlert',
    isJoined: false,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 86400000 * 6).toISOString(),
  },
  {
    id: 'chal-4',
    title: 'Citizen Hotspot Sentinel',
    category: 'community',
    description: 'Inspect and report 2 local dust or biomass burning sources to empower neighborhood action.',
    targetDays: 2,
    currentProgress: 1,
    ecoPoints: 120,
    co2TargetKg: 0,
    badgeName: 'Civic Sentinel',
    badgeIcon: 'MapPin',
    isJoined: true,
    isCompleted: false,
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
  },
];
