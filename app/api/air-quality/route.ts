import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQualityData, POPULAR_LOCATIONS } from '@/lib/air-quality-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    const locId = searchParams.get('locId');

    let lat = 28.6508; // Delhi Anand Vihar default
    let lon = 77.3152;
    let locName = 'Anand Vihar, Delhi';

    if (locId) {
      const found = POPULAR_LOCATIONS.find(l => l.id === locId);
      if (found) {
        lat = found.latitude;
        lon = found.longitude;
        locName = found.name;
      }
    } else if (latStr !== null && lonStr !== null) {
      const parsedLat = parseFloat(latStr);
      const parsedLon = parseFloat(lonStr);

      // Validate geographic coordinate boundaries
      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid coordinates: latitude and longitude must be numbers.',
          },
          { status: 400 }
        );
      }

      if (parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
        return NextResponse.json(
          {
            success: false,
            error: 'Coordinates out of bounds: latitude must be between -90 and 90, longitude between -180 and 180.',
          },
          { status: 400 }
        );
      }

      lat = parsedLat;
      lon = parsedLon;
      const rawName = searchParams.get('name') || '';
      locName = rawName.slice(0, 100) || `Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
    }

    const data = await fetchAirQualityData(lat, lon, locName);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('API Error in /api/air-quality:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve air quality data. Please retry.',
      },
      { status: 500 }
    );
  }
}
