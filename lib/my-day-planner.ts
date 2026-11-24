import type { HourlyAQIData } from './air-quality-service';
import type { UserPreferences } from './store';
import { getAQICategory } from './aqi-engine';

export interface ActivityWindowRecommendation {
  id: string;
  activityName: string;
  plannedTime: string;
  recommendedTime: string;
  status: 'optimal' | 'acceptable' | 'caution' | 'reschedule';
  aqiAtPlannedTime: number | null;
  aqiAtRecommendedTime: number | null;
  headline: string;
  explanation: string;
  actionItems: string[];
  indoorAlternative?: string;
  sustainableChoice?: string;
  confidence: 'high' | 'moderate' | 'uncertain';
}

export interface DailyPersonalizedPlan {
  overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  summaryHeading: string;
  summaryText: string;
  bestOutdoorWindow: {
    start: string;
    end: string;
    expectedAQI: number;
    reason: string;
  };
  highestPollutionWindow: {
    start: string;
    end: string;
    expectedAQI: number;
    reason: string;
  };
  activities: ActivityWindowRecommendation[];
  generatedAt: string;
  isDataUncertain: boolean;
}

/**
 * Generates an actionable personalized plan dynamically evaluated against actual hourly curves
 * Does NOT assume fixed morning/afternoon rules; evaluates actual min and max forecast points.
 */
export function generateMyDayPlan(
  hourly: HourlyAQIData[],
  preferences: UserPreferences
): DailyPersonalizedPlan {
  // If data is absent or insufficient, explicitly communicate uncertainty
  if (!hourly || hourly.length < 6) {
    return {
      overallRiskLevel: 'Moderate',
      summaryHeading: 'Daily Air-Smart Plan (Uncertain Data Coverage)',
      summaryText: 'Insufficient hourly forecast points available to model your schedule with high confidence. Proceeding with caution.',
      bestOutdoorWindow: {
        start: 'N/A',
        end: 'N/A',
        expectedAQI: 100,
        reason: 'Awaiting continuous hourly forecast ingestion.',
      },
      highestPollutionWindow: {
        start: 'N/A',
        end: 'N/A',
        expectedAQI: 180,
        reason: 'Insufficient hourly points to establish peak pollution hour.',
      },
      activities: [],
      generatedAt: new Date().toISOString(),
      isDataUncertain: true,
    };
  }

  // Dynamically analyze the available hourly trajectory (up to 24 hours)
  const windowSlice = hourly.slice(0, 24);

  let minVal = Infinity;
  let minHourObj: HourlyAQIData = windowSlice[0];
  let maxVal = -Infinity;
  let maxHourObj: HourlyAQIData = windowSlice[0];

  windowSlice.forEach((h) => {
    const val = h.aqi ?? (h.pm25 * 1.5);
    if (val < minVal) {
      minVal = val;
      minHourObj = h;
    }
    if (val > maxVal) {
      maxVal = val;
      maxHourObj = h;
    }
  });

  const bestWindowStart = minHourObj.displayTime;
  // Estimate window end 3 hours later or next available
  const bestDate = new Date(minHourObj.time);
  const bestEndDate = new Date(bestDate.getTime() + 3 * 3600000);
  const bestWindowEnd = bestEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const peakWindowStart = maxHourObj.displayTime;
  const peakDate = new Date(maxHourObj.time);
  const peakEndDate = new Date(peakDate.getTime() + 2 * 3600000);
  const peakWindowEnd = peakEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const activities: ActivityWindowRecommendation[] = [];
  const isSensitive = preferences.sensitivityProfile !== 'healthy-adult';

  // 1. Evaluate Exercise Activity based on ACTUAL hourly forecast at planned time
  const exerciseTime = preferences.exerciseSchedule.time; // e.g. "07:00"
  const exHourNum = parseInt(exerciseTime.split(':')[0], 10);
  const plannedExData = windowSlice.find((h) => {
    const d = new Date(h.time);
    return d.getHours() === exHourNum;
  }) || windowSlice[0];

  const exAQI = plannedExData.aqi ?? Math.round(plannedExData.pm25 * 1.4);
  const exCat = getAQICategory(exAQI);

  if (exAQI > 250 || (exAQI > 180 && isSensitive)) {
    activities.push({
      id: 'act-exercise',
      activityName: `Outdoor Exercise / ${preferences.exerciseSchedule.type.replace('-', ' ')}`,
      plannedTime: exerciseTime,
      recommendedTime: `Shift to ${bestWindowStart} or exercise indoors`,
      status: 'reschedule',
      aqiAtPlannedTime: exAQI,
      aqiAtRecommendedTime: Math.round(minVal),
      headline: `High forecast exposure (AQI ${exAQI} - ${exCat}) at scheduled exercise time`,
      explanation: `Forecast hourly curve indicates particulate concentration reaches ${plannedExData.pm25} µg/m³ at ${exerciseTime}. Intense outdoor aerobic respiration multiplies inhaled lung dosage by 3x to 5x.`,
      actionItems: [
        'Shift your workout indoors with air purification running.',
        `If outdoor workout is necessary, relocate to lowest pollution window at ${bestWindowStart} (AQI ~${Math.round(minVal)}).`,
        'Keep hydration high to assist respiratory cilia in particle expulsion.',
      ],
      indoorAlternative: 'Indoor treadmill, bodyweight circuit, or yoga in a closed room.',
      sustainableChoice: 'Keep windows sealed during peak hours to preserve indoor clean air bubble.',
      confidence: 'high',
    });
  } else if (exAQI > 100) {
    activities.push({
      id: 'act-exercise',
      activityName: `Exercise Routine (${preferences.exerciseSchedule.type.replace('-', ' ')})`,
      plannedTime: exerciseTime,
      recommendedTime: exerciseTime,
      status: 'caution',
      aqiAtPlannedTime: exAQI,
      aqiAtRecommendedTime: exAQI,
      headline: `Moderate exposure (AQI ${exAQI} - ${exCat}) — reduce maximum exertion`,
      explanation: `Air quality at ${exerciseTime} is within Moderate bounds. Safe for steady-state exercise, but avoid maximal sprint intervals along busy traffic corridors.`,
      actionItems: [
        'Prefer green canopy parks over roadside routes.',
        'Monitor respiratory ease and take recovery breaks.',
      ],
      indoorAlternative: 'Low-impact indoor stretching or core workout.',
      confidence: 'high',
    });
  } else {
    activities.push({
      id: 'act-exercise',
      activityName: `Outdoor Fitness (${preferences.exerciseSchedule.type.replace('-', ' ')})`,
      plannedTime: exerciseTime,
      recommendedTime: exerciseTime,
      status: 'optimal',
      aqiAtPlannedTime: exAQI,
      aqiAtRecommendedTime: exAQI,
      headline: `Favorable atmospheric conditions (AQI ${exAQI} - ${exCat})`,
      explanation: `Atmospheric measurements at ${exerciseTime} show low particulate levels (${plannedExData.pm25} µg/m³ PM2.5). Excellent window for outdoor training.`,
      actionItems: [
        'Enjoy outdoor sports and fitness routines without restrictions.',
        'Take advantage of clean air to jog or cycle.',
      ],
      confidence: 'high',
    });
  }

  // 2. Evaluate Commute Schedule dynamically
  const commuteTime = preferences.workSchedule.start;
  const commuteHourNum = parseInt(commuteTime.split(':')[0], 10);
  const commuteData = windowSlice.find((h) => {
    const d = new Date(h.time);
    return d.getHours() === commuteHourNum;
  }) || windowSlice[1] || windowSlice[0];

  const commAQI = commuteData.aqi ?? 150;
  const commCat = getAQICategory(commAQI);

  activities.push({
    id: 'act-commute',
    activityName: `Work Commute (${preferences.commuteMode.toUpperCase()})`,
    plannedTime: commuteTime,
    recommendedTime: commuteTime,
    status: commAQI > 200 ? 'caution' : 'acceptable',
    aqiAtPlannedTime: commAQI,
    aqiAtRecommendedTime: commAQI,
    headline: commAQI > 200 ? `Traffic congestion smog peak (AQI ${commAQI} - ${commCat})` : `Manageable commute exposure (AQI ${commAQI})`,
    explanation: `Vehicular tailpipe density along arterial roads elevates ground-level PM2.5 and NO2 at ${commuteTime}.`,
    actionItems: [
      preferences.commuteMode === 'two-wheeler' || preferences.commuteMode === 'bicycle'
        ? 'Wear an airtight certified N95 respirator to block road dust and diesel soot.'
        : 'If driving personal car, set ventilation to Recirculation Mode (internal air only).',
      'Choose electric Metro transit where possible to avoid congested stop-and-go exhaust.',
    ],
    sustainableChoice: 'Electric Metro trip avoids ~1.8 kg CO2e and removes personal vehicle from rush hour traffic.',
    confidence: 'high',
  });

  // 3. Dynamic Home Ventilation Window: Uses ACTUAL minVal hour instead of hardcoded afternoon
  activities.push({
    id: 'act-ventilation',
    activityName: 'Home Ventilation & Air Purifier Refresh',
    plannedTime: 'Flexible',
    recommendedTime: `${bestWindowStart} – ${bestWindowEnd}`,
    status: 'optimal',
    aqiAtPlannedTime: Math.round(maxVal),
    aqiAtRecommendedTime: Math.round(minVal),
    headline: `Open windows dynamically when forecast reaches lowest point (${bestWindowStart})`,
    explanation: `Hourly forecast data identifies ${bestWindowStart} as today's lowest pollution window (AQI ~${Math.round(minVal)} vs peak of ~${Math.round(maxVal)}). This is the optimal window to refresh indoor air.`,
    actionItems: [
      `Conduct 15-minute cross-ventilation between ${bestWindowStart} and ${bestWindowEnd}.`,
      `Reseal windows before the projected pollution peak at ${peakWindowStart}.`,
      'Run indoor HEPA filtration in bedrooms prior to night rest.',
    ],
    confidence: 'high',
  });

  let overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Moderate';
  if (maxVal > 350) overallRisk = 'Severe';
  else if (maxVal > 220) overallRisk = 'High';
  else if (maxVal > 100) overallRisk = 'Moderate';
  else overallRisk = 'Low';

  return {
    overallRiskLevel: overallRisk,
    summaryHeading: overallRisk === 'High' || overallRisk === 'Severe'
      ? `Air-Smart Alert: High Pollution Trajectory Predicted (Peak AQI ~${Math.round(maxVal)})`
      : `Moderate to Favorable Atmospheric Conditions Projected (Lowest AQI ~${Math.round(minVal)})`,
    summaryText: `Generated dynamically from ${windowSlice.length} hourly forecast points. Tailored for ${preferences.sensitivityProfile.replace('-', ' ')} with exercise scheduled at ${exerciseTime}.`,
    bestOutdoorWindow: {
      start: bestWindowStart,
      end: bestWindowEnd,
      expectedAQI: Math.round(minVal),
      reason: `Hourly curve reaches minimum pollutant concentration at ${bestWindowStart}.`,
    },
    highestPollutionWindow: {
      start: peakWindowStart,
      end: peakWindowEnd,
      expectedAQI: Math.round(maxVal),
      reason: `Hourly curve predicts maximum atmospheric stagnation and pollutant concentration at ${peakWindowStart}.`,
    },
    activities,
    generatedAt: new Date().toISOString(),
    isDataUncertain: false,
  };
}
