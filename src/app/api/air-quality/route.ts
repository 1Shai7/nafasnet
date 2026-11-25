import { NextRequest, NextResponse } from "next/server";
import { AirQualityHourlyPoint, AirQualityResponse, RiskLevel } from "@/lib/types";

function calculateRiskLevel(pm25: number): RiskLevel {
  if (pm25 <= 15) return "low";
  if (pm25 <= 35) return "moderate";
  if (pm25 <= 75) return "unhealthy";
  if (pm25 <= 150) return "very_unhealthy";
  return "hazardous";
}

function determineDominantPollutant(pm25: number, pm10: number, no2: number, dust: number): string {
  // Relative severity weighting based on WHO standards
  const pm25Weight = pm25 / 15;
  const pm10Weight = pm10 / 45;
  const no2Weight = no2 / 25;
  const dustWeight = dust / 50;

  const max = Math.max(pm25Weight, pm10Weight, no2Weight, dustWeight);
  if (max === pm25Weight) return "PM2.5 (Fine Particulate)";
  if (max === dustWeight && dust > 20) return "Desert/Road Dust";
  if (max === pm10Weight) return "PM10 (Coarse Particulate)";
  if (max === no2Weight) return "NO2 (Traffic Emissions)";
  return "PM2.5";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityQuery = searchParams.get("city") || "New Delhi";
  const latParam = searchParams.get("latitude");
  const lonParam = searchParams.get("longitude");

  let latitude = latParam ? parseFloat(latParam) : null;
  let longitude = lonParam ? parseFloat(lonParam) : null;
  let resolvedCity = cityQuery;
  let resolvedCountry = "";

  try {
    // 1. Fetch Lat/Lon from Open-Meteo Geocoding API if not explicitly supplied
    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityQuery
      )}&count=1&language=en&format=json`;

      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        throw new Error(`Geocoding failed with status: ${geoRes.statusText}`);
      }

      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const topResult = geoData.results[0];
        latitude = topResult.latitude;
        longitude = topResult.longitude;
        resolvedCity = topResult.name;
        resolvedCountry = topResult.country || "";
      } else {
        // Fallback to New Delhi default if not found
        latitude = 28.6139;
        longitude = 77.209;
        resolvedCity = "New Delhi";
        resolvedCountry = "India";
      }
    }

    // 2. Fetch 24-hour Air Quality data from Open-Meteo Air Quality API
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5,pm10,nitrogen_dioxide,dust,european_aqi,us_aqi&forecast_hours=24&timezone=auto`;

    console.log(`[Air Quality API] Fetching 24h data for ${resolvedCity} (${latitude}, ${longitude})`);
    const aqiRes = await fetch(aqiUrl, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!aqiRes.ok) {
      throw new Error(`Air Quality API error: ${aqiRes.statusText}`);
    }

    const aqiData = await aqiRes.json();
    const hourlyRaw = aqiData.hourly;

    if (!hourlyRaw || !hourlyRaw.time || hourlyRaw.time.length === 0) {
      throw new Error("No hourly air quality data returned");
    }

    // 3. Map into clean typed 24-hour hourly points
    const hourly: AirQualityHourlyPoint[] = hourlyRaw.time.slice(0, 24).map((timeStr: string, idx: number) => {
      const date = new Date(timeStr);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return {
        time: timeStr,
        formattedTime: `${hours}:${minutes}`,
        pm2_5: Math.round((hourlyRaw.pm2_5?.[idx] ?? 0) * 10) / 10,
        pm10: Math.round((hourlyRaw.pm10?.[idx] ?? 0) * 10) / 10,
        nitrogen_dioxide: Math.round((hourlyRaw.nitrogen_dioxide?.[idx] ?? 0) * 10) / 10,
        dust: Math.round((hourlyRaw.dust?.[idx] ?? 0) * 10) / 10,
        european_aqi: hourlyRaw.european_aqi?.[idx] ?? undefined,
        us_aqi: hourlyRaw.us_aqi?.[idx] ?? undefined,
      };
    });

    const currentPoint = hourly[0];
    const riskLevel = calculateRiskLevel(currentPoint.pm2_5);
    const dominant = determineDominantPollutant(
      currentPoint.pm2_5,
      currentPoint.pm10,
      currentPoint.nitrogen_dioxide,
      currentPoint.dust
    );

    const finalLat = latitude ?? 28.6139;
    const finalLon = longitude ?? 77.209;

    const payload: AirQualityResponse = {
      city: resolvedCity,
      country: resolvedCountry,
      latitude: finalLat,
      longitude: finalLon,
      timezone: aqiData.timezone || "auto",
      current: {
        time: currentPoint.time,
        pm2_5: currentPoint.pm2_5,
        pm10: currentPoint.pm10,
        nitrogen_dioxide: currentPoint.nitrogen_dioxide,
        dust: currentPoint.dust,
        european_aqi: currentPoint.european_aqi ?? 0,
        us_aqi: currentPoint.us_aqi ?? 0,
        dominant_pollutant: dominant,
        risk_level: riskLevel,
      },
      hourly,
      units: aqiData.hourly_units || {
        pm2_5: "μg/m³",
        pm10: "μg/m³",
        nitrogen_dioxide: "μg/m³",
        dust: "μg/m³",
      },
    };

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Air Quality Route Error]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
