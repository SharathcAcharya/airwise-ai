'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarClock, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  TrendingDown, 
  ArrowRight,
  Sun,
  Activity,
  Footprints,
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
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700/50 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Signature Intelligent Planner
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            My Day, Air-Smart™
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 mt-2 leading-relaxed">
            Transform raw air quality sensor values into a personalized daily schedule. We align your exercise, commute and ventilation routines with atmospheric dispersion cycles.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>Exercise: {preferences.exerciseSchedule.time} ({preferences.exerciseSchedule.type.replace('-', ' ')})</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
              <Train className="w-4 h-4 text-emerald-300" />
              <span>Commute: {preferences.workSchedule.start} ({preferences.commuteMode})</span>
            </div>
            <Link
              href="/preferences"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-white transition-colors underline underline-offset-4"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit My Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Control & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Active Location:</span>
          <select
            value={selectedLoc}
            onChange={(e) => setSelectedLoc(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Updated: <strong className="text-slate-700">{airData ? new Date(airData.lastUpdated).toLocaleTimeString() : '...'}</strong>
        </div>
      </div>

      {/* Recommended Day Windows Grid */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Optimal Window */}
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                Best Outdoor Opportunity
              </div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {plan.bestOutdoorWindow.start} – {plan.bestOutdoorWindow.end}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Solar convective mixing thins ground pollution. Target AQI drops to ~{plan.bestOutdoorWindow.expectedAQI}. Safest window for outdoor exercise, shopping or airing living rooms.
              </p>
            </div>
          </div>

          {/* Highest Risk Smog Window */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-amber-900">
                Peak Exposure Window
              </div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {plan.highestPollutionWindow.start} – {plan.highestPollutionWindow.end}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Atmospheric boundary layer traps particulate exhaust. Expected AQI ~{plan.highestPollutionWindow.expectedAQI}. Keep windows closed and avoid intense outdoor jogging.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Activity Recommendations Breakdown */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Schedule Alignment & Recommendations
          </h3>
          <p className="text-xs text-slate-500">
            Smart adaptation of your programmed daily activities with specific justification
          </p>
        </div>

        {plan?.activities.map((act) => {
          const isOptimal = act.status === 'optimal';
          const isReschedule = act.status === 'reschedule';
          const isCaution = act.status === 'caution';

          return (
            <div
              key={act.id}
              className={`p-6 rounded-2xl border transition-all ${
                isReschedule
                  ? 'bg-red-50/60 border-red-200'
                  : isCaution
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                      isReschedule
                        ? 'bg-red-600'
                        : isCaution
                        ? 'bg-amber-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      {act.activityName}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Planned Time: <strong>{act.plannedTime}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      isReschedule
                        ? 'bg-red-100 text-red-800'
                        : isCaution
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isReschedule ? 'Reschedule Advised' : isCaution ? 'Caution Advised' : 'Optimal'}
                  </span>
                </div>
              </div>

              {/* Justification & Analysis */}
              <div className="mt-4 space-y-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-800">
                    {act.headline}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {act.explanation}
                  </p>
                </div>

                {/* Practical Action Items */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Recommended Actions:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {act.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Indoor Alternative or Sustainable choice */}
                {(act.indoorAlternative || act.sustainableChoice) && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs">
                    {act.indoorAlternative && (
                      <div className="flex-1 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200/60">
                        <span className="font-bold text-slate-800">Indoor Alternative: </span>
                        <span className="text-slate-600">{act.indoorAlternative}</span>
                      </div>
                    )}
                    {act.sustainableChoice && (
                      <div className="flex-1 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200/60 text-emerald-900">
                        <span className="font-bold">Eco Action: </span>
                        <span>{act.sustainableChoice}</span>
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
