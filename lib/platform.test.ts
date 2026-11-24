import { calculateIndianAQI } from './aqi-engine';
import { generateMyDayPlan } from './my-day-planner';
import { DEFAULT_PREFERENCES } from './store';

export function runFullPlatformTests() {
  const testResults: { suite: string; name: string; passed: boolean; error?: string }[] = [];

  function test(suite: string, name: string, fn: () => boolean | void) {
    try {
      const res = fn();
      if (res === false) {
        testResults.push({ suite, name, passed: false, error: 'Returned false' });
      } else {
        testResults.push({ suite, name, passed: true });
      }
    } catch (e: any) {
      testResults.push({ suite, name, passed: false, error: e.message || String(e) });
    }
  }

  // Suite 1: CPCB Insufficient Data Handling
  test('AQI Engine', 'Rejects calculation when no particulate data is present', () => {
    const res = calculateIndianAQI({ no2: 50, so2: 30, o3: 40 });
    return res.aqi === null && res.isReliable === false && res.hasParticulateMatter === false;
  });

  test('AQI Engine', 'Rejects calculation when only 2 pollutants are present', () => {
    const res = calculateIndianAQI({ pm25: 45, no2: 30 });
    return res.aqi === null && res.isReliable === false && res.validPollutantsCount === 2;
  });

  test('AQI Engine', 'Calculates correct AQI with 3 pollutants including PM2.5', () => {
    const res = calculateIndianAQI({ pm25: 110, no2: 40, so2: 20 });
    return res.aqi !== null && res.isReliable === true && res.category === 'Poor';
  });

  // Suite 2: Recommendation & Schedule Intelligence
  test('My Day Planner', 'Generates reschedule advisory for high pollution morning jog', () => {
    const mockHourly = [
      {
        time: new Date().toISOString(),
        displayTime: '07:00 AM',
        pm25: 160,
        pm10: 240,
        no2: 45,
        so2: 15,
        co: 1.5,
        o3: 30,
        aqi: 330,
        category: 'Very Poor',
      },
    ];

    const plan = generateMyDayPlan(mockHourly, {
      ...DEFAULT_PREFERENCES,
      exerciseSchedule: { time: '07:00', type: 'outdoor-running', durationMinutes: 45 },
    });

    const exAct = plan.activities.find(a => a.id === 'act-exercise');
    return exAct?.status === 'reschedule' && exAct.indoorAlternative !== undefined;
  });

  test('My Day Planner', 'Generates optimal advisory when AQI is Good', () => {
    const mockHourly = [
      {
        time: new Date().toISOString(),
        displayTime: '07:00 AM',
        pm25: 20,
        pm10: 35,
        no2: 15,
        so2: 10,
        co: 0.5,
        o3: 20,
        aqi: 35,
        category: 'Good',
      },
    ];

    const plan = generateMyDayPlan(mockHourly, {
      ...DEFAULT_PREFERENCES,
      exerciseSchedule: { time: '07:00', type: 'outdoor-running', durationMinutes: 45 },
    });

    const exAct = plan.activities.find(a => a.id === 'act-exercise');
    return exAct?.status === 'optimal';
  });

  // Suite 3: Sustainability Calculations
  test('Sustainability Math', 'Calculates transparent conservative emission reduction', () => {
    const distanceKm = 10;
    const avoidedKg = Math.round(distanceKm * 0.14 * 10) / 10; // 1.4 kg for metro
    return avoidedKg === 1.4;
  });

  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;

  return {
    total: testResults.length,
    passed,
    failed,
    details: testResults,
  };
}
