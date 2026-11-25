'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Info,
  AlertCircle,
  Navigation,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { POPULAR_LOCATIONS, LocationInfo } from '@/lib/air-quality-service';
import LocationSearch from '@/components/LocationSearch';
import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ExposureExplorerPage() {
  const { currentLocation, setLocation } = useLocation();
  const { t } = useLanguage();
  const [selectedStation, setSelectedStation] = useState<LocationInfo>(currentLocation);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
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
                <Compass className="w-3.5 h-3.5 text-[#4BA9FF]" />
                Regional Environmental Explorer
              </span>
              <span className="text-[10px] text-[#97A7B6]">•</span>
              <span className="text-[10px] text-[#D0D2D7] font-semibold">{t('explorer.urbanStations', 'Urban Monitoring Stations')}</span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              {t('explorer.title', 'Exposure & Monitoring Grid')}
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              {t('explorer.subtitle', 'Compare continuous monitoring locations across India and citizen pollution observations.')}
            </p>
          </div>
        </div>

        {/* Dynamic Location Search & Resolution Disclosure */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <LocationSearch
            onLocationSelect={(loc) => {
              setSelectedStation(loc);
            }}
          />

          <div className="flex items-center gap-2 px-3 py-2 bg-[#23272B] border border-[#677580] rounded-[6.8px] text-[10px] text-[#D0D2D7] max-w-xs">
            <Info className="w-3.5 h-3.5 text-[#4BA9FF] shrink-0" />
            <span className="leading-[13px]">
              <strong>Notice:</strong> CAMS model is ~40 km resolution (0.4° × 0.4°).
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Station Roster */}
        <div className="lg:col-span-5 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#677580]">
            <h3 className="font-extrabold text-[#F9FAFF] text-[14px] leading-[19.2px]">
              Monitored Urban Clusters ({POPULAR_LOCATIONS.length})
            </h3>
            <span className="text-[10px] font-bold text-[#4BA9FF] bg-[#23272B] border border-[#677580] px-2 py-0.5 rounded-[6.4px]">
              CAMS Regional Model Grid
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#677580] mt-2">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected = selectedStation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedStation(loc)}
                  className={`w-full text-left p-3.5 transition-colors rounded-[6.8px] my-1 flex items-start justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#296AE1] text-[#F9FAFF] border border-[#4BA9FF]'
                      : 'hover:bg-[#555555] text-[#D0D2D7]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-[12px] flex items-center gap-1.5 text-[#F9FAFF]">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F9FAFF]' : 'text-[#4BA9FF]'}`} />
                      <span>{loc.name}</span>
                    </div>
                    <div className="text-[10px] text-[#CCD3D7]">
                      {loc.state}, India • Coord: {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] uppercase font-bold px-2 py-0.5 bg-[#23272B] text-[#D0D2D7] rounded-[6.4px] border border-[#677580]">
                      Regional Node
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Station Detail & Route Exposure View */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4BA9FF]">
                  Selected Cluster Station
                </span>
                <h3 className="text-[22px] font-extrabold text-[#F9FAFF] mt-0.5 leading-[27.6px]">
                  {selectedStation.name}
                </h3>
                <p className="text-[10px] text-[#D0D2D7] mt-1">
                  Latitude: {selectedStation.latitude} | Longitude: {selectedStation.longitude}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-2.5 py-1 rounded-[6.4px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4BA9FF]" />
                  Live Sync
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#23272B] p-4 rounded-[6.8px] border border-[#677580]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#4BA9FF]">
                  Data Freshness & Provenance
                </div>
                <div className="text-[15px] font-bold text-[#F9FAFF] mt-1">
                  CAMS Regional Model Grid
                </div>
                <p className="text-[10px] text-[#D0D2D7] mt-1 leading-[13.6px]">
                  Telemetry reflects Copernicus Atmosphere Monitoring Service (CAMS) regional model simulations (~40 km grid) processed via CPCB sub-index equations.
                </p>
              </div>

              <div className="bg-[#23272B] p-4 rounded-[6.8px] border border-[#677580]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#4BA9FF]">
                  Primary Emission Characteristics
                </div>
                <div className="text-[15px] font-bold text-[#F9FAFF] mt-1">
                  Combustion & Road Dust
                </div>
                <p className="text-[10px] text-[#D0D2D7] mt-1 leading-[13.6px]">
                  High sensitivity to peak vehicular congestion and wind calm periods.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-[6.8px] bg-[#23272B] border border-[#677580] space-y-2">
              <div className="flex items-center gap-2 text-[#F9FAFF] font-bold text-[12px]">
                <Navigation className="w-4 h-4 text-[#4BA9FF]" />
                <span>Street-Level Route Exposure Comparison</span>
              </div>
              <p className="text-[10px] text-[#D0D2D7] leading-[15.2px]">
                Hyper-local street-by-street micro-route pollution comparison is currently <strong>unavailable</strong>. Official CPCB and meteorological satellites measure regional grids rather than street-corner microclimates.
              </p>
              <div className="text-[8px] text-[#CCD3D7] italic">
                * AIRWISE AI does not invent simulated street routes without dense localized sensor nodes.
              </div>
            </div>
          </div>

          {/* Citizen Community Reports in This Region */}
          <div className="bg-[#39414B] p-6 rounded-[12px] border border-[#677580]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[14px] text-[#F9FAFF]">
                Citizen Hotspot Reports in Vicinity
              </h4>
              <span className="text-[10px] text-[#D0D2D7]">
                Crowdsourced Observations
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#23272B] border border-[#E5484D] rounded-[6.8px] flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#E5484D] mt-0.5 shrink-0" />
                <div className="text-[12px]">
                  <div className="flex items-center gap-2 font-bold text-[#F9FAFF]">
                    <span>Visible Municipal Waste Burning</span>
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-[4px] bg-[#39414B] text-[#4BA9FF] border border-[#296AE1]">
                      Sample Demo Hotspot
                    </span>
                  </div>
                  <p className="text-[#D0D2D7] mt-0.5 leading-[17.28px]">
                    Thick grey smoke observed near highway interchange. Reported by 24 citizens within 2 km.
                  </p>
                  <div className="text-[8px] text-[#CCD3D7] mt-1">
                    Status: Illustrative Demo Report • 2 hours ago
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#23272B] border border-[#EA8C34] rounded-[6.8px] flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#EA8C34] mt-0.5 shrink-0" />
                <div className="text-[12px]">
                  <div className="flex items-center gap-2 font-bold text-[#F9FAFF]">
                    <span>Flyover Expansion Aggregate Dust</span>
                    <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-[4px] bg-[#39414B] text-[#4BA9FF] border border-[#296AE1]">
                      Sample Demo Hotspot
                    </span>
                  </div>
                  <p className="text-[#D0D2D7] mt-0.5 leading-[17.28px]">
                    High suspended particulate drift from uncovered dry earthmoving operations.
                  </p>
                  <div className="text-[8px] text-[#CCD3D7] mt-1">
                    Status: Illustrative Demo Report • 5 hours ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
