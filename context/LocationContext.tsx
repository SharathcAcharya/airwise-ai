'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationInfo, POPULAR_LOCATIONS } from '@/lib/air-quality-service';

interface LocationContextType {
  currentLocation: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  isLoadingGPS: boolean;
  gpsError: string | null;
  requestCurrentPosition: () => void;
  clearGpsError: () => void;
  isHydrated: boolean;
}

const STORAGE_KEY = 'airwise_selected_location';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(POPULAR_LOCATIONS[0]);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore saved location from localStorage safely after client hydration
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
        }
      }
    } catch (e) {
      console.warn('Unable to load location from storage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setLocation = (loc: LocationInfo) => {
    setCurrentLocation(loc);
    setGpsError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {
      console.warn('Unable to persist location:', e);
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
        isLoadingGPS,
        gpsError,
        requestCurrentPosition,
        clearGpsError: () => setGpsError(null),
        isHydrated,
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
