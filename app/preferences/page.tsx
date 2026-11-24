'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  CheckCircle2, 
  HeartPulse, 
  Clock, 
  Train, 
  BellRing,
  RotateCcw
} from 'lucide-react';
import { DEFAULT_PREFERENCES, UserPreferences } from '@/lib/store';

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('airwise_user_preferences');
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('airwise_user_preferences', JSON.stringify(prefs));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFERENCES);
    localStorage.removeItem('airwise_user_preferences');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              User Profile Configuration
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Personalization & Sensitivity Settings
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Customize your schedule and health sensitivity profile to tailor My Day, Air-Smart™ plans.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Health Sensitivity Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Health & Sensitivity Profile
              </h3>
              <p className="text-xs text-slate-500">
                Adjusts warning thresholds for respiratory and cardiovascular sensitivity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { id: 'healthy-adult', title: 'Healthy Adult', desc: 'Standard CPCB thresholds' },
              { id: 'sensitive-asthma', title: 'Asthma / Respiratory Sensitivity', desc: 'Early warning triggered at Moderate AQI > 100' },
              { id: 'child', title: 'Child / Student', desc: 'Heightened sensitivity during outdoor school sports' },
              { id: 'elderly', title: 'Elderly / Cardiac History', desc: 'Restricts vigorous morning cardio above 150 AQI' },
            ].map((prof) => (
              <label
                key={prof.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  prefs.sensitivityProfile === prof.id
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="sensitivityProfile"
                  value={prof.id}
                  checked={prefs.sensitivityProfile === prof.id}
                  onChange={(e: any) => setPrefs({ ...prefs, sensitivityProfile: e.target.value })}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900">{prof.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{prof.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Daily Schedule Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Daily Routine & Exercise Timing
              </h3>
              <p className="text-xs text-slate-500">
                Times used to generate My Day activity window suggestions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Typical Wake-Up
              </label>
              <input
                type="time"
                value={prefs.wakeUpTime}
                onChange={(e) => setPrefs({ ...prefs, wakeUpTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exercise Time
              </label>
              <input
                type="time"
                value={prefs.exerciseSchedule.time}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    exerciseSchedule: { ...prefs.exerciseSchedule, time: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Exercise Form
              </label>
              <select
                value={prefs.exerciseSchedule.type}
                onChange={(e: any) =>
                  setPrefs({
                    ...prefs,
                    exerciseSchedule: { ...prefs.exerciseSchedule, type: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold"
              >
                <option value="outdoor-running">Outdoor Running / Jogging</option>
                <option value="cycling">Outdoor Cycling</option>
                <option value="walking">Brisk Walking</option>
                <option value="indoor-gym">Indoor Gym Training</option>
                <option value="yoga">Indoor Yoga / Stretching</option>
              </select>
            </div>
          </div>
        </div>

        {/* Commute Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
              <Train className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Work Commute Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Determines exposure risk and sustainable alternatives
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Start Time (Morning Rush)
              </label>
              <input
                type="time"
                value={prefs.workSchedule.start}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    workSchedule: { ...prefs.workSchedule, start: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Commute Vehicle
              </label>
              <select
                value={prefs.commuteMode}
                onChange={(e: any) => setPrefs({ ...prefs, commuteMode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold"
              >
                <option value="metro">Electric Metro / Rapid Rail</option>
                <option value="bus">City Bus (Electric / CNG)</option>
                <option value="two-wheeler">Motorcycle / Scooter</option>
                <option value="bicycle">Bicycle</option>
                <option value="personal-car">Personal Car (Solo)</option>
                <option value="carpool">Shared Carpool</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
