'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wind, 
  MapPin, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp,
  Activity,
  Calendar,
  Compass,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { POPULAR_LOCATIONS, AirQualityResponse } from '@/lib/air-quality-service';

export default function DashboardPage() {
  const [selectedLocId, setSelectedLocId] = useState<string>('delhi-anand-vihar');
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);

  // Load air quality data
  const loadData = async (locId?: string, lat?: number, lon?: number, customName?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = '';
      if (lat !== undefined && lon !== undefined) {
        query = `lat=${lat}&lon=${lon}&name=${encodeURIComponent(customName || 'My Location')}`;
      } else {
        query = `locId=${locId || selectedLocId}`;
      }

      const res = await fetch(`/api/air-quality?${query}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAirData(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch air quality data');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to air quality service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedLocId);
  }, [selectedLocId]);

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        loadData(undefined, pos.coords.latitude, pos.coords.longitude, 'Current Location');
      },
      (err) => {
        setGeoLocating(false);
        alert(`Location permission denied or unavailable: ${err.message}`);
      },
      { timeout: 10000 }
    );
  };

  const current = airData?.current;
  const aqiVal = current?.aqi;
  const category = current?.category || 'Unknown';
  const dominant = current?.dominantPollutant?.toUpperCase() || 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Banner & Location Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Environmental Feed
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">CPCB Methodology</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Urban Air Quality Intelligence
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Monitor verified pollutants, sub-indices and personalized decision recommendations.
          </p>
        </div>

        {/* Location Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={selectedLocId}
              onChange={(e) => setSelectedLocId(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={handleUseCurrentLocation}
            disabled={geoLocating}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{geoLocating ? 'Locating...' : 'Use GPS'}</span>
          </button>

          <button
            onClick={() => loadData(selectedLocId)}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh Readings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !airData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse p-6"></div>
          <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse p-6"></div>
          <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse p-6"></div>
        </div>
      )}

      {airData && (
        <>
          {/* Main Hero Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary CPCB AQI Card */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      National Air Quality Index
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      CPCB India
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {airData.location.name}
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${current?.color.bg}`}>
                  {category}
                </div>
              </div>

              {/* Big AQI Number */}
              <div className="my-6 flex items-baseline gap-4">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900">
                  {aqiVal !== null ? aqiVal : 'N/A'}
                </span>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Composite AQI
                  </span>
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Dominant: <strong className="text-emerald-700">{dominant}</strong>
                  </span>
                </div>
              </div>

              {/* Health Advisory Brief */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Health Advisory
                </div>
                <p className="leading-relaxed">
                  {current?.healthAdvisory.general}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  Source: <strong className="text-slate-700">{airData.source}</strong>
                </span>
                <span className="capitalize px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                  {airData.dataSourceType}
                </span>
              </div>
            </div>

            {/* My Day Signature Teaser Card */}
            <div className="lg:col-span-7 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700/50">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    Signature Feature
                  </span>
                  <Link
                    href="/my-day"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 hover:text-white transition-colors"
                  >
                    <span>Full Schedule</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <h3 className="text-2xl font-black mt-3 tracking-tight">
                  My Day, Air-Smart™
                </h3>
                <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
                  {aqiVal && aqiVal > 200 
                    ? 'Smog elevation detected during early hours. Move your morning cardio workouts indoors and schedule errand runs between 2:00 PM and 4:30 PM.'
                    : 'Atmospheric ventilation is favorable. Safe for outdoor cardio and active commutes with lower particulate risk.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                <div className="bg-emerald-950/40 border border-emerald-600/30 p-3 rounded-xl backdrop-blur-xs">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                    Optimal Running Window
                  </div>
                  <div className="text-base font-bold mt-0.5">
                    1:30 PM – 4:30 PM
                  </div>
                  <div className="text-xs text-emerald-200/80 mt-0.5">
                    Lowest particulate concentration
                  </div>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-600/30 p-3 rounded-xl backdrop-blur-xs">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                    Commute Protection
                  </div>
                  <div className="text-base font-bold mt-0.5">
                    Electric Metro Preferred
                  </div>
                  <div className="text-xs text-emerald-200/80 mt-0.5">
                    Filter out road diesel soot
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-emerald-700/50">
                <span className="text-xs text-emerald-200/80">
                  Customized for healthy adult profile
                </span>
                <Link
                  href="/preferences"
                  className="text-xs font-bold text-white underline underline-offset-4 hover:text-emerald-200"
                >
                  Configure My Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Pollutants Sub-Indices Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Six Official CPCB Pollutants
                </h3>
                <p className="text-xs text-slate-500">
                  Individual concentrations and derived sub-indices according to official breakpoint equations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {[
                { key: 'pm25', name: 'PM2.5', label: 'Fine Dust', val: current?.subIndices.pm25 },
                { key: 'pm10', name: 'PM10', label: 'Coarse Dust', val: current?.subIndices.pm10 },
                { key: 'no2', name: 'NO2', label: 'Nitrogen Dioxide', val: current?.subIndices.no2 },
                { key: 'so2', name: 'SO2', label: 'Sulphur Dioxide', val: current?.subIndices.so2 },
                { key: 'co', name: 'CO', label: 'Carbon Monoxide', val: current?.subIndices.co },
                { key: 'o3', name: 'Ozone (O3)', label: 'Ground Ozone', val: current?.subIndices.o3 },
              ].map((item) => {
                const sub = item.val;
                const isDominant = current?.dominantPollutant === item.key;
                return (
                  <div
                    key={item.key}
                    className={`bg-white p-4 rounded-xl border transition-all ${
                      isDominant 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">
                        {item.name}
                      </span>
                      {isDominant && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                          Dominant
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {item.label}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {sub?.value ?? '0'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {sub?.unit}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Sub-Index</span>
                      <span className="text-xs font-bold text-slate-800">
                        {sub?.subIndex ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly Pollution Chart & 5-Day Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 24-Hour Trend Chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    24-Hour Hourly Trend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hourly PM2.5 (µg/m³) and estimated Indian AQI trajectory
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    AQI Value
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    PM2.5 (µg/m³)
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={airData.hourly}>
                    <defs>
                      <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="displayTime" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      interval={3}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                              <p className="font-bold text-slate-200">{label}</p>
                              <p className="text-emerald-400 font-semibold">
                                AQI: {payload[0]?.value}
                              </p>
                              <p className="text-slate-300">
                                PM2.5: {payload[1]?.value} µg/m³
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aqi" 
                      stroke="#059669" 
                      strokeWidth={2.5} 
                      fill="url(#aqiGrad)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pm25" 
                      stroke="#94a3b8" 
                      strokeWidth={1.5} 
                      fill="none" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  5-Day Air Outlook
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Predictive atmospheric dispersion forecast
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {airData.dailyForecast.map((day, idx) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {day.dayName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Risk: {day.primaryRisk}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900">
                          AQI {day.avgAqi}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {day.category}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        day.avgAqi <= 100 ? 'bg-emerald-500' :
                        day.avgAqi <= 200 ? 'bg-amber-500' :
                        day.avgAqi <= 300 ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Forecast values use meteorological chemistry simulation models.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
