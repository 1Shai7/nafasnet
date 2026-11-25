import { NextRequest, NextResponse } from "next/server";

export interface GeocodeResult {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  try {
    // Mode 1: Reverse geocode from browser GPS coordinates
    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (isNaN(lat) || isNaN(lon)) {
        return NextResponse.json(
          { success: false, error: "Invalid coordinates" },
          { status: 400 }
        );
      }

      try {
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12`;
        const revRes = await fetch(revUrl, {
          headers: { "User-Agent": "PranaGrid-AirQuality/1.0" },
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          const addr = revData.address || {};
          const cityName =
            addr.city ||
            addr.town ||
            addr.suburb ||
            addr.county ||
            addr.state_district ||
            addr.state ||
            "Current Location";
          const result: GeocodeResult = {
            id: `${lat.toFixed(4)},${lon.toFixed(4)}`,
            name: cityName,
            admin1: addr.state || addr.region,
            country: addr.country || "",
            latitude: lat,
            longitude: lon,
          };
          return NextResponse.json({ success: true, results: [result] });
        }
      } catch {
        // Fallback cleanly to coordinate label
      }

      return NextResponse.json({
        success: true,
        results: [
          {
            id: `${lat.toFixed(4)},${lon.toFixed(4)}`,
            name: `GPS (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
            country: "Current Location",
            latitude: lat,
            longitude: lon,
          },
        ],
      });
    }

    // Mode 2: Forward city/locality search via Open-Meteo Geocoding
    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=6&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      throw new Error(`Geocoding error: ${geoRes.statusText}`);
    }

    const geoData = await geoRes.json();
    const results: GeocodeResult[] = (geoData.results || []).map(
      (item: {
        id?: number;
        name: string;
        admin1?: string;
        country?: string;
        latitude: number;
        longitude: number;
      }) => ({
        id: String(item.id ?? `${item.latitude},${item.longitude}`),
        name: item.name,
        admin1: item.admin1,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude,
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Geocoding error";
    return NextResponse.json(
      { success: false, error: message, results: [] },
      { status: 500 }
    );
  }
}
