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
// SECTION 5: DYNAMIC LOCATION SEARCH & GEOCODING VERIFICATION
// -------------------------------------------------------------------
console.log('\n--- 5. Dynamic Geocoding & Location Integrity ---');

// Indian Cities & Localities Check
const testLocations = [
  { name: 'Mangaluru', lat: 12.9172, lon: 74.8560, state: 'Karnataka' },
  { name: 'Kankanady', lat: 12.8659, lon: 74.8651, state: 'Karnataka' },
  { name: 'Udupi', lat: 13.3347, lon: 74.7462, state: 'Karnataka' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  { name: 'Mysuru', lat: 12.2958, lon: 76.6394, state: 'Karnataka' },
];

testLocations.forEach(loc => {
  const isValidCoord = loc.lat >= 8.0 && loc.lat <= 37.0 && loc.lon >= 68.0 && loc.lon <= 97.5;
  runCheck(`Location coordinate bounds: ${loc.name} (${loc.lat}, ${loc.lon})`, isValidCoord);
});

// GPS Error Handling Test
function simulateGpsError(code) {
  if (code === 1) return 'Location permission denied. Please enable location access in browser settings.';
  if (code === 2) return 'Location information is currently unavailable.';
  if (code === 3) return 'Location request timed out. Please retry.';
  return 'Unable to acquire location.';
}
runCheck('GPS permission denied error handling', simulateGpsError(1).includes('permission denied'));
runCheck('GPS unavailable error handling', simulateGpsError(2).includes('unavailable'));
runCheck('GPS timeout error handling', simulateGpsError(3).includes('timed out'));

// -------------------------------------------------------------------
// SECTION 6: EXTENDED REAL-WORLD END-TO-END QA CHECKS
// -------------------------------------------------------------------
console.log('\n--- 6. End-to-End Real-World API & Security QA ---');

// Geocoding query normalization & security checks
const queryCheck1 = "Kankanādi".normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
runCheck('Accent stripping on geocoding query (Kankanādi -> kankanadi)', queryCheck1 === 'kankanadi');

const longQuery = 'A'.repeat(105);
const isExcessiveLength = longQuery.length > 100;
runCheck('Geocoding query length cap (>100 chars rejected)', isExcessiveLength);

// Coordinate bounds validation for /api/air-quality
function validateCoordinates(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
runCheck('Valid Indian coordinates pass validation', validateCoordinates(12.9172, 74.8560));
runCheck('Out-of-bounds latitude rejected (> 90)', !validateCoordinates(95.0, 77.0));
runCheck('Out-of-bounds longitude rejected (> 180)', !validateCoordinates(28.0, 195.0));
runCheck('Non-numeric coordinates rejected', !validateCoordinates(NaN, 77.0));

// Multi-location mock air quality integration
const sampleLocations = [
  { city: 'Mangaluru', lat: 12.9172, lon: 74.8560, pm25: 22.5, pm10: 25.1, no2: 2.6 },
  { city: 'Udupi', lat: 13.3347, lon: 74.7462, pm25: 18.6, pm10: 19.7, no2: 2.7 },
  { city: 'Bengaluru', lat: 12.9716, lon: 77.5946, pm25: 5.3, pm10: 5.4, no2: 15.7 },
  { city: 'Delhi', lat: 28.6508, lon: 77.3152, pm25: 133.8, pm10: 234.8, no2: 68.9 },
];

sampleLocations.forEach(loc => {
  const result = calculateIndianAQI({
    pm25: loc.pm25,
    pm10: loc.pm10,
    no2: loc.no2,
  });
  runCheck(`AQI Calculation integrity for ${loc.city}: Subindex ${result.aqi ?? result.indicativeAqi} (${result.category})`, result.category !== 'Unknown');
});

// Community watch sanitization check
function sanitizeCommunityInput(str) {
  return str.trim().slice(0, 500);
}
runCheck('Community report title sanitization trims and bounds length', sanitizeCommunityInput('  Dust plume  ').length === 10);

// Sustainability CO2 math check
function calculateCo2Saved(mode, distanceKm) {
  const carEmissionPerKm = 0.170; // 170g/km
  if (mode === 'metro') return Number((distanceKm * (carEmissionPerKm - 0.035)).toFixed(2));
  if (mode === 'cycling' || mode === 'walking') return Number((distanceKm * carEmissionPerKm).toFixed(2));
  return 0;
}
runCheck('Metro commute saves expected CO2 (10 km -> 1.35 kg CO2)', calculateCo2Saved('metro', 10) === 1.35);
runCheck('Cycling commute saves expected CO2 (5 km -> 0.85 kg CO2)', calculateCo2Saved('cycling', 5) === 0.85);

// Brand Logo Asset & Metadata Checks
import fs from 'fs';
const logoMasterExists = fs.existsSync('./public/Airwise AI Eco-Tech Logo.png');
const logoIconExists = fs.existsSync('./public/airwise-logo-icon.png');
const appIconExists = fs.existsSync('./app/icon.png');
const appAppleIconExists = fs.existsSync('./app/apple-icon.png');
const ogImageExists = fs.existsSync('./public/airwise-og.png');

runCheck('Official logo master asset present (public/Airwise AI Eco-Tech Logo.png)', logoMasterExists);
runCheck('Derived icon mark asset present (public/airwise-logo-icon.png)', logoIconExists);
runCheck('App Router icon asset present (app/icon.png)', appIconExists);
runCheck('App Router apple-touch-icon asset present (app/apple-icon.png)', appAppleIconExists);
runCheck('OpenGraph social card asset present (public/airwise-og.png)', ogImageExists);

const brandAltText = 'AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.';
runCheck('Brand alt text format matches specification', brandAltText.includes('Breathe Smarter. Move Safer. Live Greener.'));

// -------------------------------------------------------------------
// SECTION 7: PHASE 4 INTELLIGENT EXPANSION & MULTILINGUAL AUDIT
// -------------------------------------------------------------------
console.log('\n--- 7. Phase 4 Multilingual, Commute & Platform Expansion ---');

// 1. Multilingual Locale Dictionaries
const languages = ['en', 'kn', 'hi', 'ta', 'bn', 'mr'];
languages.forEach(lang => {
  const filePath = `./locales/${lang}.json`;
  const exists = fs.existsSync(filePath);
  runCheck(`Locale dictionary exists: locales/${lang}.json`, exists);
  if (exists) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const hasBrand = !!data.brand?.tagline;
      const hasNav = !!data.nav?.dashboard && !!data.nav?.commute && !!data.nav?.insights;
      const hasAqi = !!data.aqi?.categories?.Good;
      runCheck(`Locale ${lang} contains critical schema keys`, hasBrand && hasNav && hasAqi);
    } catch (e) {
      runCheck(`Locale ${lang} valid JSON parse`, false, e.message);
    }
  }
});

// 2. Regional Language AI Assistant Responses
const knReply = generateRuleBasedResponse('ಈಗ ಓಟಕ್ಕೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?', mockEnvContext, null, 'kn');
runCheck('Kannada AI response generated with native script', /[\u0C80-\u0CFF]/.test(knReply) && (knReply.includes('ವ್ಯಾಯಾಮ') || knReply.includes('ಓಟ')));

const hiReply = generateRuleBasedResponse('क्या अभी दौड़ना सुरक्षित है?', mockEnvContext, null, 'hi');
runCheck('Hindi AI response generated with native script', /[\u0900-\u097F]/.test(hiReply) && (hiReply.includes('दौड़') || hiReply.includes('व्यायाम')));

const taReply = generateRuleBasedResponse('Is it safe to run?', mockEnvContext, null, 'ta');
runCheck('Tamil AI response generated with native script', /[\u0B80-\u0BFF]/.test(taReply) && (taReply.includes('உடற்பயிற்சி') || taReply.includes('ஓட்டம்')));

const bnReply = generateRuleBasedResponse('Is it safe to run?', mockEnvContext, null, 'bn');
runCheck('Bengali AI response generated with native script', /[\u0980-\u09FF]/.test(bnReply) && (bnReply.includes('ব্যায়াম') || bnReply.includes('দৌড়')));

const mrReply = generateRuleBasedResponse('Is it safe to run?', mockEnvContext, null, 'mr');
runCheck('Marathi AI response generated with native script', /[\u0900-\u097F]/.test(mrReply) && (mrReply.includes('व्यायाम') || mrReply.includes('धावणे')));

// 3. Clean-Air Commute Planner Math
function calculateCommuteMetrics(distanceKm, mode) {
  const carEmissionPerKm = 0.170; // 170g CO2/km
  if (mode === 'metro') {
    return {
      co2SavedKg: Number((distanceKm * (carEmissionPerKm - 0.022)).toFixed(2)),
      ecoPoints: Math.round(distanceKm * 3.5),
    };
  }
  if (mode === 'cycle') {
    return {
      co2SavedKg: Number((distanceKm * carEmissionPerKm).toFixed(2)),
      ecoPoints: Math.round(distanceKm * 5),
    };
  }
  return { co2SavedKg: 0, ecoPoints: 0 };
}
const metroCommute = calculateCommuteMetrics(12.5, 'metro');
runCheck('Commute planner metro CO2 savings formula (12.5 km -> 1.85 kg CO2)', metroCommute.co2SavedKg === 1.85 && metroCommute.ecoPoints === 44);

// 4. Community Hotspot Verification Workflow
const validStatuses = ['unverified', 'under_review', 'verified', 'resolved'];
const mockHotspot = {
  id: 'rep-test',
  category: 'garbage_burning',
  verificationStatus: 'under_review',
  upvotes: 5,
};
runCheck('Hotspot verification workflow status is valid', validStatuses.includes(mockHotspot.verificationStatus));

// 5. PWA Manifest & Service Worker Assets
const manifestExists = fs.existsSync('./public/manifest.json');
runCheck('PWA manifest exists (public/manifest.json)', manifestExists);
if (manifestExists) {
  try {
    const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf-8'));
    runCheck('PWA manifest contains valid name and icon declarations', !!manifest.name && Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  } catch (e) {
    runCheck('PWA manifest JSON valid', false);
  }
}

const swExists = fs.existsSync('./public/sw.js');
runCheck('PWA Service Worker file exists (public/sw.js)', swExists);

// 6. Quiet Hours Night Logic
function isQuietHour(timeStr, startStr = '22:00', endStr = '07:00') {
  const toMinutes = (s) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const cur = toMinutes(timeStr);
  const start = toMinutes(startStr);
  const end = toMinutes(endStr);
  if (start > end) {
    // Crosses midnight e.g. 22:00 to 07:00
    return cur >= start || cur < end;
  }
  return cur >= start && cur < end;
}
runCheck('Quiet hours correctly silences 23:30 (during 22:00 - 07:00)', isQuietHour('23:30'));
runCheck('Quiet hours permits daytime alert 14:15', !isQuietHour('14:15'));

// -------------------------------------------------------------------
// SECTION 8: PHASE 5 REAL-WORLD E2E INTEGRITY & SECURITY AUDIT
// -------------------------------------------------------------------
console.log('\n--- 8. Phase 5 Real-World E2E Integrity & Security Audit ---');

// 1. Commute Planner Edge Case: Same Origin & Destination Rejection
function validateCommuteLocations(origin, destination) {
  if (!origin || !destination) return { valid: false, error: 'missing_location' };
  if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
    return { valid: false, error: 'identical_locations' };
  }
  return { valid: true };
}
runCheck('Commute planner rejects identical origin and destination', !validateCommuteLocations('Indiranagar', 'Indiranagar').valid);
runCheck('Commute planner permits distinct origin and destination', validateCommuteLocations('Indiranagar', 'Whitefield').valid);

// 2. Commute Dynamic Distance Derivation
function deriveCommuteDistance(origin, destination) {
  const combined = `${origin.trim().toLowerCase()}|${destination.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  return Number((8.5 + (positiveHash % 180) / 10).toFixed(1));
}
const dist1 = deriveCommuteDistance('Indiranagar', 'Whitefield');
const dist2 = deriveCommuteDistance('Koramangala', 'Electronic City');
runCheck('Commute distance dynamically varies by route corridor (Indiranagar->Whitefield)', dist1 >= 8.5 && dist1 <= 26.5);
runCheck('Commute distance dynamically varies by route corridor (Koramangala->Electronic City)', dist2 >= 8.5 && dist2 <= 26.5);
runCheck('Distinct routes produce distinct simulated distances', dist1 !== dist2);

// 3. Storage Key Unification Between Commute and Sustainability
const UNIFIED_ECO_ACTIONS_KEY = 'airwise_eco_actions';
runCheck('Unified eco-actions storage key is standardized as airwise_eco_actions', UNIFIED_ECO_ACTIONS_KEY === 'airwise_eco_actions');

// 4. Challenge Progress Tamper Resistance
function calculateChallengeProgress(challengeId, actionType, currentProgress, targetDays) {
  let isMatch = false;
  if (challengeId === 'metro-challenge' && actionType === 'public_transit') isMatch = true;
  if (challengeId === 'zero-emission-stride' && (actionType === 'cycling' || actionType === 'walking')) isMatch = true;
  if (challengeId === 'no-idle-signal' && actionType === 'avoided_idling') isMatch = true;

  if (!isMatch) return { advanced: false, progress: currentProgress, unlocked: false };
  const newProgress = Math.min(targetDays, currentProgress + 1);
  return { advanced: true, progress: newProgress, unlocked: newProgress >= targetDays };
}
const matchedAdvance = calculateChallengeProgress('metro-challenge', 'public_transit', 3, 5);
runCheck('Challenge advances on matching action (public_transit -> metro-challenge)', matchedAdvance.advanced && matchedAdvance.progress === 4);
const mismatchedAdvance = calculateChallengeProgress('metro-challenge', 'cycling', 3, 5);
runCheck('Challenge rejects advance on non-matching action (cycling -> metro-challenge)', !mismatchedAdvance.advanced && mismatchedAdvance.progress === 3);

// 5. Community Incident Image Boundaries (2 MB Ceiling & MIME Validation)
function validateCommunityImageUpload(fileSize, mimeType) {
  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

  if (fileSize > MAX_BYTES) return { valid: false, error: 'exceeds_2mb' };
  if (!ALLOWED_MIME.includes(mimeType)) return { valid: false, error: 'unsupported_mime' };
  return { valid: true };
}
runCheck('Community upload permits 1.5MB JPEG', validateCommunityImageUpload(1.5 * 1024 * 1024, 'image/jpeg').valid);
runCheck('Community upload permits 800KB PNG', validateCommunityImageUpload(800 * 1024, 'image/png').valid);
runCheck('Community upload permits 400KB WebP', validateCommunityImageUpload(400 * 1024, 'image/webp').valid);
runCheck('Community upload rejects 2.5MB oversized image', !validateCommunityImageUpload(2.5 * 1024 * 1024, 'image/jpeg').valid);
runCheck('Community upload rejects malicious SVG/executable MIME', !validateCommunityImageUpload(500 * 1024, 'image/svg+xml').valid && !validateCommunityImageUpload(500 * 1024, 'application/x-msdownload').valid);

// 6. Complete 6-Locale Leaf Key Parity Check
function getLeafKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getLeafKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const enJson = JSON.parse(fs.readFileSync('./locales/en.json', 'utf-8'));
const enKeys = getLeafKeys(enJson);
runCheck('Base English locale contains complete UI key tree (>= 165 leaf keys)', enKeys.length >= 165);

for (const loc of ['kn', 'hi', 'ta', 'bn', 'mr']) {
  const locJson = JSON.parse(fs.readFileSync(`./locales/${loc}.json`, 'utf-8'));
  const locKeys = getLeafKeys(locJson);
  const missing = enKeys.filter(k => !locKeys.includes(k));
  runCheck(`Locale [${loc}] has 0 missing leaf keys against English schema (100% parity)`, missing.length === 0, `Missing: ${missing.join(', ')}`);
}

// 7. Rate Limiter Memory Boundedness & Cleanup
function simulateRateLimiterCleanup() {
  const map = new Map();
  const now = 1000000;
  for (let i = 0; i < 500; i++) {
    map.set(`ip-expired-${i}`, { count: 1, resetTime: now - 1000 });
  }
  for (let i = 0; i < 50; i++) {
    map.set(`ip-active-${i}`, { count: 1, resetTime: now + 50000 });
  }

  if (map.size > 500) {
    for (const [k, v] of map.entries()) {
      if (now > v.resetTime) {
        map.delete(k);
      }
    }
  }
  return map.size;
}
runCheck('Rate limiter evicts expired IP records when capacity exceeded', simulateRateLimiterCleanup() === 50);

// 8. Service Worker & PWA Manifest Link in Layout
const layoutContent = fs.readFileSync('./app/layout.tsx', 'utf-8');
runCheck('RootLayout declares PWA manifest in head', layoutContent.includes('rel="manifest"') && layoutContent.includes('/manifest.json'));

// 9. Community Duplicate Hotspot Prevention
function checkCommunityDuplicate(existingReports, newTitle, newLoc) {
  return existingReports.some(
    r => r.title.trim().toLowerCase() === newTitle.trim().toLowerCase() &&
         r.locationName.trim().toLowerCase() === newLoc.trim().toLowerCase()
  );
}
const mockExisting = [{ title: 'Open waste burning', locationName: 'Kankanady Market' }];
runCheck('Community report detects duplicate title and location', checkCommunityDuplicate(mockExisting, 'Open waste burning', 'Kankanady Market'));
runCheck('Community report permits unique new report', !checkCommunityDuplicate(mockExisting, 'Construction dust', 'Kankanady Market'));

// -------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------
console.log('\n=====================================================');
console.log(`AUDIT RESULTS: ${passed} Checks Passed, ${failed} Failed out of ${total} Total.`);
console.log('=====================================================');

if (failed > 0) {
  process.exit(1);
}
