import { calculateIndianAQI, calculateSubIndex, getAQICategory } from './aqi-engine';

export function runAQITests() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      results.push({ test: testName, passed: true });
    } else {
      results.push({ test: testName, passed: false, message: detail || 'Assertion failed' });
    }
  }

  // 1. Breakpoint Sub-index calculation tests
  // PM2.5: 0-30 -> 0-50
  const subPm25_15 = calculateSubIndex('pm25', 15);
  assert(subPm25_15.isValid && subPm25_15.subIndex === 25, 'PM2.5 @ 15 µg/m³ should yield sub-index 25 (Good)');

  // PM2.5: 31-60 -> 51-100 (midpoint ~ 45.5 -> ~75)
  const subPm25_60 = calculateSubIndex('pm25', 60);
  assert(subPm25_60.isValid && subPm25_60.subIndex === 100, 'PM2.5 @ 60 µg/m³ should yield sub-index 100 (Satisfactory boundary)');

  // PM2.5: 91-120 -> 201-300
  const subPm25_120 = calculateSubIndex('pm25', 120);
  assert(subPm25_120.isValid && subPm25_120.subIndex === 300, 'PM2.5 @ 120 µg/m³ should yield sub-index 300 (Poor boundary)');

  // PM10: 101-250 -> 101-200
  const subPm10_175 = calculateSubIndex('pm10', 175);
  assert(subPm10_175.isValid && subPm10_175.subIndex === 150, 'PM10 @ 175 µg/m³ should yield sub-index 150 (Moderate)');

  // CO: 10.1 - 17.0 -> 201-300 (e.g. 13.55 -> ~250)
  const subCo_17 = calculateSubIndex('co', 17.0);
  assert(subCo_17.isValid && subCo_17.subIndex === 300, 'CO @ 17 mg/m³ should yield sub-index 300');

  // 2. Unit conversion for CO (from µg/m³ to mg/m³)
  const aqiWithCoUg = calculateIndianAQI({
    pm25: 45,
    pm10: 80,
    no2: 30,
    co: 2000,
    coUnit: 'ug/m3', // 2000 µg/m³ = 2.0 mg/m³ -> subindex 100
  });
  assert(aqiWithCoUg.subIndices.co.value === 2.0, 'CO unit conversion from ug/m3 to mg/m3 works correctly');

  // 3. Category classification test
  assert(getAQICategory(35) === 'Good', 'AQI 35 is Good');
  assert(getAQICategory(85) === 'Satisfactory', 'AQI 85 is Satisfactory');
  assert(getAQICategory(150) === 'Moderate', 'AQI 150 is Moderate');
  assert(getAQICategory(260) === 'Poor', 'AQI 260 is Poor');
  assert(getAQICategory(350) === 'Very Poor', 'AQI 350 is Very Poor');
  assert(getAQICategory(450) === 'Severe', 'AQI 450 is Severe');

  // 4. Missing pollutant / CPCB minimum requirement rules
  // CASE A: Only 2 pollutants (e.g., PM2.5 and PM10) -> Must fail composite AQI
  const only2 = calculateIndianAQI({ pm25: 80, pm10: 120 });
  assert(!only2.isReliable && only2.aqi === null, 'Less than 3 pollutants fails composite AQI as per CPCB requirement');

  // CASE B: 3 pollutants but NO PM2.5 or PM10 (e.g., NO2, SO2, CO) -> Must fail composite AQI
  const noPM = calculateIndianAQI({ no2: 50, so2: 30, co: 1.5 });
  assert(!noPM.isReliable && noPM.aqi === null, '3 pollutants without PM2.5 or PM10 fails CPCB requirement');

  // CASE C: 3 pollutants INCLUDING PM2.5 -> Valid composite AQI
  const valid3 = calculateIndianAQI({ pm25: 110, no2: 45, so2: 25 });
  assert(valid3.isReliable && valid3.aqi !== null, '3 pollutants with PM2.5 produces reliable composite AQI');
  assert(valid3.dominantPollutant === 'pm25', 'PM2.5 is identified as dominant pollutant');

  // CASE D: Dominant pollutant selection when another pollutant is higher
  // PM2.5: 25 (Good ~42), NO2: 220 (Poor ~240), SO2: 30 (Good ~38)
  const domNo2 = calculateIndianAQI({ pm25: 25, no2: 220, so2: 30 });
  assert(domNo2.isReliable && domNo2.dominantPollutant === 'no2', 'Dominant pollutant correctly identified when NO2 is higher than PM2.5');

  // 5. Extreme and Out-of-bounds inputs
  const extremePM25 = calculateSubIndex('pm25', 750);
  assert(extremePM25.isValid && extremePM25.category === 'Severe' && extremePM25.subIndex === 500, 'Extreme PM2.5 capped at 500 Severe');

  const invalidNegative = calculateSubIndex('pm25', -10);
  assert(!invalidNegative.isValid && invalidNegative.subIndex === null, 'Negative pollutant values handled safely');

  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    details: results,
  };
}
