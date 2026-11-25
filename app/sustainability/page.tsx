'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Leaf, 
  Award, 
  Flame, 
  PlusCircle, 
  Footprints, 
  Bike, 
  Bus, 
  Car, 
  CheckCircle,
  Info
} from 'lucide-react';
import { EcoAction, INITIAL_ECO_ACTIONS } from '@/lib/store';

export default function SustainabilityPage() {
  const [actions, setActions] = useState<EcoAction[]>(INITIAL_ECO_ACTIONS);
  const [showModal, setShowModal] = useState(false);
  
  // New Action Form State
  const [actionType, setActionType] = useState<EcoAction['type']>('public_transit');
  const [title, setTitle] = useState('');
  const [distance, setDistance] = useState('8');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('airwise_eco_actions');
      if (stored) {
        setActions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const saveActions = (newActions: EcoAction[]) => {
    setActions(newActions);
    try {
      localStorage.setItem('airwise_eco_actions', JSON.stringify(newActions));
    } catch (e) {
      console.warn(e);
    }
  };

  const calculateStreak = (actionList: EcoAction[]): number => {
    if (actionList.length === 0) return 0;
    const uniqueDays = new Set(
      actionList.map((a) => new Date(a.timestamp).toISOString().split('T')[0])
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!sortedDays.includes(today) && !sortedDays.includes(yesterday)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(sortedDays[0]);

    for (let i = 0; i < sortedDays.length; i++) {
      const expectedStr = checkDate.toISOString().split('T')[0];
      if (sortedDays.includes(expectedStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    return Math.max(streak, 1);
  };

  const totalPoints = actions.reduce((sum, a) => sum + a.ecoPoints, 0);
  const totalCo2Saved = actions.reduce((sum, a) => sum + a.estimatedCo2SavedKg, 0);
  const currentStreakDays = calculateStreak(actions);

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    const distNum = Math.max(0.1, Math.min(200, parseFloat(distance) || 5));
    const normalizedTitle = (title.trim() || `${actionType.replace('_', ' ').toUpperCase()} Trip`).slice(0, 100);

    const recentDuplicate = actions.find((a) => {
      const timeDiffMs = Date.now() - new Date(a.timestamp).getTime();
      return timeDiffMs < 120000 && a.title.toLowerCase() === normalizedTitle.toLowerCase();
    });

    if (recentDuplicate) {
      alert('A similar action was already logged moments ago. Duplicate prevented.');
      return;
    }

    let co2Estimate = 0;
    let points = 20;

    if (actionType === 'public_transit') {
      co2Estimate = Math.round(distNum * 0.14 * 10) / 10;
      points = Math.round(distNum * 3);
    } else if (actionType === 'cycling') {
      co2Estimate = Math.round(distNum * 0.18 * 10) / 10;
      points = Math.round(distNum * 5);
    } else if (actionType === 'walking') {
      co2Estimate = Math.round(distNum * 0.18 * 10) / 10;
      points = Math.round(distNum * 6);
    } else if (actionType === 'avoided_idling') {
      co2Estimate = 0.3;
      points = 15;
    } else if (actionType === 'carpooling') {
      co2Estimate = Math.round(distNum * 0.09 * 10) / 10;
      points = Math.round(distNum * 2.5);
    }

    const newAction: EcoAction = {
      id: `act-${Date.now()}`,
      type: actionType,
      title: normalizedTitle,
      distanceKm: distNum,
      estimatedCo2SavedKg: co2Estimate,
      ecoPoints: points,
      timestamp: new Date().toISOString(),
      notes,
    };

    saveActions([newAction, ...actions]);
    setTitle('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
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
                <Leaf className="w-3.5 h-3.5 text-[#4BA9FF]" />
                Sustainability & Emission Abatement
              </span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Eco-Action & Habit Tracker
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              Log sustainable mobility decisions to reduce personal urban tailpipe exposure.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="aqi-btn-primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Eco Action</span>
        </button>
      </div>

      {/* Gamified Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[10.88px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center shrink-0 border border-[#677580]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#D0D2D7]">
              Total Eco-Points
            </div>
            <div className="text-[24px] font-bold text-[#F9FAFF] mt-0.5 leading-[32.4px]">
              {totalPoints} PTS
            </div>
            <div className="text-[10px] text-[#4BA9FF] font-semibold mt-0.5">
              Top 12% in Clean Mobility
            </div>
          </div>
        </div>

        <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[10.88px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center shrink-0 border border-[#677580]">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#D0D2D7]">
              Estimated CO2 Avoided
            </div>
            <div className="text-[24px] font-bold text-[#F9FAFF] mt-0.5 leading-[32.4px]">
              {totalCo2Saved.toFixed(1)} kg
            </div>
            <div className="text-[10px] text-[#CCD3D7] font-medium mt-0.5">
              *Model estimate vs. solo car
            </div>
          </div>
        </div>

        <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[10.88px] bg-[#23272B] text-[#EA8C34] flex items-center justify-center shrink-0 border border-[#677580]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#D0D2D7]">
              Active Streak
            </div>
            <div className="text-[24px] font-bold text-[#F9FAFF] mt-0.5 leading-[32.4px]">
              {currentStreakDays} Days
            </div>
            <div className="text-[10px] text-[#EA8C34] font-semibold mt-0.5">
              Consistent sustainable choices
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer Banner */}
      <div className="bg-[#23272B] border border-[#677580] p-4 rounded-[6.8px] flex items-start gap-3 text-[10px] text-[#D0D2D7]">
        <Info className="w-4 h-4 text-[#4BA9FF] shrink-0 mt-0.5" />
        <p className="leading-[15.2px]">
          <strong>Carbon Methodology Transparency:</strong> Emissions avoided are calculated as conservative estimates comparing active or mass transit modes with average single-occupancy petrol/diesel vehicles (~180 g CO2/km). They represent modeled estimates for personal awareness rather than certified carbon offsets.
        </p>
      </div>

      {/* Activity History Feed */}
      <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580]">
        <h3 className="font-bold text-[15px] text-[#F9FAFF] mb-4 leading-[20px]">
          Recent Sustainable Activities ({actions.length})
        </h3>

        <div className="divide-y divide-[#677580]">
          {actions.map((act) => (
            <div key={act.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center shrink-0 border border-[#677580]">
                  {act.type === 'walking' && <Footprints className="w-5 h-5 text-[#4BA9FF]" />}
                  {act.type === 'cycling' && <Bike className="w-5 h-5 text-[#4BA9FF]" />}
                  {act.type === 'public_transit' && <Bus className="w-5 h-5 text-[#4BA9FF]" />}
                  {act.type === 'carpooling' && <Car className="w-5 h-5 text-[#4BA9FF]" />}
                  {act.type === 'avoided_idling' && <CheckCircle className="w-5 h-5 text-[#EA8C34]" />}
                </div>

                <div>
                  <h4 className="font-bold text-[12px] text-[#F9FAFF] leading-[17.28px]">
                    {act.title}
                  </h4>
                  <div className="text-[10px] text-[#D0D2D7] mt-0.5 flex items-center gap-2">
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    {act.distanceKm && <span>• {act.distanceKm} km</span>}
                    {act.notes && <span>• "{act.notes}"</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[14px] font-bold text-[#4BA9FF]">
                  +{act.ecoPoints} PTS
                </div>
                <div className="text-[10px] text-[#CCD3D7]">
                  ~{act.estimatedCo2SavedKg} kg CO2e saved
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Logging Action */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#23272B]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#39414B] rounded-[12px] border border-[#677580] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-[18px] text-[#F9FAFF] leading-[24px]">
              Log Sustainable Transportation Action
            </h3>

            <form onSubmit={handleAddAction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Activity Type
                </label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="aqi-input w-full"
                >
                  <option value="public_transit">Public Transit (Metro / Electric Bus)</option>
                  <option value="cycling">Bicycle Commute</option>
                  <option value="walking">Walking / Walking Errands</option>
                  <option value="carpooling">Carpooling with Colleagues</option>
                  <option value="avoided_idling">Engine Switched Off at Long Signals</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Trip Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Metro ride to work instead of solo driving"
                  className="aqi-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Distance Traveled (km)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="200"
                  step="0.5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="aqi-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. avoided 40 mins of traffic smog"
                  className="aqi-input w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="aqi-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aqi-btn-primary"
                >
                  Record Eco-Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
