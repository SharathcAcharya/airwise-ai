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
  Info,
  Train,
  ShieldAlert,
  Sparkles,
  Trophy,
  Check,
  Calendar,
  Users
} from 'lucide-react';
import { EcoAction, INITIAL_ECO_ACTIONS, GreenChallenge, INITIAL_CHALLENGES } from '@/lib/store';
import { useLanguage } from '@/context/LanguageContext';

export default function SustainabilityPage() {
  const { t } = useLanguage();

  const [actions, setActions] = useState<EcoAction[]>(INITIAL_ECO_ACTIONS);
  const [challenges, setChallenges] = useState<GreenChallenge[]>(INITIAL_CHALLENGES);
  const [activeTab, setActiveTab] = useState<'tracker' | 'challenges'>('tracker');
  const [showModal, setShowModal] = useState(false);

  // New Action Form State
  const [actionType, setActionType] = useState<EcoAction['type']>('public_transit');
  const [title, setTitle] = useState('');
  const [distance, setDistance] = useState('8');
  const [notes, setNotes] = useState('');

  // Handle URL hash #challenges on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#challenges') {
      setActiveTab('challenges');
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('airwise_eco_actions') || localStorage.getItem('airwise_sustainability_actions');
      if (stored) {
        setActions(JSON.parse(stored));
      }
      const storedChallenges = localStorage.getItem('airwise_green_challenges');
      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const saveActions = (newActions: EcoAction[]) => {
    setActions(newActions);
    try {
      localStorage.setItem('airwise_eco_actions', JSON.stringify(newActions));
      localStorage.setItem('airwise_sustainability_actions', JSON.stringify(newActions));
    } catch (e) {
      console.warn(e);
    }
  };

  const saveChallenges = (newChallenges: GreenChallenge[]) => {
    setChallenges(newChallenges);
    try {
      localStorage.setItem('airwise_green_challenges', JSON.stringify(newChallenges));
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

  const handleJoinChallenge = (id: string) => {
    const updated = challenges.map((c) =>
      c.id === id ? { ...c, isJoined: true } : c
    );
    saveChallenges(updated);
  };

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

    // Advance joined challenges that match this action type
    const updatedChallenges = challenges.map((c) => {
      if (!c.isJoined || c.isCompleted) return c;
      const matchesTransit = (actionType === 'public_transit') && c.category === 'transit';
      const matchesActive = (actionType === 'cycling' || actionType === 'walking') && c.category === 'active_travel';
      const matchesIdling = actionType === 'avoided_idling' && c.category === 'idling';

      if (matchesTransit || matchesActive || matchesIdling) {
        const nextProgress = Math.min(c.targetDays, c.currentProgress + 1);
        const completed = nextProgress >= c.targetDays;
        return {
          ...c,
          currentProgress: nextProgress,
          isCompleted: completed,
        };
      }
      return c;
    });
    saveChallenges(updatedChallenges);

    setTitle('');
    setNotes('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFF] p-1.5 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
            <Image
              src="/airwise-logo-icon.png"
              alt="AIRWISE AI"
              width={42}
              height={42}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-2.5 py-0.5 rounded-[6.4px]">
                <Leaf className="w-3.5 h-3.5 text-[#209040]" />
                {t('sustainability.title', 'Urban Sustainability & Eco-Habits Tracker')}
              </span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Eco-Action & Habit Tracker
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              {t('sustainability.subtitle', 'Track your carbon offsets, earn eco-points, and participate in community clean-air challenges.')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="aqi-btn-primary text-[12px] py-2 px-3.5 flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('sustainability.logNewAction', 'Record Green Action')}</span>
        </button>
      </div>

      {/* View Switcher: Actions Tracker vs Community Challenges */}
      <div className="flex items-center gap-3 border-b border-[#677580] pb-2">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`pb-2 px-3 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'tracker'
              ? 'border-[#4BA9FF] text-[#F9FAFF]'
              : 'border-transparent text-[#97A7B6] hover:text-[#D0D2D7]'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>My Actions & Badges</span>
        </button>
        <button
          id="challenges"
          onClick={() => setActiveTab('challenges')}
          className={`pb-2 px-3 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'challenges'
              ? 'border-[#4BA9FF] text-[#F9FAFF]'
              : 'border-transparent text-[#97A7B6] hover:text-[#D0D2D7]'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          <span>{t('sustainability.challengesTitle', 'Active Green Community Challenges')}</span>
        </button>
      </div>

      {activeTab === 'tracker' ? (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#39414B] p-4 rounded-[12px] border border-[#677580]">
              <div className="flex items-center justify-between text-[#97A7B6] text-[11px] font-bold uppercase">
                <span>{t('sustainability.totalCo2Saved', 'Total CO2 Offset')}</span>
                <Leaf className="w-4 h-4 text-[#209040]" />
              </div>
              <div className="mt-2 text-[26px] font-black text-[#F9FAFF] tracking-tight">
                {totalCo2Saved.toFixed(1)} <span className="text-[14px] font-semibold text-[#D0D2D7]">kg</span>
              </div>
              <p className="text-[10px] text-[#D0D2D7] mt-0.5">
                Calculated against single petrol car baseline
              </p>
            </div>

            <div className="bg-[#39414B] p-4 rounded-[12px] border border-[#677580]">
              <div className="flex items-center justify-between text-[#97A7B6] text-[11px] font-bold uppercase">
                <span>{t('sustainability.ecoPointsEarned', 'Eco Points Earned')}</span>
                <Award className="w-4 h-4 text-[#4BA9FF]" />
              </div>
              <div className="mt-2 text-[26px] font-black text-[#4BA9FF] tracking-tight">
                {totalPoints} <span className="text-[14px] font-semibold text-[#D0D2D7]">pts</span>
              </div>
              <p className="text-[10px] text-[#D0D2D7] mt-0.5">
                Redeemable for civic tree planting certs
              </p>
            </div>

            <div className="bg-[#39414B] p-4 rounded-[12px] border border-[#677580]">
              <div className="flex items-center justify-between text-[#97A7B6] text-[11px] font-bold uppercase">
                <span>{t('sustainability.activeStreak', 'Active Day Streak')}</span>
                <Flame className="w-4 h-4 text-[#EA8C34]" />
              </div>
              <div className="mt-2 text-[26px] font-black text-[#EA8C34] tracking-tight">
                {currentStreakDays} <span className="text-[14px] font-semibold text-[#D0D2D7]">Days</span>
              </div>
              <p className="text-[10px] text-[#D0D2D7] mt-0.5">
                Consecutive sustainable transit actions
              </p>
            </div>

            <div className="bg-[#39414B] p-4 rounded-[12px] border border-[#677580]">
              <div className="flex items-center justify-between text-[#97A7B6] text-[11px] font-bold uppercase">
                <span>{t('sustainability.greenTripsLogged', 'Sustainable Trips')}</span>
                <CheckCircle className="w-4 h-4 text-[#209040]" />
              </div>
              <div className="mt-2 text-[26px] font-black text-[#F9FAFF] tracking-tight">
                {actions.length} <span className="text-[14px] font-semibold text-[#D0D2D7]">Trips</span>
              </div>
              <p className="text-[10px] text-[#D0D2D7] mt-0.5">
                Logged without motorized emissions
              </p>
            </div>
          </div>

          {/* Action History Feed */}
          <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] space-y-4">
            <h3 className="font-bold text-[15px] text-[#F9FAFF]">
              Recorded Eco-Actions History
            </h3>

            <div className="space-y-3">
              {actions.map((act) => (
                <div
                  key={act.id}
                  className="bg-[#2B313A] p-4 rounded-[8px] border border-[#677580] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center shrink-0">
                      {act.type === 'walking' && <Footprints className="w-4 h-4" />}
                      {act.type === 'cycling' && <Bike className="w-4 h-4" />}
                      {act.type === 'public_transit' && <Bus className="w-4 h-4" />}
                      {act.type === 'avoided_idling' && <Flame className="w-4 h-4" />}
                      {act.type === 'carpooling' && <Car className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#F9FAFF]">
                        {act.title}
                      </h4>
                      <p className="text-[10.5px] text-[#CCD3D7]">
                        {act.distanceKm ? `${act.distanceKm} km • ` : ''}
                        Saved ~{act.estimatedCo2SavedKg} kg CO2
                        {act.notes ? ` • ${act.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-right">
                    <span className="text-[11px] font-extrabold text-[#209040]">
                      +{act.ecoPoints} Pts
                    </span>
                    <span className="text-[9.5px] text-[#97A7B6]">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Green Community Challenges Tab */
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((chal) => {
              const progressPercent = Math.min(100, Math.round((chal.currentProgress / chal.targetDays) * 100));
              return (
                <div
                  key={chal.id}
                  className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-[8px] bg-[#296AE1]/20 text-[#4BA9FF] flex items-center justify-center">
                          {chal.badgeIcon === 'Train' && <Train className="w-5 h-5" />}
                          {chal.badgeIcon === 'Bike' && <Bike className="w-5 h-5" />}
                          {chal.badgeIcon === 'ShieldAlert' && <ShieldAlert className="w-5 h-5" />}
                          {chal.badgeIcon === 'MapPin' && <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-[14px] text-[#F9FAFF]">
                            {chal.title}
                          </h4>
                          <span className="text-[10px] text-[#4BA9FF] font-semibold">
                            Badge: {chal.badgeName}
                          </span>
                        </div>
                      </div>

                      {chal.isCompleted ? (
                        <span className="text-[10px] font-extrabold bg-[#209040] text-[#F9FAFF] px-2.5 py-0.5 rounded-[4px] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Done
                        </span>
                      ) : chal.isJoined ? (
                        <span className="text-[10px] font-bold bg-[#3D7AB2] text-[#F9FAFF] px-2 py-0.5 rounded-[4px]">
                          Joined
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-[#23272B] text-[#D0D2D7] px-2 py-0.5 rounded-[4px] border border-[#677580]">
                          Open
                        </span>
                      )}
                    </div>

                    <p className="text-[11.5px] text-[#CCD3D7] leading-relaxed">
                      {chal.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10.5px]">
                        <span className="text-[#97A7B6]">Progress</span>
                        <span className="font-bold text-[#F9FAFF]">
                          {chal.currentProgress} / {chal.targetDays} Days ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#23272B] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${progressPercent}%` }}
                          className={`h-full rounded-full transition-all ${
                            chal.isCompleted ? 'bg-[#209040]' : 'bg-[#4BA9FF]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#677580] flex items-center justify-between">
                    <div className="text-[11px] text-[#209040] font-bold">
                      +{chal.ecoPoints} Eco-Points
                    </div>

                    {!chal.isJoined ? (
                      <button
                        onClick={() => handleJoinChallenge(chal.id)}
                        className="aqi-btn-primary text-[11px] py-1 px-3"
                      >
                        {t('sustainability.joinChallenge', 'Join Challenge')}
                      </button>
                    ) : !chal.isCompleted ? (
                      <button
                        onClick={() => {
                          if (chal.category === 'transit') setActionType('public_transit');
                          else if (chal.category === 'active_travel') setActionType('cycling');
                          else if (chal.category === 'idling') setActionType('avoided_idling');
                          setShowModal(true);
                        }}
                        className="aqi-btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3 text-[#4BA9FF]" />
                        <span>Log Action to Advance</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#209040] font-bold flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                        {t('sustainability.challengeCompleted', 'Goal Completed!')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: New Action Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#23272B]/85 flex items-center justify-center p-4">
          <div className="bg-[#39414B] border border-[#677580] rounded-[12px] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-[16px] text-[#F9FAFF] pb-2 border-b border-[#677580]">
              Log Sustainable Transportation Action
            </h3>

            <form onSubmit={handleAddAction} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Mobility Action Type
                </label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="aqi-input w-full text-[12px]"
                >
                  <option value="public_transit">Electric Metro / City Bus</option>
                  <option value="cycling">Bicycle Commute</option>
                  <option value="walking">Brisk Walking</option>
                  <option value="avoided_idling">Engine Turned Off at Long Red Lights</option>
                  <option value="carpooling">Shared Carpool</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Distance (Kilometers)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="aqi-input w-full text-[12px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Metro to Tech Park"
                  className="aqi-input w-full text-[12px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#677580]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="aqi-btn-secondary text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aqi-btn-primary text-[11px]"
                >
                  Log Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
