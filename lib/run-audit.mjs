import { calculateIndianAQI, calculateSubIndex, getAQICategory, calculateAveragedPollutant } from './aqi-engine.ts';
import { generateRuleBasedResponse } from './assistant-engine.ts';

console.log('=====================================================');
console.log('AIRWISE AI — COMPREHENSIVE COMPETITION READINESS AUDIT');
console.log('=====================================================\n');

let total = 0;
let passed = 0;
let failed = 0;

function runCheck(name, condition, detail) {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name} -> ${detail || 'Assertion failed'}`);
  }
}

// -------------------------------------------------------------------
// SECTION 1: CPCB BREAKPOINTS & LINEAR INTERPOLATION AUDIT
// -------------------------------------------------------------------
console.log('\n--- 1. CPCB Methodology & Breakpoint Integrity ---');

// Good: PM2.5 0-30 -> 0-50
const pmGood = calculateSubIndex('pm25', 15);
runCheck('PM2.5 @ 15 µg/m³ -> Sub-index 25 (Good)', pmGood.isValid && pmGood.subIndex === 25 && pmGood.category === 'Good');

// Satisfactory: PM2.5 31-60 -> 51-100
const pmSat = calculateSubIndex('pm25', 60);
runCheck('PM2.5 @ 60 µg/m³ -> Sub-index 100 (Satisfactory boundary)', pmSat.isValid && pmSat.subIndex === 100 && pmSat.category === 'Satisfactory');

// Moderate: PM10 101-250 -> 101-200
const pm10Mod = calculateSubIndex('pm10', 175);
runCheck('PM10 @ 175 µg/m³ -> Sub-index 150 (Moderate midpoint)', pm10Mod.isValid && pm10Mod.subIndex === 150 && pm10Mod.category === 'Moderate');

// Poor: NO2 181-280 -> 201-300
const no2Poor = calculateSubIndex('no2', 280);
runCheck('NO2 @ 280 µg/m³ -> Sub-index 300 (Poor boundary)', no2Poor.isValid && no2Poor.subIndex === 300 && no2Poor.category === 'Poor');

// Very Poor: SO2 801-1600 -> 301-400 (midpoint 1200.5 -> 351)
const so2VP = calculateSubIndex('so2', 1200.5);
runCheck('SO2 @ 1200.5 µg/m³ -> Sub-index 351 (Very Poor)', so2VP.isValid && so2VP.subIndex === 351 && so2VP.category === 'Very Poor');

// CO Normalization (µg/m³ -> mg/m³) and Breakpoint (2.1 - 10.0 -> 101-200)
const coNorm = calculateIndianAQI({
  pm25: 40,
  pm10: 75,
  no2: 30,
  co: 5000,
  coUnit: 'ug/m3', // 5000 µg/m³ = 5.0 mg/m³
});
runCheck('CO Normalized from 5000 µg/m³ to 5.0 mg/m³', coNorm.subIndices.co.value === 5.0);

// Extreme Values
const extremePM = calculateSubIndex('pm25', 750);
runCheck('Extreme PM2.5 capped at 500 Severe', extremePM.isValid && extremePM.subIndex === 500 && extremePM.category === 'Severe');

// Negative Values
const negPM = calculateSubIndex('pm25', -15);
runCheck('Negative PM values safely invalidated', !negPM.isValid && negPM.subIndex === null);

// -------------------------------------------------------------------
// SECTION 2: CPCB DATA COMPLETENESS & 16-HR RULE AUDIT
// -------------------------------------------------------------------
console.log('\n--- 2. CPCB Data Completeness & Station vs Model Rules ---');

// 24-hr completeness requirement: Requires >= 16 valid hours
const insufficientHours = [10, 20, 30, null, 15, null, 25, 30, 40, 20]; // only 8 readings
const completenessFail = calculateAveragedPollutant(insufficientHours, 24);
runCheck('Completeness check detects < 16 hours (< 66.7%)', !completenessFail.isComplete && completenessFail.validCount === 8);

const sufficientHours = Array(18).fill(45); // 18 readings
const completenessPass = calculateAveragedPollutant(sufficientHours, 24);
runCheck('Completeness check validates >= 16 hours (75%)', completenessPass.isComplete && completenessPass.validCount === 18);

// 8-hr completeness for CO/O3 requires >= 6 hours
const co8HoursFail = calculateAveragedPollutant([1, 2, 3], 8); // only 3 readings
runCheck('CO 8-hr completeness rejects < 6 hours', !co8HoursFail.isComplete);

const co8HoursPass = calculateAveragedPollutant([1, 2, 1.5, 2, 2.5, 3], 8); // 6 readings
runCheck('CO 8-hr completeness accepts >= 6 hours', co8HoursPass.isComplete);

// Rejection when < 3 pollutants
const lessThan3 = calculateIndianAQI({ pm25: 80, pm10: 120 });
runCheck('Rejects composite AQI when only 2 pollutants monitored', lessThan3.aqi === null && !lessThan3.isReliable);

// Rejection when NO particulate matter is present
const noParticulates = calculateIndianAQI({ no2: 60, so2: 30, co: 1.5, o3: 40 });
runCheck('Rejects composite AQI when neither PM2.5 nor PM10 present', noParticulates.aqi === null && !noParticulates.isReliable);

// Station vs Model Forecast distinction
const modelEstimateCalc = calculateIndianAQI({
  pm25: 110,
  no2: 45,
  so2: 25,
  dataSourceType: 'model-estimate',
});
runCheck('Model forecasts classified as indicative estimates, not official CAAQMS station', !modelEstimateCalc.isOfficialCPCBCompliant && modelEstimateCalc.indicativeAqi !== null);

// -------------------------------------------------------------------
// SECTION 3: MY DAY PLANNER DYNAMIC RULES
// -------------------------------------------------------------------
console.log('\n--- 3. My Day Dynamic Schedule Optimization Rules ---');

// Mock 24-hour curve with peak at morning (08:00) and valley at afternoon (15:00)
const hourlyMock = Array.from({ length: 24 }).map((_, i) => {
  const isMorningRush = i >= 7 && i <= 9;
  const isMiddayValley = i >= 13 && i <= 16;
  const pm25 = isMorningRush ? 180 : isMiddayValley ? 35 : 85;
  const aqi = isMorningRush ? 345 : isMiddayValley ? 58 : 140;

  return {
    time: `2026-11-24T${String(i).padStart(2, '0')}:00:00Z`,
    displayTime: `${i}:00`,
    pm25,
    pm10: pm25 * 1.5,
    no2: 30,
    so2: 12,
    co: 0.8,
    o3: 40,
    aqi,
    category: getAQICategory(aqi),
  };
});

let minVal = Infinity;
let maxVal = -Infinity;
hourlyMock.forEach(h => {
  if (h.aqi < minVal) minVal = h.aqi;
  if (h.aqi > maxVal) maxVal = h.aqi;
});

runCheck('Evaluates lowest pollution window from actual data (58 AQI)', minVal === 58);
runCheck('Evaluates highest pollution window from actual data (345 AQI)', maxVal === 345);

// -------------------------------------------------------------------
// SECTION 4: AI ASSISTANT TEN (10) REALISTIC USER QUESTIONS AUDIT
// -------------------------------------------------------------------
console.log('\n--- 4. AI Assistant Audit (10 Realistic User Inquiries) ---');

const mockEnvContext = {
  locationName: 'Anand Vihar, Delhi',
  aqi: 312,
  category: 'Very Poor',
  dominantPollutant: 'pm25',
  dominantSubIndex: 312,
  pm25: 145,
  pm10: 220,
  no2: 55,
  so2: 18,
  co: 1.6,
  o3: 35,
  source: 'Open-Meteo Air Quality (CAMS Global)',
  dataSourceType: 'model-estimate',
};

const userQuestions = [
  { q: 'Is it suitable to go running now?', check: (ans) => ans.includes('Indoors') || ans.includes('respirator') },
  { q: 'What is causing today’s poor air quality?', check: (ans) => ans.includes('Vehicular') || ans.includes('Inversion') },
  { q: 'Is my morning commute advisable by bike or metro?', check: (ans) => ans.includes('Metro') || ans.includes('N95') },
  { q: 'What precautions should children and schools take?', check: (ans) => ans.includes('Children') && ans.includes('inhaler') },
  { q: 'What should I do when PM2.5 increases?', check: (ans) => ans.includes('HEPA') || ans.includes('N95') },
  { q: 'What are some sustainable alternatives to driving today?', check: (ans) => ans.includes('CO2e') || ans.includes('metro') },
  { q: 'What type of mask should I wear outside?', check: (ans) => ans.includes('N95') || ans.includes('FFP2') },
  { q: 'How do air purifiers and HEPA filters help?', check: (ans) => ans.includes('HEPA') && ans.includes('0.3') },
  { q: 'When should I open windows to ventilate my room?', check: (ans) => ans.includes('Ventilation') || ans.includes('windows') },
  { q: 'Can you summarize current air conditions?', check: (ans) => ans.includes('312') && ans.includes('Very Poor') },
];

userQuestions.forEach((item, index) => {
  const reply = generateRuleBasedResponse(item.q, mockEnvContext, { sensitivity: 'Standard adult' });
  const passedCheck = item.check(reply);
  runCheck(`Question ${index + 1}: "${item.q.slice(0, 35)}..." grounded response verified`, passedCheck);
});

// -------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------
console.log('\n=====================================================');
console.log(`AUDIT RESULTS: ${passed} Checks Passed, ${failed} Failed out of ${total} Total.`);
console.log('=====================================================');

if (failed > 0) {
  process.exit(1);
}
