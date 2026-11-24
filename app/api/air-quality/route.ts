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
    } else if (latStr && lonStr) {
      const parsedLat = parseFloat(latStr);
      const parsedLon = parseFloat(lonStr);
      if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
        lat = parsedLat;
        lon = parsedLon;
        locName = searchParams.get('name') || `Custom Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      }
    }

    const data = await fetchAirQualityData(lat, lon, locName);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error in /api/air-quality:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve air quality data. Please retry.',
      },
      { status: 500 }
    );
  }
}
