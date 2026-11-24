'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  Sun,
  Activity,
  Train
} from 'lucide-react';
import { POPULAR_LOCATIONS, AirQualityResponse } from '@/lib/air-quality-service';
import { DEFAULT_PREFERENCES, UserPreferences } from '@/lib/store';
import { generateMyDayPlan, DailyPersonalizedPlan } from '@/lib/my-day-planner';

export default function MyDayPage() {
  const [selectedLoc, setSelectedLoc] = useState('delhi-anand-vihar');
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [plan, setPlan] = useState<DailyPersonalizedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage if exists
  useEffect(() => {
    try {
      const stored = localStorage.getItem('airwise_user_preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Fetch air quality
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/air-quality?locId=${selectedLoc}`);
        const json = await res.json();
        if (json.success && json.data) {
          setAirData(json.data);
          const generated = generateMyDayPlan(json.data.hourly, preferences);
          setPlan(generated);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLoc, preferences]);

  return (
    <div className="space-y-6">
      {/* Signature Feature Hero */}
      <div className="bg-[#39414B] border border-[#677580] text-[#F9FAFF] p-6 sm:p-8 rounded-[12px] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F9FAFF] bg-[#296AE1] px-3 py-1 rounded-[6.4px] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#4BA9FF]" />
            Signature Intelligent Planner
          </div>
          <h2 className="text-[28px] font-extrabold tracking-tight leading-[32.4px]">
            My Day, Air-Smart™
          </h2>
          <p className="text-[12px] text-[#D0D2D7] mt-2 leading-[17.28px]">
            Align your personal daily schedule with atmospheric chemistry. We analyze hourly forecasts to identify your lowest pollution windows for exercise, commute, and home ventilation.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[10px] font-semibold">
            <div className="flex items-center gap-2 bg-[#23272B] border border-[#677580] px-3.5 py-1.5 rounded-[6.8px]">
              <Clock className="w-3.5 h-3.5 text-[#4BA9FF]" />
              <span>Exercise: {preferences.exerciseSchedule.time} ({preferences.exerciseSchedule.type.replace('-', ' ')})</span>
            </div>
            <div className="flex items-center gap-2 bg-[#23272B] border border-[#677580] px-3.5 py-1.5 rounded-[6.8px]">
              <Train className="w-3.5 h-3.5 text-[#4BA9FF]" />
              <span>Commute: {preferences.workSchedule.start} ({preferences.commuteMode})</span>
            </div>
            <Link
              href="/preferences"
              className="inline-flex items-center gap-1 text-[#4BA9FF] hover:underline"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit My Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Control & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-4 rounded-[12px] border border-[#677580]">
        <div className="flex items-center gap-2 text-[12px] font-bold text-[#F9FAFF]">
          <MapPin className="w-4 h-4 text-[#4BA9FF]" />
          <span>Active Location:</span>
          <select
            value={selectedLoc}
            onChange={(e) => setSelectedLoc(e.target.value)}
            className="bg-[#23272B] border border-[#677580] text-[#F9FAFF] text-[12px] font-semibold rounded-[6.8px] px-3 py-1.5 focus:border-[#4BA9FF] cursor-pointer"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[10px] text-[#D0D2D7]">
          Updated: <strong className="text-[#F9FAFF]">{airData ? new Date(airData.lastUpdated).toLocaleTimeString() : '...'}</strong>
        </div>
      </div>

      {/* Recommended Day Windows Grid */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Optimal Window */}
          <div className="bg-[#39414B] border border-[#3D7AB2] p-5 rounded-[12px] flex items-start gap-4">
            <div className="w-10 h-10 rounded-[6.8px] bg-[#296AE1] text-[#F9FAFF] flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5 text-[#4BA9FF]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#4BA9FF]">
                Best Outdoor Opportunity
              </div>
              <div className="text-[18px] font-bold text-[#F9FAFF] mt-0.5 leading-[24px]">
                {plan.bestOutdoorWindow.start} – {plan.bestOutdoorWindow.end}
              </div>
              <p className="text-[12px] text-[#D0D2D7] mt-1 leading-[17.28px]">
                Solar convective mixing thins ground pollution. Target AQI drops to ~{plan.bestOutdoorWindow.expectedAQI}. Safest window for outdoor exercise, shopping or airing living rooms.
              </p>
            </div>
          </div>

          {/* Highest Risk Smog Window */}
          <div className="bg-[#39414B] border border-[#EA8C34] p-5 rounded-[12px] flex items-start gap-4">
            <div className="w-10 h-10 rounded-[6.8px] bg-[#23272B] text-[#EA8C34] border border-[#EA8C34] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#EA8C34]">
                Peak Exposure Window
              </div>
              <div className="text-[18px] font-bold text-[#F9FAFF] mt-0.5 leading-[24px]">
                {plan.highestPollutionWindow.start} – {plan.highestPollutionWindow.end}
              </div>
              <p className="text-[12px] text-[#D0D2D7] mt-1 leading-[17.28px]">
                Atmospheric boundary layer traps particulate exhaust. Expected AQI ~{plan.highestPollutionWindow.expectedAQI}. Keep windows closed and avoid intense outdoor jogging.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Activity Recommendations Breakdown */}
      <div className="space-y-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#F9FAFF] tracking-tight leading-[20px]">
            Schedule Alignment & Recommendations
          </h3>
          <p className="text-[10px] text-[#D0D2D7]">
            Dynamic adaptation of your programmed daily activities with specific environmental justification
          </p>
        </div>

        {plan?.activities.map((act) => {
          const isReschedule = act.status === 'reschedule';
          const isCaution = act.status === 'caution';

          return (
            <div
              key={act.id}
              className={`p-6 rounded-[12px] border transition-colors duration-150 ${
                isReschedule
                  ? 'bg-[#39414B] border-[#E5484D]'
                  : isCaution
                  ? 'bg-[#39414B] border-[#EA8C34]'
                  : 'bg-[#39414B] border-[#677580]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#677580]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-[6.8px] flex items-center justify-center text-[#F9FAFF] ${
                      isReschedule
                        ? 'bg-[#E5484D]'
                        : isCaution
                        ? 'bg-[#EA8C34]'
                        : 'bg-[#296AE1]'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px] text-[#F9FAFF] leading-[19.2px]">
                      {act.activityName}
                    </h4>
                    <span className="text-[10px] text-[#D0D2D7]">
                      Planned Time: <strong className="text-[#F9FAFF]">{act.plannedTime}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6.4px] ${
                      isReschedule
                        ? 'bg-[#E5484D] text-[#F9FAFF]'
                        : isCaution
                        ? 'bg-[#EA8C34] text-[#23272B]'
                        : 'bg-[#296AE1] text-[#F9FAFF]'
                    }`}
                  >
                    {isReschedule ? 'Reschedule Advised' : isCaution ? 'Caution Advised' : 'Optimal'}
                  </span>
                </div>
              </div>

              {/* Justification & Analysis */}
              <div className="mt-4 space-y-3">
                <div>
                  <h5 className="text-[12px] font-bold text-[#F9FAFF]">
                    {act.headline}
                  </h5>
                  <p className="text-[12px] text-[#D0D2D7] mt-1 leading-[17.28px]">
                    {act.explanation}
                  </p>
                </div>

                {/* Practical Action Items */}
                <div className="bg-[#23272B] p-3.5 rounded-[6.8px] border border-[#677580] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#4BA9FF]">
                    Recommended Actions:
                  </div>
                  <ul className="space-y-1 text-[12px] text-[#D0D2D7]">
                    {act.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#4BA9FF] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Indoor Alternative or Sustainable choice */}
                {(act.indoorAlternative || act.sustainableChoice) && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 text-[10px]">
                    {act.indoorAlternative && (
                      <div className="flex-1 bg-[#23272B] p-2.5 rounded-[6.4px] border border-[#677580]">
                        <span className="font-bold text-[#F9FAFF]">Indoor Alternative: </span>
                        <span className="text-[#D0D2D7]">{act.indoorAlternative}</span>
                      </div>
                    )}
                    {act.sustainableChoice && (
                      <div className="flex-1 bg-[#23272B] p-2.5 rounded-[6.4px] border border-[#3D7AB2] text-[#F9FAFF]">
                        <span className="font-bold text-[#4BA9FF]">Eco Action: </span>
                        <span className="text-[#D0D2D7]">{act.sustainableChoice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
