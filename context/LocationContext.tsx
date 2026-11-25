'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationInfo, POPULAR_LOCATIONS } from '@/lib/air-quality-service';

export interface SavedLocation {
  id: string;
  label: 'Home' | 'Work' | 'School' | string;
  location: LocationInfo;
}

interface LocationContextType {
  currentLocation: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  savedLocations: SavedLocation[];
  addSavedLocation: (label: string, loc: LocationInfo) => void;
  removeSavedLocation: (id: string) => void;
  isLoadingGPS: boolean;
  gpsError: string | null;
  requestCurrentPosition: () => void;
  clearGpsError: () => void;
  isHydrated: boolean;
  isOffline: boolean;
  cachedTelemetryTime: string | null;
  setCachedTelemetryTime: (time: string) => void;
  isDemonstrationDefault: boolean;
}

const STORAGE_KEY = 'airwise_selected_location';
const SAVED_LOCATIONS_KEY = 'airwise_saved_family_locations';
const CACHED_TIME_KEY = 'airwise_last_telemetry_time';

const DEFAULT_SAVED_LOCATIONS: SavedLocation[] = [
  {
    id: 'loc-home-1',
    label: 'Home',
    location: POPULAR_LOCATIONS[0], // Bengaluru
  },
  {
    id: 'loc-work-1',
    label: 'Work',
    location: {
      id: 'work-blr-tech',
      name: 'Electronic City, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.8452,
      longitude: 77.6602,
    },
  },
  {
    id: 'loc-school-1',
    label: 'School',
    location: {
      id: 'school-blr-north',
      name: 'Malleshwaram, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 13.0031,
      longitude: 77.5643,
    },
  },
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(POPULAR_LOCATIONS[0]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(DEFAULT_SAVED_LOCATIONS);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedTelemetryTime, setCachedTelemetryTimeState] = useState<string | null>(null);
  const [isDemonstrationDefault, setIsDemonstrationDefault] = useState(true);

  // Restore saved location & family places from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed.latitude === 'number' &&
          typeof parsed.longitude === 'number' &&
          !isNaN(parsed.latitude) &&
          !isNaN(parsed.longitude)
        ) {
          setCurrentLocation(parsed);
          setIsDemonstrationDefault(false);
        }
      }

      const savedList = localStorage.getItem(SAVED_LOCATIONS_KEY);
      if (savedList) {
        const parsedList = JSON.parse(savedList);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          setSavedLocations(parsedList);
        }
      }

      const savedTime = localStorage.getItem(CACHED_TIME_KEY);
      if (savedTime) {
        setCachedTelemetryTimeState(savedTime);
      }
    } catch (e) {
      console.warn('Unable to load location from storage:', e);
    } finally {
      setIsHydrated(true);
    }

    // Network status listener
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register PWA service worker if supported
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('ServiceWorker registration skipped:', err);
        });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const setLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    setIsDemonstrationDefault(false);
    setGpsError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {
      console.warn('Unable to persist location:', e);
    }
  };

  const addSavedLocation = (label: string, loc: LocationInfo) => {
    const newEntry: SavedLocation = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: label.trim() || 'Saved Place',
      location: loc,
    };
    const updated = [...savedLocations, newEntry];
    setSavedLocations(updated);
    try {
      localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to persist saved location:', e);
    }
  };

  const removeSavedLocation = (id: string) => {
    const updated = savedLocations.filter((item) => item.id !== id);
    setSavedLocations(updated);
    try {
      localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to persist saved locations:', e);
    }
  };

  const setCachedTelemetryTime = (time: string) => {
    setCachedTelemetryTimeState(time);
    try {
      localStorage.setItem(CACHED_TIME_KEY, time);
    } catch (e) {
      console.warn('Unable to cache telemetry time:', e);
    }
  };

  const requestCurrentPosition = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoadingGPS(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        const gpsLoc: LocationInfo = {
          id: `gps-${lat}-${lon}`,
          name: `Current Location (${lat}°N, ${lon}°E)`,
          city: 'Local Area',
          state: 'GPS Detected',
          country: 'India',
          latitude: lat,
          longitude: lon,
        };
        setLocation(gpsLoc);
      },
      (err) => {
        setIsLoadingGPS(false);
        let msg = 'Unable to acquire location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enable location access in browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        setGpsError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setLocation,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
        isLoadingGPS,
        gpsError,
        requestCurrentPosition,
        clearGpsError: () => setGpsError(null),
        isHydrated,
        isOffline,
        cachedTelemetryTime,
        setCachedTelemetryTime,
        isDemonstrationDefault,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
