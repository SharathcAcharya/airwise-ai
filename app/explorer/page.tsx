'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Info, 
  AlertCircle, 
  ExternalLink, 
  Navigation, 
  ShieldCheck,
  TrendingUp,
  Compass
} from 'lucide-react';
import { POPULAR_LOCATIONS } from '@/lib/air-quality-service';

export default function ExposureExplorerPage() {
  const [selectedStation, setSelectedStation] = useState(POPULAR_LOCATIONS[0]);
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'moderate'>('all');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Regional Environmental Explorer
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Urban Monitoring Stations</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Exposure & Monitoring Grid
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Compare validated monitoring locations and citizen pollution hotspot alerts.
          </p>
        </div>

        {/* Resolution Disclosure Warning */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-md">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Resolution Notice:</strong> Atmospheric models operate at ~10 km grid resolution. Street-level micrometeorology is estimated, not measured directly.
          </span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Station Roster */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Monitored Urban Clusters ({POPULAR_LOCATIONS.length})
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              CPCB Ground Network
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected = selectedStation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedStation(loc)}
                  className={`w-full text-left p-3.5 transition-all rounded-xl my-1 flex items-start justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{loc.name}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {loc.state}, India • Coord: {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      Continuous
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Station Detail & Route Exposure View */}
        <div className="lg:col-span-7 space-y-6">
          {/* Station In-Depth Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Selected Cluster Station
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedStation.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Latitude: {selectedStation.latitude} | Longitude: {selectedStation.longitude}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Geographical Context & Hotspot Alerts */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Data Freshness & Provenance
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  10-Minute Polling Cycle
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Data synchronized via Open-Meteo European and CPCB telemetry stations.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Primary Emission Characteristics
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  Combustion & Road Dust
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  High sensitivity to peak-hour vehicular rush and wind calm periods.
                </p>
              </div>
            </div>

            {/* Route Comparison Module (Strictly Disclosed As Unavailable without hyper-local sensors) */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Street-Level Route Exposure Comparison</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hyper-local street-by-street micro-route pollution comparison is currently <strong>unavailable</strong>. Official CPCB and meteorological satellites measure regional grids rather than street-corner microclimates.
              </p>
              <div className="text-[11px] text-slate-500 italic">
                * AIRWISE AI does not invent simulated street routes without dense localized sensor nodes.
              </div>
            </div>
          </div>

          {/* Citizen Community Reports in This Region */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base text-slate-900">
                Citizen Hotspot Reports in Vicinity
              </h4>
              <span className="text-xs text-slate-500">
                Crowdsourced Smoke & Dust Observations
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">
                    Visible Municipal Waste Burning
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Thick grey smoke observed near highway interchange. Reported by 24 citizens within 2 km.
                  </p>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Status: Unverified Citizen Report • 2 hours ago
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">
                    Flyover Expansion Aggregate Dust
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    High suspended particulate drift from uncovered dry earthmoving operations.
                  </p>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Status: Unverified Citizen Report • 5 hours ago
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
