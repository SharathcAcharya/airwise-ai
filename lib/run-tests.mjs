import { calculateIndianAQI, calculateSubIndex, getAQICategory } from './aqi-engine.ts';

console.log('--- RUNNING AIRWISE AI TEST SUITE ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${message}`);
  } else {
    failed++;
    console.error(`[FAIL] ${message}`);
  }
}

// Test 1: Sub-index calculations
const subPm25 = calculateSubIndex('pm25', 15);
assert(subPm25.isValid && subPm25.subIndex === 25, 'PM2.5 @ 15 µg/m³ is sub-index 25 (Good)');

const subPm25Poor = calculateSubIndex('pm25', 120);
assert(subPm25Poor.isValid && subPm25Poor.subIndex === 300, 'PM2.5 @ 120 µg/m³ is sub-index 300 (Poor)');

// Test 2: CO Unit conversion
const coTest = calculateIndianAQI({
  pm25: 50,
  pm10: 80,
  no2: 40,
  co: 2000,
  coUnit: 'ug/m3',
});
assert(coTest.subIndices.co.value === 2.0, 'CO conversion from µg/m³ to mg/m³ is correct (2.0 mg/m³)');

// Test 3: CPCB Rule: Less than 3 pollutants yields no composite AQI
const rule2Pollutants = calculateIndianAQI({ pm25: 75, pm10: 120 });
assert(!rule2Pollutants.isReliable && rule2Pollutants.aqi === null, 'Less than 3 pollutants returns null composite AQI');

// Test 4: CPCB Rule: 3 pollutants without PM2.5 or PM10 yields no composite AQI
const ruleNoPM = calculateIndianAQI({ no2: 60, so2: 30, co: 1.5 });
assert(!ruleNoPM.isReliable && ruleNoPM.aqi === null, 'Missing PM2.5/PM10 returns null composite AQI');

// Test 5: Valid 3 pollutants with PM2.5
const validSet = calculateIndianAQI({ pm25: 110, no2: 50, so2: 25 });
assert(validSet.isReliable && validSet.aqi !== null && validSet.dominantPollutant === 'pm25', 'Valid 3 pollutants calculates composite AQI with dominant PM2.5');

// Test 6: Extreme upper threshold
const extreme = calculateSubIndex('pm25', 600);
assert(extreme.isValid && extreme.subIndex === 500 && extreme.category === 'Severe', 'Extreme values cap safely at 500 Severe');

console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) process.exit(1);
