'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sliders, 
  Save, 
  CheckCircle2, 
  HeartPulse, 
  Clock, 
  Train, 
  RotateCcw,
  MapPin
} from 'lucide-react';
import { DEFAULT_PREFERENCES, UserPreferences } from '@/lib/store';
import LocationSearch from '@/components/LocationSearch';
import { useLocation } from '@/context/LocationContext';

export default function PreferencesPage() {
  const { currentLocation, setLocation } = useLocation();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFF] p-1.5 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
            <Image
              src="/airwise-logo-icon.png"
              alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
              width={42}
              height={42}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-2.5 py-0.5 rounded-[6.4px]">
                <Sliders className="w-3.5 h-3.5 text-[#4BA9FF]" />
                User Profile Configuration
              </span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Personalization & Sensitivity Settings
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              Customize your schedule and health sensitivity profile to tailor My Day, Air-Smart™ plans.
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-3 py-2 rounded-[6.8px]">
            <CheckCircle2 className="w-4 h-4 text-[#4BA9FF]" />
            <span>Preferences Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Default Saved City / Area */}
        <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center border border-[#677580]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#F9FAFF] leading-[20px]">
                Primary Monitored Location
              </h3>
              <p className="text-[10px] text-[#D0D2D7]">
                Your home base city or locality used across all dashboard and planner views
              </p>
            </div>
          </div>

          <div className="pt-2">
            <LocationSearch />
          </div>
        </div>

        {/* Health Sensitivity Profile */}
        <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center border border-[#677580]">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#F9FAFF] leading-[20px]">
                Health & Sensitivity Profile
              </h3>
              <p className="text-[10px] text-[#D0D2D7]">
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
                className={`p-3.5 rounded-[6.8px] border flex items-start gap-3 cursor-pointer transition-colors ${
                  prefs.sensitivityProfile === prof.id
                    ? 'bg-[#296AE1] border-[#4BA9FF] text-[#F9FAFF]'
                    : 'bg-[#23272B] border-[#677580] text-[#D0D2D7] hover:border-[#97A7B6]'
                }`}
              >
                <input
                  type="radio"
                  name="sensitivityProfile"
                  value={prof.id}
                  checked={prefs.sensitivityProfile === prof.id}
                  onChange={(e: any) => setPrefs({ ...prefs, sensitivityProfile: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-[12px] text-[#F9FAFF]">{prof.title}</div>
                  <div className="text-[10px] text-[#CCD3D7] mt-0.5">{prof.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Daily Schedule Parameters */}
        <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center border border-[#677580]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#F9FAFF] leading-[20px]">
                Daily Routine & Exercise Timing
              </h3>
              <p className="text-[10px] text-[#D0D2D7]">
                Times used to generate My Day activity window suggestions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                Typical Wake-Up
              </label>
              <input
                type="time"
                value={prefs.wakeUpTime}
                onChange={(e) => setPrefs({ ...prefs, wakeUpTime: e.target.value })}
                className="aqi-input w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
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
                className="aqi-input w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
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
                className="aqi-input w-full"
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
        <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center border border-[#677580]">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#F9FAFF] leading-[20px]">
                Work Commute Preferences
              </h3>
              <p className="text-[10px] text-[#D0D2D7]">
                Determines exposure risk and sustainable alternatives
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
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
                className="aqi-input w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                Primary Commute Vehicle
              </label>
              <select
                value={prefs.commuteMode}
                onChange={(e: any) => setPrefs({ ...prefs, commuteMode: e.target.value })}
                className="aqi-input w-full"
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
            className="aqi-btn-secondary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="aqi-btn-primary"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
