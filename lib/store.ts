/**
 * State store and persistent local storage synchronization
 * Handles user preferences, sustainability actions, and community reports
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
  notifyAQIThreshold: number; // default 200
}

export interface EcoAction {
  id: string;
  type: 'walking' | 'cycling' | 'public_transit' | 'carpooling' | 'avoided_idling' | 'tree_planted';
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
};

// Initial community citizen reports for demonstration
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
    isVerified: false,
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
