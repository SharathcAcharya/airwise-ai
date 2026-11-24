/**
 * AIRWISE AI - Indian National AQI (CPCB) Calculation Engine
 * 
 * Based on official Central Pollution Control Board (CPCB) guidelines.
 * 
 * Sub-index formula:
 *   I_p = [ (I_Hi - I_Lo) / (B_Hi - B_Lo) ] * (C_p - B_Lo) + I_Lo
 * 
 * Breakpoints for 24-hr averages (8-hr for CO and O3):
 * 
 * PM2.5 (µg/m³):
 *   Good: 0 - 30 (AQI 0 - 50)
 *   Satisfactory: 31 - 60 (AQI 51 - 100)
 *   Moderate: 61 - 90 (AQI 101 - 200)
 *   Poor: 91 - 120 (AQI 201 - 300)
 *   Very Poor: 121 - 250 (AQI 301 - 400)
 *   Severe: 250+ (AQI 401 - 500)
 * 
 * PM10 (µg/m³):
 *   Good: 0 - 50 (AQI 0 - 50)
 *   Satisfactory: 51 - 100 (AQI 51 - 100)
 *   Moderate: 101 - 250 (AQI 101 - 200)
 *   Poor: 251 - 350 (AQI 201 - 300)
 *   Very Poor: 351 - 430 (AQI 301 - 400)
 *   Severe: 430+ (AQI 401 - 500)
 * 
 * NO2 (µg/m³):
 *   Good: 0 - 40 (AQI 0 - 50)
 *   Satisfactory: 41 - 80 (AQI 51 - 100)
 *   Moderate: 81 - 180 (AQI 101 - 200)
 *   Poor: 181 - 280 (AQI 201 - 300)
 *   Very Poor: 281 - 400 (AQI 301 - 400)
 *   Severe: 400+ (AQI 401 - 500)
 * 
 * SO2 (µg/m³):
 *   Good: 0 - 40 (AQI 0 - 50)
 *   Satisfactory: 41 - 80 (AQI 51 - 100)
 *   Moderate: 81 - 380 (AQI 101 - 200)
 *   Poor: 381 - 800 (AQI 201 - 300)
 *   Very Poor: 801 - 1600 (AQI 301 - 400)
 *   Severe: 1600+ (AQI 401 - 500)
 * 
 * CO (mg/m³) [Note: if provided in µg/m³, divide by 1000]:
 *   Good: 0.0 - 1.0 (AQI 0 - 50)
 *   Satisfactory: 1.1 - 2.0 (AQI 51 - 100)
 *   Moderate: 2.1 - 10.0 (AQI 101 - 200)
 *   Poor: 10.1 - 17.0 (AQI 201 - 300)
 *   Very Poor: 17.1 - 34.0 (AQI 301 - 400)
 *   Severe: 34.0+ (AQI 401 - 500)
 * 
 * O3 (µg/m³):
 *   Good: 0 - 50 (AQI 0 - 50)
 *   Satisfactory: 51 - 100 (AQI 51 - 100)
 *   Moderate: 101 - 168 (AQI 101 - 200)
 *   Poor: 169 - 208 (AQI 201 - 300)
 *   Very Poor: 209 - 748 (AQI 301 - 400)
 *   Severe: 748+ (AQI 401 - 500)
 * 
 * NH3 (µg/m³):
 *   Good: 0 - 200 (AQI 0 - 50)
 *   Satisfactory: 201 - 400 (AQI 51 - 100)
 *   Moderate: 401 - 800 (AQI 101 - 200)
 *   Poor: 801 - 1200 (AQI 201 - 300)
 *   Very Poor: 1201 - 1800 (AQI 301 - 400)
 *   Severe: 1800+ (AQI 401 - 500)
 * 
 * CPCB COMPOSITE AQI REQUIREMENT:
 * - Minimum of 3 pollutants must be monitored.
 * - At least one of them MUST be PM2.5 or PM10.
 * - Otherwise, composite AQI cannot be reliably formed (insufficient data).
 */

export type PollutantKey = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'nh3';

export type AQICategory = 
  | 'Good' 
  | 'Satisfactory' 
  | 'Moderate' 
  | 'Poor' 
  | 'Very Poor' 
  | 'Severe'
  | 'Unknown';

export interface BreakpointRange {
  bLo: number;
  bHi: number;
  iLo: number;
  iHi: number;
}

export interface SubIndexResult {
  pollutant: PollutantKey;
  value: number; // original unit (PM, NO2, SO2, O3 in µg/m³, CO in mg/m³)
  unit: string;
  subIndex: number | null;
  category: AQICategory;
  isValid: boolean;
  notes?: string;
}

export interface CompositeAQIResult {
  aqi: number | null;
  category: AQICategory;
  dominantPollutant: PollutantKey | null;
  dominantSubIndex: number | null;
  subIndices: Record<PollutantKey, SubIndexResult>;
  isReliable: boolean;
  statusMessage: string;
  validPollutantsCount: number;
  hasParticulateMatter: boolean;
  color: {
    bg: string;
    text: string;
    border: string;
    accent: string;
  };
  healthAdvisory: {
    general: string;
    sensitive: string;
    outdoorActivity: string;
  };
}

export interface RawPollutantInput {
  pm25?: number | null;  // µg/m³
  pm10?: number | null;  // µg/m³
  no2?: number | null;   // µg/m³
  so2?: number | null;   // µg/m³
  co?: number | null;    // mg/m³ (or µg/m³ if flagged)
  coUnit?: 'mg/m3' | 'ug/m3';
  o3?: number | null;    // µg/m³
  nh3?: number | null;   // µg/m³
}

const BREAKPOINTS: Record<PollutantKey, BreakpointRange[]> = {
  pm25: [
    { bLo: 0, bHi: 30, iLo: 0, iHi: 50 },
    { bLo: 31, bHi: 60, iLo: 51, iHi: 100 },
    { bLo: 61, bHi: 90, iLo: 101, iHi: 200 },
    { bLo: 91, bHi: 120, iLo: 201, iHi: 300 },
    { bLo: 121, bHi: 250, iLo: 301, iHi: 400 },
    { bLo: 251, bHi: 500, iLo: 401, iHi: 500 },
  ],
  pm10: [
    { bLo: 0, bHi: 50, iLo: 0, iHi: 50 },
    { bLo: 51, bHi: 100, iLo: 51, iHi: 100 },
    { bLo: 101, bHi: 250, iLo: 101, iHi: 200 },
    { bLo: 251, bHi: 350, iLo: 201, iHi: 300 },
    { bLo: 351, bHi: 430, iLo: 301, iHi: 400 },
    { bLo: 431, bHi: 600, iLo: 401, iHi: 500 },
  ],
  no2: [
    { bLo: 0, bHi: 40, iLo: 0, iHi: 50 },
    { bLo: 41, bHi: 80, iLo: 51, iHi: 100 },
    { bLo: 81, bHi: 180, iLo: 101, iHi: 200 },
    { bLo: 181, bHi: 280, iLo: 201, iHi: 300 },
    { bLo: 281, bHi: 400, iLo: 301, iHi: 400 },
    { bLo: 401, bHi: 600, iLo: 401, iHi: 500 },
  ],
  so2: [
    { bLo: 0, bHi: 40, iLo: 0, iHi: 50 },
    { bLo: 41, bHi: 80, iLo: 51, iHi: 100 },
    { bLo: 81, bHi: 380, iLo: 101, iHi: 200 },
    { bLo: 381, bHi: 800, iLo: 201, iHi: 300 },
    { bLo: 801, bHi: 1600, iLo: 301, iHi: 400 },
    { bLo: 1601, bHi: 2400, iLo: 401, iHi: 500 },
  ],
  co: [
    { bLo: 0.0, bHi: 1.0, iLo: 0, iHi: 50 },
    { bLo: 1.1, bHi: 2.0, iLo: 51, iHi: 100 },
    { bLo: 2.1, bHi: 10.0, iLo: 101, iHi: 200 },
    { bLo: 10.1, bHi: 17.0, iLo: 201, iHi: 300 },
    { bLo: 17.1, bHi: 34.0, iLo: 301, iHi: 400 },
    { bLo: 34.1, bHi: 50.0, iLo: 401, iHi: 500 },
  ],
  o3: [
    { bLo: 0, bHi: 50, iLo: 0, iHi: 50 },
    { bLo: 51, bHi: 100, iLo: 51, iHi: 100 },
    { bLo: 101, bHi: 168, iLo: 101, iHi: 200 },
    { bLo: 169, bHi: 208, iLo: 201, iHi: 300 },
    { bLo: 209, bHi: 748, iLo: 301, iHi: 400 },
    { bLo: 749, bHi: 1000, iLo: 401, iHi: 500 },
  ],
  nh3: [
    { bLo: 0, bHi: 200, iLo: 0, iHi: 50 },
    { bLo: 201, bHi: 400, iLo: 51, iHi: 100 },
    { bLo: 401, bHi: 800, iLo: 101, iHi: 200 },
    { bLo: 801, bHi: 1200, iLo: 201, iHi: 300 },
    { bLo: 1201, bHi: 1800, iLo: 301, iHi: 400 },
    { bLo: 1801, bHi: 2500, iLo: 401, iHi: 500 },
  ],
};

/**
 * Classify AQI number into official CPCB category
 */
export function getAQICategory(aqi: number | null): AQICategory {
  if (aqi === null || isNaN(aqi) || aqi < 0) return 'Unknown';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

/**
 * Color tokens corresponding to CPCB standards
 */
export function getAQIColor(category: AQICategory) {
  switch (category) {
    case 'Good':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        border: 'border-emerald-500',
        accent: '#10b981',
      };
    case 'Satisfactory':
      return {
        bg: 'bg-lime-50 text-lime-800 border-lime-200',
        text: 'text-lime-700',
        border: 'border-lime-500',
        accent: '#84cc16',
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-700',
        border: 'border-amber-500',
        accent: '#f59e0b',
      };
    case 'Poor':
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        text: 'text-orange-700',
        border: 'border-orange-500',
        accent: '#f97316',
      };
    case 'Very Poor':
      return {
        bg: 'bg-red-50 text-red-800 border-red-200',
        text: 'text-red-700',
        border: 'border-red-500',
        accent: '#ef4444',
      };
    case 'Severe':
      return {
        bg: 'bg-purple-900 text-purple-100 border-purple-700',
        text: 'text-purple-600',
        border: 'border-purple-800',
        accent: '#7e22ce',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        text: 'text-slate-600',
        border: 'border-slate-300',
        accent: '#64748b',
      };
  }
}

/**
 * Health Advisory based on CPCB health statements
 */
export function getHealthAdvisory(category: AQICategory) {
  switch (category) {
    case 'Good':
      return {
        general: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        sensitive: 'None. Safe for all groups.',
        outdoorActivity: 'Ideal conditions for all outdoor sports, jogging, and recreation.',
      };
    case 'Satisfactory':
      return {
        general: 'Air quality is acceptable; however, minor breathing discomfort may occur for sensitive people.',
        sensitive: 'People with respiratory illnesses like asthma should monitor their comfort levels.',
        outdoorActivity: 'Safe for normal outdoor activities. Enjoy outdoor exercise.',
      };
    case 'Moderate':
      return {
        general: 'May cause breathing discomfort to people with lung disease, asthma, and heart conditions.',
        sensitive: 'Children, elderly, and people with heart/respiratory diseases should take more breaks.',
        outdoorActivity: 'Consider reducing prolonged outdoor exertion if experiencing coughing or throat irritation.',
      };
    case 'Poor':
      return {
        general: 'May cause breathing discomfort to most people on prolonged exposure.',
        sensitive: 'People with lung/heart disease, children, and older adults should significantly limit outdoor exertion.',
        outdoorActivity: 'Avoid intense outdoor cardio during peak pollution hours. Consider N95 masks if commuting.',
      };
    case 'Very Poor':
      return {
        general: 'May cause respiratory illness to the people on prolonged exposure. Pronounced effect on people with lung and heart diseases.',
        sensitive: 'Sensitive groups should remain indoors and keep activity levels low.',
        outdoorActivity: 'Avoid outdoor morning runs. Move workouts indoors with air purification. Wear N95 outdoors.',
      };
    case 'Severe':
      return {
        general: 'May cause respiratory effects even on healthy people and serious health impacts on that with lung/heart diseases.',
        sensitive: 'Everyone must avoid all outdoor physical activity. Keep windows shut and use HEPA filtration.',
        outdoorActivity: 'Strictly avoid outdoor exercise. Wear certified N95/N99 masks when outdoors is essential.',
      };
    default:
      return {
        general: 'Insufficient verified air quality measurements to determine health advisory.',
        sensitive: 'Follow general precautions if experiencing haze or irritation.',
        outdoorActivity: 'Check back once continuous monitor readings become available.',
      };
  }
}

/**
 * Calculate sub-index for a single pollutant following CPCB linear interpolation
 */
export function calculateSubIndex(pollutant: PollutantKey, rawVal: number | null | undefined): SubIndexResult {
  const defaultUnit = pollutant === 'co' ? 'mg/m³' : 'µg/m³';
  
  if (rawVal === null || rawVal === undefined || isNaN(rawVal) || rawVal < 0) {
    return {
      pollutant,
      value: 0,
      unit: defaultUnit,
      subIndex: null,
      category: 'Unknown',
      isValid: false,
      notes: 'No valid reading provided',
    };
  }

  const value = Number(rawVal);
  const ranges = BREAKPOINTS[pollutant];

  for (const r of ranges) {
    // If value falls within range [bLo, bHi]
    if (value >= r.bLo && value <= r.bHi) {
      const subIndex = Math.round(
        ((r.iHi - r.iLo) / (r.bHi - r.bLo)) * (value - r.bLo) + r.iLo
      );
      const cat = getAQICategory(subIndex);
      return {
        pollutant,
        value,
        unit: defaultUnit,
        subIndex,
        category: cat,
        isValid: true,
      };
    }
  }

  // If value exceeds highest breakpoint
  const highest = ranges[ranges.length - 1];
  if (value > highest.bHi) {
    // CPCB caps sub-index at 500 (or linear extrapolation with severe limit)
    const subIndex = Math.min(
      500,
      Math.round(
        ((highest.iHi - highest.iLo) / (highest.bHi - highest.bLo)) * (value - highest.bLo) + highest.iLo
      )
    );
    return {
      pollutant,
      value,
      unit: defaultUnit,
      subIndex: Math.max(401, Math.min(500, subIndex)),
      category: 'Severe',
      isValid: true,
      notes: 'Concentration exceeds standard CPCB upper threshold',
    };
  }

  return {
    pollutant,
    value,
    unit: defaultUnit,
    subIndex: null,
    category: 'Unknown',
    isValid: false,
    notes: 'Out of calibration range',
  };
}

/**
 * Compute the composite Indian National AQI based on CPCB criteria:
 * 1. Must have at least 3 valid pollutant sub-indices.
 * 2. At least one of the valid sub-indices must be PM2.5 or PM10.
 * 3. Composite AQI = Maximum of valid sub-indices.
 * 4. Dominant pollutant = Pollutant with the highest sub-index.
 */
export function calculateIndianAQI(input: RawPollutantInput): CompositeAQIResult {
  // Normalize CO if provided in µg/m³
  let coValue = input.co;
  if (coValue !== null && coValue !== undefined && input.coUnit === 'ug/m3') {
    coValue = coValue / 1000;
  }

  const subIndices: Record<PollutantKey, SubIndexResult> = {
    pm25: calculateSubIndex('pm25', input.pm25),
    pm10: calculateSubIndex('pm10', input.pm10),
    no2: calculateSubIndex('no2', input.no2),
    so2: calculateSubIndex('so2', input.so2),
    co: calculateSubIndex('co', coValue),
    o3: calculateSubIndex('o3', input.o3),
    nh3: calculateSubIndex('nh3', input.nh3),
  };

  const validEntries = (Object.keys(subIndices) as PollutantKey[])
    .map(key => subIndices[key])
    .filter(item => item.isValid && item.subIndex !== null);

  const hasParticulateMatter = 
    (subIndices.pm25.isValid && subIndices.pm25.subIndex !== null) ||
    (subIndices.pm10.isValid && subIndices.pm10.subIndex !== null);

  const validCount = validEntries.length;

  // CPCB requirement verification
  if (validCount < 3 || !hasParticulateMatter) {
    let reason = '';
    if (validCount < 3 && !hasParticulateMatter) {
      reason = 'Requires at least 3 pollutants including PM2.5 or PM10 (CPCB standard). Currently fewer than 3 and missing particulate matter.';
    } else if (validCount < 3) {
      reason = `Only ${validCount} pollutant(s) available. CPCB protocol requires at least 3 pollutants to calculate a reliable composite AQI.`;
    } else {
      reason = 'Neither PM2.5 nor PM10 data is available. CPCB criteria mandate at least one particulate matter sub-index for a valid composite AQI.';
    }

    return {
      aqi: null,
      category: 'Unknown',
      dominantPollutant: null,
      dominantSubIndex: null,
      subIndices,
      isReliable: false,
      statusMessage: reason,
      validPollutantsCount: validCount,
      hasParticulateMatter,
      color: getAQIColor('Unknown'),
      healthAdvisory: getHealthAdvisory('Unknown'),
    };
  }

  // Find dominant pollutant (maximum sub-index)
  let maxSubIndex = -1;
  let dominant: PollutantKey | null = null;

  for (const item of validEntries) {
    if (item.subIndex !== null && item.subIndex > maxSubIndex) {
      maxSubIndex = item.subIndex;
      dominant = item.pollutant;
    }
  }

  const compositeAQI = maxSubIndex >= 0 ? maxSubIndex : null;
  const category = getAQICategory(compositeAQI);

  return {
    aqi: compositeAQI,
    category,
    dominantPollutant: dominant,
    dominantSubIndex: compositeAQI,
    subIndices,
    isReliable: true,
    statusMessage: `Official CPCB Indian National AQI determined by dominant pollutant ${dominant?.toUpperCase() ?? 'N/A'}.`,
    validPollutantsCount: validCount,
    hasParticulateMatter,
    color: getAQIColor(category),
    healthAdvisory: getHealthAdvisory(category),
  };
}
