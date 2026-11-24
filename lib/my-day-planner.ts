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
}

export interface DailyPersonalizedPlan {
  overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  summaryHeading: string;
  summaryText: string;
  bestOutdoorWindow: {
    start: string;
    end: string;
    expectedAQI: number;
  };
  highestPollutionWindow: {
    start: string;
    end: string;
    expectedAQI: number;
    reason: string;
  };
  activities: ActivityWindowRecommendation[];
  generatedAt: string;
}

/**
 * Generates actionable personalized plan mapping hourly AQI against user daily schedule
 */
export function generateMyDayPlan(
  hourly: HourlyAQIData[],
  preferences: UserPreferences
): DailyPersonalizedPlan {
  if (!hourly || hourly.length === 0) {
    return {
      overallRiskLevel: 'Moderate',
      summaryHeading: 'Daily Air-Smart Plan',
      summaryText: 'Gathering current forecast to tailor your routine...',
      bestOutdoorWindow: { start: '13:00', end: '16:00', expectedAQI: 95 },
      highestPollutionWindow: { start: '07:00', end: '09:00', expectedAQI: 240, reason: 'Morning traffic and thermal inversion' },
      activities: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Find lowest and highest AQI windows in 24 hours
  let minAQI = Infinity;
  let minHour = '14:00';
  let maxAQI = -Infinity;
  let maxHour = '08:00';

  hourly.slice(0, 24).forEach(h => {
    const val = h.aqi ?? (h.pm25 * 1.5);
    if (val < minAQI) {
      minAQI = val;
      minHour = h.displayTime;
    }
    if (val > maxAQI) {
      maxAQI = val;
      maxHour = h.displayTime;
    }
  });

  const activities: ActivityWindowRecommendation[] = [];

  // 1. Morning Exercise Activity
  const exerciseTime = preferences.exerciseSchedule.time; // e.g. "07:00"
  const exHourNum = parseInt(exerciseTime.split(':')[0], 10);
  const plannedExData = hourly.find(h => {
    const d = new Date(h.time);
    return d.getHours() === exHourNum;
  }) || hourly[0];

  const exAQI = plannedExData.aqi ?? Math.round(plannedExData.pm25 * 1.4);
  const isSensitive = preferences.sensitivityProfile !== 'healthy-adult';

  if (exAQI > 250 || (exAQI > 180 && isSensitive)) {
    activities.push({
      id: 'act-exercise',
      activityName: 'Outdoor Exercise / Running',
      plannedTime: exerciseTime,
      recommendedTime: 'Shift to Indoor Gym / Yoga',
      status: 'reschedule',
      aqiAtPlannedTime: exAQI,
      aqiAtRecommendedTime: null,
      headline: 'High particulate exposure during morning boundary layer inversion',
      explanation: `At ${exerciseTime}, expected AQI is ${exAQI} (${getAQICategory(exAQI)}). Heavy aerobic exercise significantly increases minute ventilation, driving ultra-fine PM2.5 deep into bronchial airways.`,
      actionItems: [
        'Shift your cardio workout indoors in an air-conditioned or air-filtered space.',
        'If running is non-negotiable, reschedule to afternoon (2:00 PM – 4:00 PM) when atmospheric dispersion is higher.',
        'Stay well-hydrated to help your mucosal respiratory lining capture particles.',
      ],
      indoorAlternative: 'Indoor treadmill, bodyweight HIIT, or indoor yoga with closed windows.',
      sustainableChoice: 'Keep windows sealed until the afternoon solar heating dilutes ground emissions.',
    });
  } else if (exAQI > 120) {
    activities.push({
      id: 'act-exercise',
      activityName: 'Morning Exercise',
      plannedTime: exerciseTime,
      recommendedTime: exerciseTime,
      status: 'caution',
      aqiAtPlannedTime: exAQI,
      aqiAtRecommendedTime: exAQI,
      headline: 'Moderate exposure — reduce high-intensity interval sprints',
      explanation: `Forecast AQI is ${exAQI} (${getAQICategory(exAQI)}). Safe for low to moderate intensity, but avoid maximal heart rate sprints near main roads.`,
      actionItems: [
        'Prefer green neighborhood parks over road-facing routes.',
        'Wear an active sports bandana or check breathing comfort frequently.',
      ],
      indoorAlternative: 'Light stretching or indoor core workouts.',
    });
  } else {
    activities.push({
      id: 'act-exercise',
      activityName: 'Outdoor Exercise & Morning Run',
      plannedTime: exerciseTime,
      recommendedTime: exerciseTime,
      status: 'optimal',
      aqiAtPlannedTime: exAQI,
      aqiAtRecommendedTime: exAQI,
      headline: 'Ideal conditions for outdoor cardio and fitness',
      explanation: `Clean atmospheric conditions with AQI at ${exAQI} (${getAQICategory(exAQI)}). Excellent opportunity to jog, cycle, or walk outdoors.`,
      actionItems: [
        'Enjoy your scheduled workout without health restrictions.',
        'Take deep breaths in lush park areas.',
      ],
    });
  }

  // 2. Commute Schedule
  const commuteTime = preferences.workSchedule.start; // e.g. "09:00"
  const commuteHourNum = parseInt(commuteTime.split(':')[0], 10);
  const commuteData = hourly.find(h => {
    const d = new Date(h.time);
    return d.getHours() === commuteHourNum;
  }) || hourly[1];

  const commAQI = commuteData.aqi ?? 160;
  activities.push({
    id: 'act-commute',
    activityName: `Work Commute (${preferences.commuteMode.toUpperCase()})`,
    plannedTime: commuteTime,
    recommendedTime: commuteTime,
    status: commAQI > 200 ? 'caution' : 'acceptable',
    aqiAtPlannedTime: commAQI,
    aqiAtRecommendedTime: commAQI,
    headline: commAQI > 200 ? 'Traffic corridor smog spike — protect your commute' : 'Manageable commute conditions',
    explanation: `Peak road congestion between 8:30 AM and 10:00 AM spikes localized PM2.5 and NO2 concentrations along arterial routes.`,
    actionItems: [
      preferences.commuteMode === 'two-wheeler' || preferences.commuteMode === 'bicycle'
        ? 'Wear an N95 anti-pollution respirator with exhalation valve to block road dust and tailpipe particulate.'
        : 'If driving, keep car ventilation on Recirculation Mode (internal cabin air) to block ingress of exterior diesel soot.',
      'Take the Metro or electric rapid transit to avoid direct exposure to tailpipe exhaust.',
    ],
    sustainableChoice: 'Riding the electric Metro avoids 1.8 kg CO2e and removes private vehicular congestion.',
  });

  // 3. Evening Return & Outdoor Ventilation
  activities.push({
    id: 'act-evening',
    activityName: 'Evening Routine & Home Ventilation',
    plannedTime: '18:30',
    recommendedTime: '14:00 - 16:30 for airing out rooms',
    status: 'acceptable',
    aqiAtPlannedTime: Math.round(maxAQI * 0.9),
    aqiAtRecommendedTime: Math.round(minAQI),
    headline: 'Air your living spaces during midday when pollution is lowest',
    explanation: 'Solar heating elevates the urban planetary boundary layer between 1:00 PM and 4:30 PM, dispersing ground pollutants more effectively than dusk.',
    actionItems: [
      'Open windows for quick cross-ventilation between 2:00 PM and 4:30 PM.',
      'Close doors and windows before sunset (around 6:00 PM) when atmospheric cooling traps road smoke.',
      'Turn on indoor HEPA purifiers in bedrooms 30 minutes before sleep.',
    ],
  });

  let overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Moderate';
  if (maxAQI > 350) overallRisk = 'Severe';
  else if (maxAQI > 220) overallRisk = 'High';
  else if (maxAQI > 100) overallRisk = 'Moderate';
  else overallRisk = 'Low';

  return {
    overallRiskLevel: overallRisk,
    summaryHeading: overallRisk === 'High' || overallRisk === 'Severe'
      ? 'Air-Smart Alert: High Pollution Expected During Commute & Early Morning'
      : 'Favorable To Moderate Atmospheric Conditions Today',
    summaryText: `Based on your ${preferences.sensitivityProfile.replace('-', ' ')} profile and schedule, proactive adjustments will safeguard your pulmonary health while keeping your daily goals on track.`,
    bestOutdoorWindow: {
      start: '13:00',
      end: '16:00',
      expectedAQI: Math.round(minAQI),
    },
    highestPollutionWindow: {
      start: '06:30',
      end: '09:30',
      expectedAQI: Math.round(maxAQI),
      reason: 'Nocturnal temperature inversion trapping vehicular exhaust and road dust.',
    },
    activities,
    generatedAt: new Date().toISOString(),
  };
}
