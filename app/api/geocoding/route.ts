import { NextRequest, NextResponse } from 'next/server';
import { LocationInfo } from '@/lib/air-quality-service';

export interface GeocodingResult {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  countryCode?: string;
  admin1?: string; // State / Province
  admin2?: string; // District
  admin3?: string; // Sub-district / Taluk / Locality
  timezone?: string;
}

// Curated resolution map for well-known Indian localities & historical names
const CURATED_LOCALITIES: Array<{
  queries: string[];
  location: LocationInfo;
}> = [
  {
    queries: ['mangaluru', 'mangalore', 'kudla'],
    location: {
      id: 'mangaluru-dakshina-kannada',
      name: 'Mangaluru',
      city: 'Mangaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9172,
      longitude: 74.8560,
    },
  },
  {
    queries: ['kankanady', 'kankanadi', 'kankanādi'],
    location: {
      id: 'kankanady-mangaluru',
      name: 'Kankanady, Mangaluru',
      city: 'Mangaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.8659,
      longitude: 74.8651,
    },
  },
  {
    queries: ['udupi', 'odupi'],
    location: {
      id: 'udupi-karnataka',
      name: 'Udupi',
      city: 'Udupi',
      state: 'Karnataka',
      country: 'India',
      latitude: 13.3347,
      longitude: 74.7462,
    },
  },
  {
    queries: ['mysuru', 'mysore'],
    location: {
      id: 'mysuru-karnataka',
      name: 'Mysuru',
      city: 'Mysuru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.2958,
      longitude: 76.6394,
    },
  },
  {
    queries: ['bengaluru', 'bangalore'],
    location: {
      id: 'bengaluru-karnataka',
      name: 'Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
  {
    queries: ['kochi', 'cochin'],
    location: {
      id: 'kochi-kerala',
      name: 'Kochi',
      city: 'Kochi',
      state: 'Kerala',
      country: 'India',
      latitude: 9.9399,
      longitude: 76.2602,
    },
  },
  {
    queries: ['puttur'],
    location: {
      id: 'puttur-karnataka',
      name: 'Puttur, Dakshina Kannada',
      city: 'Puttur',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.7598,
      longitude: 75.2017,
    },
  },
  {
    queries: ['bantwal', 'bantval'],
    location: {
      id: 'bantwal-karnataka',
      name: 'Bantwal, Dakshina Kannada',
      city: 'Bantwal',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.8900,
      longitude: 75.0300,
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q')?.trim() || '';

    // Input Validation: Check string length boundaries (prevent DOS/overflow)
    if (!rawQuery || rawQuery.length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    if (rawQuery.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query exceeds maximum length of 100 characters.',
          results: [],
        },
        { status: 400 }
      );
    }

    // Normalize accents (e.g. Kankanādi -> Kankanadi)
    const normalizedQuery = rawQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanQ = normalizedQuery.toLowerCase();

    // 1. Direct curated match check
    const curatedMatches: LocationInfo[] = [];
    for (const item of CURATED_LOCALITIES) {
      if (item.queries.some(q => q === cleanQ || q.includes(cleanQ) || cleanQ.includes(q))) {
        curatedMatches.push(item.location);
      }
    }

    // 2. Fetch from Open-Meteo Geocoding API with 10 results
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      normalizedQuery
    )}&count=10&language=en&format=json`;

    let apiResults: LocationInfo[] = [];

    try {
      const res = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          // Sort results prioritizing Indian locations first
          const sorted = [...data.results].sort((a: any, b: any) => {
            const aIsIndia = a.country === 'India' || a.country_code === 'IN' ? 1 : 0;
            const bIsIndia = b.country === 'India' || b.country_code === 'IN' ? 1 : 0;
            if (aIsIndia !== bIsIndia) return bIsIndia - aIsIndia;
            return (b.population || 0) - (a.population || 0);
          });

          apiResults = sorted.map((r: any) => {
            const parts: string[] = [r.name];
            if (r.admin2 && r.admin2 !== r.name) parts.push(r.admin2);
            if (r.admin1 && r.admin1 !== r.name && r.admin1 !== r.admin2) parts.push(r.admin1);
            if (r.country && r.country !== 'India') parts.push(r.country);

            return {
              id: `geo-${r.id}`,
              name: parts.join(', '),
              city: r.name,
              state: r.admin1 || '',
              country: r.country || 'India',
              latitude: Number(r.latitude.toFixed(4)),
              longitude: Number(r.longitude.toFixed(4)),
            };
          });
        }
      }
    } catch (fetchErr) {
      console.warn('Geocoding upstream fetch error, falling back to curated matches:', fetchErr);
    }

    // Combine results: Curated matches first, followed by API results without geographic duplicates
    const combined: LocationInfo[] = [...curatedMatches];
    for (const item of apiResults) {
      const isDuplicate = combined.some(
        c =>
          Math.abs(c.latitude - item.latitude) < 0.05 &&
          Math.abs(c.longitude - item.longitude) < 0.05
      );
      if (!isDuplicate) {
        combined.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      query: rawQuery,
      results: combined.slice(0, 8),
    });
  } catch (error: any) {
    console.error('Error in /api/geocoding:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to complete geocoding search.',
        results: [],
      },
      { status: 500 }
    );
  }
}
