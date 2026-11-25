'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Wind,
  MapPin,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
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
  ResponsiveContainer
} from 'recharts';
import { POPULAR_LOCATIONS, AirQualityResponse, LocationInfo } from '@/lib/air-quality-service';
import LocationSearch from '@/components/LocationSearch';
import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { currentLocation, setLocation, savedLocations, setCachedTelemetryTime } = useLocation();
  const { t } = useLanguage();
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load air quality data for location
  const loadData = async (loc?: LocationInfo) => {
    const target = loc || currentLocation;
    setLoading(true);
    setError(null);
    try {
      const query = `lat=${target.latitude}&lon=${target.longitude}&name=${encodeURIComponent(target.name)}`;
      const res = await fetch(`/api/air-quality?${query}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAirData(json.data);
        setCachedTelemetryTime(new Date().toISOString());
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
    loadData(currentLocation);
  }, [currentLocation]);

  const current = airData?.current;
  const aqiVal = current?.indicativeAqi ?? current?.aqi;
  const category = current?.category || 'Unknown';
  const dominant = current?.dominantPollutant?.toUpperCase() || 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Banner & Location Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] shadow-sm">
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#4BA9FF] animate-pulse"></span>
                Live Environmental Feed
              </span>
              <span className="text-[10px] text-[#97A7B6]">•</span>
              <span className="text-[10px] text-[#D0D2D7] font-semibold">CPCB Methodology</span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Urban Air Quality Intelligence
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              Real-time pollutant breakdown, CPCB breakpoint sub-indices and daily action plans.
            </p>
          </div>
        </div>

        {/* Dynamic Location Search & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <LocationSearch
            onLocationSelect={(loc) => {
              loadData(loc);
            }}
          />

          <button
            onClick={() => loadData(currentLocation)}
            className="p-2.5 text-[#F9FAFF] hover:bg-[#555555] bg-[#23272B] border border-[#677580] hover:border-[#4BA9FF] rounded-[6.8px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4BA9FF]"
            title="Refresh Readings"
            aria-label="Refresh Air Quality Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#4BA9FF]' : 'text-[#D0D2D7]'}`} />
          </button>
        </div>
      </div>

      {/* Saved Places Quick Switcher Bar */}
      {savedLocations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-[#2B313A] p-2.5 rounded-[10px] border border-[#677580] text-xs">
          <span className="text-[11px] font-bold text-[#A3A3C8] uppercase tracking-wider pl-1">
            {t('dashboard.multiLocationTitle', 'Saved Places')}:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {savedLocations.map((loc) => {
              const isSelected = currentLocation.name === loc.location.name;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setLocation(loc.location);
                    loadData(loc.location);
                  }}
                  className={`px-3 py-1 rounded-[6px] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#296AE1] text-[#F9FAFF] shadow-xs'
                      : 'bg-[#23272B] text-[#D0D2D7] hover:text-[#F9FAFF] border border-[#677580]'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-[#F9FAFF]' : 'text-[#4BA9FF]'}`} />
                  <span>{loc.label}</span>
                  <span className="text-[9.5px] opacity-75">({loc.location.name.split(',')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-[#39414B] border border-[#E75835] rounded-[10.88px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#F9FAFF] text-[12px]">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#EA8C34]" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(currentLocation)}
            className="aqi-btn-outline self-start sm:self-auto py-1 px-3 text-[11px]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !airData && (
        <div className="space-y-6">
          <div className="bg-[#39414B] border border-[#677580] rounded-[12px] p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-[14px] bg-[#F9FAFF] p-2 flex items-center justify-center border border-[#97A7B6] shadow-md animate-pulse">
              <Image
                src="/airwise-logo-icon.png"
                alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-[15px] text-[#F9FAFF]">
                AIRWISE <span className="text-[#4BA9FF]">AI</span>
              </p>
              <p className="text-[12px] text-[#CCD3D7] mt-1">
                Retrieving live atmospheric monitoring & CPCB indices for {currentLocation.name}...
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-[#39414B] border border-[#677580] rounded-[12px] animate-pulse p-6"></div>
            <div className="h-64 bg-[#39414B] border border-[#677580] rounded-[12px] animate-pulse p-6"></div>
            <div className="h-64 bg-[#39414B] border border-[#677580] rounded-[12px] animate-pulse p-6"></div>
          </div>
        </div>
      )}

      {airData && (
        <>
          {/* Main Hero Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary CPCB AQI Card */}
            <div className="lg:col-span-5 bg-[#39414B] p-6 rounded-[12px] border border-[#677580] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D0D2D7]">
                      National Air Quality Index
                    </span>
                    <span className="text-[8px] bg-[#23272B] text-[#4BA9FF] border border-[#677580] px-2 py-0.5 rounded-[6.4px] font-bold">
                      CPCB India
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#F9FAFF] mt-1 leading-[24px]">
                    {airData.location.name}
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-[6.4px] text-[10px] font-extrabold uppercase tracking-wider border ${current?.color.bg}`}>
                  {category}
                </div>
              </div>

              {/* Big AQI Number - 68px font from spec */}
              <div className="my-6 flex items-baseline gap-4">
                <span className="text-[68px] font-extrabold tracking-tight text-[#F9FAFF] leading-[68px]">
                  {aqiVal !== null ? aqiVal : 'N/A'}
                </span>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCD3D7] block leading-[13.6px]">
                    Composite AQI
                  </span>
                  <span className="text-[12px] font-semibold text-[#F9FAFF] flex items-center gap-1">
                    Dominant: <strong className="text-[#4BA9FF]">{dominant}</strong>
                  </span>
                </div>
              </div>

              {/* Health Advisory Brief */}
              <div className="p-3.5 bg-[#23272B] rounded-[10.88px] border border-[#677580] text-[12px] text-[#D0D2D7] space-y-1">
                <div className="font-bold text-[#F9FAFF] flex items-center gap-1.5 leading-[15.2px]">
                  <Activity className="w-3.5 h-3.5 text-[#4BA9FF]" />
                  Health Advisory
                </div>
                <p className="leading-[17.28px]">
                  {current?.healthAdvisory.general}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="mt-4 pt-4 border-t border-[#677580] flex items-center justify-between text-[10px] text-[#CCD3D7]">
                <span className="flex items-center gap-1">
                  Source: <strong className="text-[#F9FAFF]">{airData.source}</strong>
                </span>
                <span className="capitalize px-2 py-0.5 bg-[#23272B] rounded-[6.4px] text-[#D0D2D7] font-semibold border border-[#677580]">
                  {airData.dataSourceType}
                </span>
              </div>
            </div>

            {/* My Day Signature Feature Card */}
            <div className="lg:col-span-7 bg-[#23272B] text-[#F9FAFF] p-6 rounded-[12px] border border-[#677580] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#F9FAFF] bg-[#296AE1] px-3 py-1 rounded-[6.4px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#4BA9FF]" />
                    Signature Feature
                  </span>
                  <Link
                    href="/my-day"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4BA9FF] hover:text-[#F9FAFF] transition-colors"
                  >
                    <span>Full Schedule</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <h3 className="text-[22px] font-extrabold mt-3 tracking-tight leading-[27.6px]">
                  My Day, Air-Smart™
                </h3>
                <p className="text-[12px] text-[#D0D2D7] mt-1 max-w-xl leading-[17.28px]">
                  {aqiVal && aqiVal > 200
                    ? 'Smog elevation detected during early hours. Move your morning cardio workouts indoors and schedule errand runs between 2:00 PM and 4:30 PM.'
                    : 'Atmospheric ventilation is favorable. Safe for outdoor cardio and active commutes with lower particulate risk.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                <div className="bg-[#39414B] border border-[#677580] p-3 rounded-[6.8px]">
                  <div className="text-[10px] uppercase tracking-wider text-[#4BA9FF] font-bold">
                    Optimal Running Window
                  </div>
                  <div className="text-[15px] font-bold mt-0.5 text-[#F9FAFF]">
                    1:30 PM – 4:30 PM
                  </div>
                  <div className="text-[10px] text-[#D0D2D7] mt-0.5">
                    Lowest particulate concentration
                  </div>
                </div>

                <div className="bg-[#39414B] border border-[#677580] p-3 rounded-[6.8px]">
                  <div className="text-[10px] uppercase tracking-wider text-[#4BA9FF] font-bold">
                    Commute Protection
                  </div>
                  <div className="text-[15px] font-bold mt-0.5 text-[#F9FAFF]">
                    Electric Metro Preferred
                  </div>
                  <div className="text-[10px] text-[#D0D2D7] mt-0.5">
                    Filter out road diesel soot
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#677580]">
                <span className="text-[10px] text-[#CCD3D7]">
                  Customized for healthy adult profile
                </span>
                <Link
                  href="/preferences"
                  className="text-[12px] font-bold text-[#4BA9FF] hover:underline"
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
                <h3 className="text-[15px] font-bold text-[#F9FAFF] tracking-tight leading-[20px]">
                  Six Official CPCB Pollutants
                </h3>
                <p className="text-[10px] text-[#D0D2D7]">
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
                    className={`bg-[#39414B] p-4 rounded-[12px] border transition-colors duration-150 ${
                      isDominant
                        ? 'border-[#4BA9FF] shadow-xs'
                        : 'border-[#677580] hover:border-[#97A7B6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[12px] text-[#F9FAFF]">
                        {item.name}
                      </span>
                      {isDominant && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-[#296AE1] text-[#F9FAFF] px-1.5 py-0.5 rounded-[6.4px]">
                          Dominant
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#D0D2D7] mt-0.5 truncate">
                      {item.label}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-[22px] font-bold text-[#F9FAFF]">
                        {sub?.value ?? '0'}
                      </span>
                      <span className="text-[10px] font-semibold text-[#CCD3D7]">
                        {sub?.unit}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#677580] flex items-center justify-between">
                      <span className="text-[10px] text-[#D0D2D7]">Sub-Index</span>
                      <span className="text-[12px] font-bold text-[#4BA9FF]">
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
            <div className="lg:col-span-8 bg-[#39414B] p-6 rounded-[12px] border border-[#677580]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[15px] text-[#F9FAFF] leading-[20px]">
                    24-Hour Hourly Trend
                  </h3>
                  <p className="text-[10px] text-[#D0D2D7]">
                    Hourly PM2.5 (µg/m³) and estimated Indian AQI trajectory
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1.5 text-[#4BA9FF]">
                    <span className="w-2 h-2 rounded-full bg-[#4BA9FF]"></span>
                    AQI Value
                  </span>
                  <span className="flex items-center gap-1.5 text-[#D0D2D7]">
                    <span className="w-2 h-2 rounded-full bg-[#97A7B6]"></span>
                    PM2.5 (µg/m³)
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={airData.hourly}>
                    <defs>
                      <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4BA9FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4BA9FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="displayTime"
                      tick={{ fontSize: 10, fill: '#D0D2D7' }}
                      interval={3}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#D0D2D7' }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#23272B] border border-[#677580] text-[#F9FAFF] p-2.5 rounded-[6.8px] text-[10px] shadow-lg space-y-1">
                              <p className="font-bold text-[#F9FAFF]">{label}</p>
                              <p className="text-[#4BA9FF] font-semibold">
                                AQI: {payload[0]?.value}
                              </p>
                              <p className="text-[#D0D2D7]">
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
                      stroke="#4BA9FF"
                      strokeWidth={2}
                      fill="url(#aqiGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pm25"
                      stroke="#97A7B6"
                      strokeWidth={1.5}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="lg:col-span-4 bg-[#39414B] p-6 rounded-[12px] border border-[#677580] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-[15px] text-[#F9FAFF] flex items-center gap-2 leading-[20px]">
                  <Calendar className="w-4 h-4 text-[#4BA9FF]" />
                  5-Day Air Outlook
                </h3>
                <p className="text-[10px] text-[#D0D2D7] mt-0.5">
                  Predictive atmospheric dispersion forecast
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {airData.dailyForecast.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-2.5 rounded-[6.8px] bg-[#23272B] border border-[#677580] transition-colors"
                  >
                    <div>
                      <div className="text-[12px] font-bold text-[#F9FAFF]">
                        {day.dayName}
                      </div>
                      <div className="text-[10px] text-[#D0D2D7]">
                        Risk: {day.primaryRisk}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[12px] font-extrabold text-[#F9FAFF]">
                          AQI {day.avgAqi}
                        </div>
                        <div className="text-[10px] text-[#CCD3D7] font-medium">
                          {day.category}
                        </div>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        day.avgAqi <= 100 ? 'bg-[#4BA9FF]' :
                        day.avgAqi <= 200 ? 'bg-[#EA8C34]' :
                        day.avgAqi <= 300 ? 'bg-[#E75835]' : 'bg-[#E5484D]'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[#677580] text-[10px] text-[#D0D2D7] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#97A7B6] shrink-0" />
                <span>Forecast values use atmospheric numerical weather models.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
