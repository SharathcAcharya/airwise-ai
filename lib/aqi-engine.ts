/**
 * AIRWISE AI - Indian National AQI (CPCB) Calculation Engine
 *
 * Based on official Central Pollution Control Board (CPCB) guidelines.
 *
 * Sub-index formula:
 *   I_p = [ (I_Hi - I_Lo) / (B_Hi - B_Lo) ] * (C_p - B_Lo) + I_Lo
 *
 * CPCB AVERAGING PERIODS:
 * - PM2.5, PM10, NO2, SO2, NH3: 24-hour running or daily average
 * - CO, O3: 8-hour running average
 *
 * CPCB DATA COMPLETENESS RULES:
 * - A 24-hour average requires at least 16 hourly readings (>= 66.7% data capture).
 * - An 8-hour average for CO and O3 requires at least 6 hourly readings (>= 75% data capture).
 * - Minimum of 3 pollutants must be monitored.
 * - At least one of them MUST be PM2.5 or PM10.
 * - Model forecasts or instantaneous snapshots are explicitly categorized as indicative model estimates
 *   and NOT official CPCB monitoring-station certified composite AQI unless all verification conditions are met.
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
  averagingHours?: number;
  isComplete?: boolean;
  notes?: string;
}

export interface CompositeAQIResult {
  aqi: number | null;
  indicativeAqi: number | null; // Model-based or snapshot estimation when formal CPCB data completeness is not fully met
  category: AQICategory;
  dominantPollutant: PollutantKey | null;
  dominantSubIndex: number | null;
  subIndices: Record<PollutantKey, SubIndexResult>;
  isReliable: boolean;
  isOfficialCPCBCompliant: boolean; // True only if station data, minimum 16-hr coverage, and >=3 pollutants with PM
  statusMessage: string;
  dataCompletenessExplanation?: string;
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
  co?: number | null;    // mg/m³ (or µg/m³ if coUnit flagged)
  coUnit?: 'mg/m3' | 'ug/m3';
  o3?: number | null;    // µg/m³
  nh3?: number | null;   // µg/m³

  // Historical or series data for averaging & completeness validation
  hourlyDataHistory?: {
    pm25?: (number | null)[];
    pm10?: (number | null)[];
    no2?: (number | null)[];
    so2?: (number | null)[];
    co?: (number | null)[];
    o3?: (number | null)[];
  };
  dataSourceType?: 'measured-station' | 'model-estimate' | 'forecast' | 'demonstration';
}

export const BREAKPOINTS: Record<PollutantKey, BreakpointRange[]> = {
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
        bg: 'bg-[#23272B] text-[#4BA9FF] border-[#3D7AB2]',
        text: 'text-[#4BA9FF]',
        border: 'border-[#3D7AB2]',
        accent: '#4BA9FF',
      };
    case 'Satisfactory':
      return {
        bg: 'bg-[#39414B] text-[#F9FAFF] border-[#677580]',
        text: 'text-[#F9FAFF]',
        border: 'border-[#677580]',
        accent: '#3D7AB2',
      };
    case 'Moderate':
      return {
        bg: 'bg-[#39414B] text-[#EA8C34] border-[#EA8C34]',
        text: 'text-[#EA8C34]',
        border: 'border-[#EA8C34]',
        accent: '#EA8C34',
      };
    case 'Poor':
      return {
        bg: 'bg-[#39414B] text-[#E75835] border-[#E75835]',
        text: 'text-[#E75835]',
        border: 'border-[#E75835]',
        accent: '#E75835',
      };
    case 'Very Poor':
      return {
        bg: 'bg-[#39414B] text-[#E5484D] border-[#E5484D]',
        text: 'text-[#E5484D]',
        border: 'border-[#E5484D]',
        accent: '#E5484D',
      };
    case 'Severe':
      return {
        bg: 'bg-[#23272B] text-[#F9FAFF] border-[#E5484D]',
        text: 'text-[#E5484D]',
        border: 'border-[#E5484D]',
        accent: '#E5484D',
      };
    default:
      return {
        bg: 'bg-[#39414B] text-[#CCD3D7] border-[#677580]',
        text: 'text-[#CCD3D7]',
        border: 'border-[#677580]',
        accent: '#97A7B6',
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
 * Compute valid average across historical hours enforcing CPCB completeness:
 * - 24-hr average requires at least 16 hourly data points (>= 66.7%).
 * - 8-hr average (for CO, O3) requires at least 6 hourly data points (>= 75%).
 */
export function calculateAveragedPollutant(
  hourlyValues: (number | null | undefined)[],
  requiredHours: 24 | 8
): { average: number | null; validCount: number; isComplete: boolean } {
  const minRequired = requiredHours === 24 ? 16 : 6;
  const recentSlice = hourlyValues.slice(-requiredHours);
  const valid = recentSlice.filter((v): v is number => v !== null && v !== undefined && !isNaN(v) && v >= 0);

  if (valid.length < minRequired) {
    return {
      average: valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null,
      validCount: valid.length,
      isComplete: false,
    };
  }

  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return {
    average: Math.round(avg * 10) / 10,
    validCount: valid.length,
    isComplete: true,
  };
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
 * Compute composite Indian National AQI based on CPCB criteria:
 * 1. Must have at least 3 valid pollutant sub-indices.
 * 2. At least one of the valid sub-indices must be PM2.5 or PM10.
 * 3. 24-hr averaging completeness verification for official station data (>= 16 hrs).
 * 4. Composite AQI = Maximum of valid sub-indices.
 * 5. Dominant pollutant = Pollutant with highest valid sub-index.
 * 6. Where completeness or station verification is missing, returns clearly labelled indicative model estimate.
 */
export function calculateIndianAQI(input: RawPollutantInput): CompositeAQIResult {
  // Normalize CO if provided in µg/m³
  let coValue = input.co;
  if (coValue !== null && coValue !== undefined && input.coUnit === 'ug/m3') {
    coValue = coValue / 1000;
  }

  // Check historical hourly data if provided
  let hasCompletenessFailure = false;
  let completenessNote = '';

  if (input.hourlyDataHistory) {
    const pm25Check = input.hourlyDataHistory.pm25 ? calculateAveragedPollutant(input.hourlyDataHistory.pm25, 24) : null;
    const pm10Check = input.hourlyDataHistory.pm10 ? calculateAveragedPollutant(input.hourlyDataHistory.pm10, 24) : null;
    const coCheck = input.hourlyDataHistory.co ? calculateAveragedPollutant(input.hourlyDataHistory.co, 8) : null;

    if (pm25Check && !pm25Check.isComplete && pm10Check && !pm10Check.isComplete) {
      hasCompletenessFailure = true;
      completenessNote = `Insufficient historical data coverage (PM2.5: ${pm25Check.validCount}/24 hrs, PM10: ${pm10Check?.validCount ?? 0}/24 hrs). CPCB protocol requires at least 16 hours of observations for an official daily composite.`;
    }
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

  // Find maximum sub-index (indicative or official)
  let maxSubIndex = -1;
  let dominant: PollutantKey | null = null;

  for (const item of validEntries) {
    if (item.subIndex !== null && item.subIndex > maxSubIndex) {
      maxSubIndex = item.subIndex;
      dominant = item.pollutant;
    }
  }

  const indicativeVal = maxSubIndex >= 0 ? maxSubIndex : null;

  // CPCB requirement verification:
  // Requires at least 3 pollutants AND at least 1 particulate matter
  const meetsPollutantCountAndParticulate = validCount >= 3 && hasParticulateMatter;

  if (!meetsPollutantCountAndParticulate) {
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
      indicativeAqi: null,
      category: 'Unknown',
      dominantPollutant: null,
      dominantSubIndex: null,
      subIndices,
      isReliable: false,
      isOfficialCPCBCompliant: false,
      statusMessage: reason,
      dataCompletenessExplanation: reason,
      validPollutantsCount: validCount,
      hasParticulateMatter,
      color: getAQIColor('Unknown'),
      healthAdvisory: getHealthAdvisory('Unknown'),
    };
  }

  // If completeness check failed (e.g. fewer than 16 hours of station data)
  if (hasCompletenessFailure) {
    const indicativeCategory = getAQICategory(indicativeVal);
    return {
      aqi: null, // Official CPCB composite is unavailable
      indicativeAqi: indicativeVal, // Model-based indicative estimate is preserved
      category: indicativeCategory,
      dominantPollutant: dominant,
      dominantSubIndex: indicativeVal,
      subIndices,
      isReliable: false,
      isOfficialCPCBCompliant: false,
      statusMessage: 'Official CPCB 24-hr composite AQI unavailable due to insufficient historical coverage (<16 hrs). Displaying indicative model estimate.',
      dataCompletenessExplanation: completenessNote,
      validPollutantsCount: validCount,
      hasParticulateMatter,
      color: getAQIColor(indicativeCategory),
      healthAdvisory: getHealthAdvisory(indicativeCategory),
    };
  }

  // If input is purely model forecast rather than certified ground station monitoring
  const isForecastOrModel = input.dataSourceType === 'model-estimate' || input.dataSourceType === 'forecast' || input.dataSourceType === 'demonstration';

  const category = getAQICategory(indicativeVal);

  return {
    aqi: isForecastOrModel ? indicativeVal : indicativeVal,
    indicativeAqi: indicativeVal,
    category,
    dominantPollutant: dominant,
    dominantSubIndex: indicativeVal,
    subIndices,
    isReliable: true,
    isOfficialCPCBCompliant: !isForecastOrModel,
    statusMessage: isForecastOrModel
      ? `Indicative Indian AQI calculated via CPCB formula from atmospheric model estimates (dominant: ${dominant?.toUpperCase() ?? 'N/A'}).`
      : `Official CPCB Indian National AQI certified by continuous station monitoring (dominant: ${dominant?.toUpperCase() ?? 'N/A'}).`,
    dataCompletenessExplanation: isForecastOrModel
      ? 'Calculated using atmospheric chemistry model forecasts. Official continuous CPCB CAAQMS requires local sensor telemetry.'
      : 'Meets full CPCB data completeness criteria (>=16 hrs for 24-hr averages and >=6 hrs for 8-hr CO/O3).',
    validPollutantsCount: validCount,
    hasParticulateMatter,
    color: getAQIColor(category),
    healthAdvisory: getHealthAdvisory(category),
  };
}
