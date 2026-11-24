'use client';

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Award, 
  Flame, 
  PlusCircle, 
  TrendingUp, 
  Footprints, 
  Bike, 
  Bus, 
  Car, 
  CheckCircle,
  Info,
  Calendar
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

  // Load from local storage
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

  // Dynamic streak calculation based on unique days of logged actions
  const calculateStreak = (actionList: EcoAction[]): number => {
    if (actionList.length === 0) return 0;
    const uniqueDays = new Set(
      actionList.map((a) => new Date(a.timestamp).toISOString().split('T')[0])
    );
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If no action logged today or yesterday, streak is broken
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

  // Calculations
  const totalPoints = actions.reduce((sum, a) => sum + a.ecoPoints, 0);
  const totalCo2Saved = actions.reduce((sum, a) => sum + a.estimatedCo2SavedKg, 0);
  const currentStreakDays = calculateStreak(actions);

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    const distNum = Math.max(0.1, Math.min(200, parseFloat(distance) || 5));
    const normalizedTitle = (title.trim() || `${actionType.replace('_', ' ').toUpperCase()} Trip`).slice(0, 100);

    // Prevent immediate duplicate submissions within last 2 minutes with identical title
    const recentDuplicate = actions.find((a) => {
      const timeDiffMs = Date.now() - new Date(a.timestamp).getTime();
      return timeDiffMs < 120000 && a.title.toLowerCase() === normalizedTitle.toLowerCase();
    });

    if (recentDuplicate) {
      alert('A similar action was already logged moments ago. Duplicate prevented.');
      return;
    }

    // Environmental calculation factors (transparent estimates based on Indian urban transport baseline)
    // Average ICE car emissions ~ 180 g CO2/km
    // Metro / Bus avoids ~ 140 g CO2/km compared to solo car
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
      title: title || `${actionType.replace('_', ' ').toUpperCase()} Trip`,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Sustainability & Emission Abatement
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Eco-Action & Habit Tracker
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Log sustainable mobility decisions to reduce personal urban tailpipe exposure.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Eco Action</span>
        </button>
      </div>

      {/* Gamified Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              Total Eco-Points
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {totalPoints} PTS
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Top 12% in Clean Mobility
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              Estimated CO2 Avoided
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {totalCo2Saved.toFixed(1)} kg
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              *Model estimate vs. solo car
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              Active Streak
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {currentStreakDays} Days
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
              Consistent sustainable choices
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Carbon Methodology Transparency:</strong> Emissions avoided are calculated as conservative estimates comparing active or mass transit modes with average single-occupancy petrol/diesel vehicles (~180 g CO2/km). They represent modeled estimates for personal awareness rather than certified carbon offsets.
        </p>
      </div>

      {/* Activity History Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 mb-4">
          Recent Sustainable Activities ({actions.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {actions.map((act) => (
            <div key={act.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                  {act.type === 'walking' && <Footprints className="w-5 h-5 text-emerald-600" />}
                  {act.type === 'cycling' && <Bike className="w-5 h-5 text-emerald-600" />}
                  {act.type === 'public_transit' && <Bus className="w-5 h-5 text-emerald-600" />}
                  {act.type === 'carpooling' && <Car className="w-5 h-5 text-emerald-600" />}
                  {act.type === 'avoided_idling' && <CheckCircle className="w-5 h-5 text-amber-600" />}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {act.title}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    {act.distanceKm && <span>• {act.distanceKm} km</span>}
                    {act.notes && <span>• "{act.notes}"</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-700">
                  +{act.ecoPoints} PTS
                </div>
                <div className="text-[11px] text-slate-500">
                  ~{act.estimatedCo2SavedKg} kg CO2e saved
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Logging Action */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              Log Sustainable Transportation Action
            </h3>

            <form onSubmit={handleAddAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Activity Type
                </label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                >
                  <option value="public_transit">Public Transit (Metro / Electric Bus)</option>
                  <option value="cycling">Bicycle Commute</option>
                  <option value="walking">Walking / Walking Errands</option>
                  <option value="carpooling">Carpooling with Colleagues</option>
                  <option value="avoided_idling">Engine Switched Off at Long Signals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Trip Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Metro ride to work instead of solo driving"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Distance Traveled (km)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. avoided 40 mins of traffic smog"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
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
