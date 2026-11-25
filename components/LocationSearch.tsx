'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Loader2, 
  X, 
  AlertCircle, 
  ChevronDown 
} from 'lucide-react';
import { LocationInfo, POPULAR_LOCATIONS } from '@/lib/air-quality-service';
import { useLocation } from '@/context/LocationContext';

interface LocationSearchProps {
  onLocationSelect?: (loc: LocationInfo) => void;
  className?: string;
  variant?: 'compact' | 'expanded';
}

export default function LocationSearch({
  onLocationSelect,
  className = '',
  variant = 'compact',
}: LocationSearchProps) {
  const { 
    currentLocation, 
    setLocation, 
    isLoadingGPS, 
    gpsError, 
    requestCurrentPosition,
    clearGpsError 
  } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = searchTerm.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Geocoding search failed');
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
          if (data.results.length === 0) {
            setSearchError(`No matching locations found for "${trimmed}". Try another city or spelling.`);
          }
        } else {
          setResults([]);
          setSearchError('Unable to load locations. Please retry.');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search error:', err);
          setSearchError('Network error while searching locations.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchTerm]);

  const handleSelect = (loc: LocationInfo) => {
    setLocation(loc);
    if (onLocationSelect) onLocationSelect(loc);
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const handleGPSClick = () => {
    requestCurrentPosition();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          className="flex items-center justify-between gap-3 px-3.5 py-2 bg-[#23272B] hover:bg-[#39414B] border border-[#677580] focus:border-[#4BA9FF] rounded-[6.8px] text-[#F9FAFF] text-[14px] transition-colors w-full sm:w-auto min-w-[240px] text-left"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-[#4BA9FF] shrink-0" />
            <span className="font-semibold truncate">{currentLocation.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#97A7B6] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick GPS Button */}
        <button
          type="button"
          onClick={handleGPSClick}
          disabled={isLoadingGPS}
          title="Detect Current Location (GPS)"
          className="p-2 bg-[#23272B] hover:bg-[#39414B] border border-[#677580] hover:border-[#4BA9FF] text-[#4BA9FF] rounded-[6.8px] transition-colors shrink-0 disabled:opacity-50"
          aria-label="Use Current GPS Location"
        >
          {isLoadingGPS ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#4BA9FF]" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* GPS Error Notification */}
      {gpsError && (
        <div className="absolute top-full left-0 mt-2 z-50 p-2.5 bg-[#E5484D] text-[#F9FAFF] rounded-[6.8px] text-[12px] flex items-center justify-between gap-2 shadow-lg max-w-sm">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={clearGpsError}
            className="p-1 hover:bg-black/20 rounded"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-[#23272B] border border-[#677580] rounded-[10.88px] shadow-2xl p-3 flex flex-col gap-3"
          role="listbox"
        >
          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#97A7B6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Indian city or locality (e.g., Mangaluru, Udupi)..."
              className="w-full pl-9 pr-8 py-2 bg-[#39414B] border border-[#677580] focus:border-[#4BA9FF] rounded-[6.4px] text-[14px] text-[#F9FAFF] placeholder-[#97A7B6] outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#97A7B6] hover:text-[#F9FAFF]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Geolocation Option */}
          <button
            type="button"
            onClick={() => {
              handleGPSClick();
              setIsOpen(false);
            }}
            disabled={isLoadingGPS}
            className="flex items-center gap-2.5 px-3 py-2 bg-[#39414B] hover:bg-[#296AE1] text-[#4BA9FF] hover:text-[#F9FAFF] rounded-[6.8px] text-[13px] font-semibold transition-colors text-left"
          >
            <Navigation className="w-4 h-4 shrink-0" />
            <span>Use My Exact GPS Location</span>
          </button>

          {/* Dynamic Search Results */}
          {isSearching && (
            <div className="py-4 flex items-center justify-center gap-2 text-[13px] text-[#D0D2D7]">
              <Loader2 className="w-4 h-4 animate-spin text-[#4BA9FF]" />
              <span>Searching locations across India...</span>
            </div>
          )}

          {searchError && !isSearching && (
            <div className="py-3 px-2 text-[12px] text-[#EA8C34] bg-[#39414B] rounded-[6.4px] text-center">
              {searchError}
            </div>
          )}

          {results.length > 0 && !isSearching && (
            <div className="space-y-1 max-h-[220px] overflow-y-auto divide-y divide-[#39414B]">
              <div className="text-[10px] uppercase font-bold text-[#97A7B6] px-2 py-1">
                Search Results ({results.length})
              </div>
              {results.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-[#39414B] text-left rounded-[6.4px] transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-[#97A7B6] group-hover:text-[#4BA9FF] mt-0.5 shrink-0" />
                  <div className="truncate">
                    <div className="text-[14px] font-semibold text-[#F9FAFF] truncate group-hover:text-[#4BA9FF]">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-[#CCD3D7]">
                      {loc.state ? `${loc.state}, ` : ''}{loc.country} • {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Hubs / Suggested Localities */}
          {results.length === 0 && !isSearching && (
            <div className="space-y-1 max-h-[240px] overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-[#97A7B6] px-2 py-1">
                Featured Urban Hubs
              </div>
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded-[6.4px] transition-colors text-[13px] ${
                    currentLocation.id === loc.id 
                      ? 'bg-[#296AE1] text-[#F9FAFF] font-bold' 
                      : 'hover:bg-[#39414B] text-[#D0D2D7]'
                  }`}
                >
                  <span className="truncate">{loc.name}</span>
                  <span className="text-[10px] opacity-75">{loc.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
