"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Shield, Clock, AlertTriangle, Activity, Sliders } from "lucide-react";
import { AirQualityResponse, HouseholdPersona, RoutineHacksResponse } from "@/lib/types";
import {
  CommuteOption,
  DEFAULT_PERSONA,
  SelectedLocation,
  SetupOption,
  VulnerabilityOption,
} from "@/lib/constants";
import DashboardHeader from "@/components/DashboardHeader";
import LiveTelemetryCard from "@/components/LiveTelemetryCard";
import ExposureFacts from "@/components/ExposureFacts";
import AQITimeline from "@/components/AQITimeline";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import CityCompare from "@/components/CityCompare";
import InversionScrubber from "@/components/InversionScrubber";
import DiurnalRoutineGrid from "@/components/DiurnalRoutineGrid";
import RoomBlueprint from "@/components/RoomBlueprint";
import ImpactSimulator from "@/components/ImpactSimulator";
import IntroSplash from "@/components/IntroSplash";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollHUD from "@/components/ScrollHUD";

export default function Dashboard() {
  const [persona, setPersona] = useState<HouseholdPersona>(DEFAULT_PERSONA);
  const [commuteOpt, setCommuteOpt] = useState<CommuteOption>("Two-Wheeler");
  const [vulnOpt, setVulnOpt] = useState<VulnerabilityOption>("Asthma");
  const [setupOpt, setSetupOpt] = useState<SetupOption>("Zero-Cost & DIY");

  const [aqiData, setAqiData] = useState<AirQualityResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RoutineHacksResponse | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(8);
  const [loadingAQI, setLoadingAQI] = useState<boolean>(true);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const fetchAQI = useCallback(async (loc: SelectedLocation) => {
    setLoadingAQI(true);
    setError(null);
    try {
      const params = new URLSearchParams({ city: loc.city });
      if (loc.country) params.set("country", loc.country);
      if (loc.latitude !== undefined && loc.longitude !== undefined) {
        params.set("latitude", String(loc.latitude));
        params.set("longitude", String(loc.longitude));
      }
      const res = await fetch(`/api/air-quality?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch air quality data");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Air quality fetch failed");
      setAqiData(json.data);
      return json.data as AirQualityResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error querying air quality");
      return null;
    } finally {
      setLoadingAQI(false);
    }
  }, []);

  const fetchRecommendations = useCallback(
    async (currentPersona: HouseholdPersona, currentAQI: AirQualityResponse | null) => {
      setLoadingRecs(true);
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona: currentPersona, aqiData: currentAQI }),
        });
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const json = await res.json();
        if (json.success && json.data) setRecommendations(json.data);
      } catch (err) {
        console.error("[Dashboard Recommendations Error]", err);
      } finally {
        setLoadingRecs(false);
      }
    },
    []
  );

  useEffect(() => {
    (async () => {
      const aqi = await fetchAQI({ city: persona.location });
      await fetchRecommendations(persona, aqi);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const syncHouseholdProfile = async (
    nextCommute: CommuteOption,
    nextVuln: VulnerabilityOption,
    nextSetup: SetupOption
  ) => {
    setCommuteOpt(nextCommute);
    setVulnOpt(nextVuln);
    setSetupOpt(nextSetup);
    const updated: HouseholdPersona = {
      ...persona,
      commuteType: nextCommute === "Car" ? "Car (AC Recirc)" : nextCommute,
      commuteDistanceKm: nextCommute === "WFH" ? 5 : 20,
      commuteHoursPerDay: nextCommute === "WFH" ? 0.5 : 1.5,
      sensitiveMembers:
        nextVuln === "None" ? [] : nextVuln === "Asthma" ? ["asthmatic"] : ["infant", "elderly"],
      homeSetup:
        nextSetup === "Air Purifier" ? "Apartment with air purifiers" : "Naturally ventilated apartment",
    };
    setPersona(updated);
    await fetchRecommendations(updated, aqiData);
  };

  const handleSelectLocation = async (loc: SelectedLocation) => {
    const updatedPersona = { ...persona, location: loc.city };
    setPersona(updatedPersona);
    const aqi = await fetchAQI(loc);
    await fetchRecommendations(updatedPersona, aqi);
  };

  const handleCopyFamilyBrief = async () => {
    const city = aqiData?.city || persona.location;
    const maskAdvice =
      aqiData && aqiData.current.pm2_5 > 75
        ? "Wear a tight-fit N95/FFP2 outdoors"
        : "Surgical/N95 recommended for traffic commutes";
    const safeWindows =
      recommendations?.daily_routine
        .filter((w) => w.ventilation_status === "open_briefly")
        .map((w) => w.time_window)
        .join(", ") || "12:00–16:00 (Solar Mixing Window)";
    const brief = [
      `*NafasNet Family Air Brief — ${city}*`,
      `Live PM2.5: ${aqiData?.current.pm2_5 ?? "--"} µg/m³ | US AQI: ${aqiData?.current.us_aqi ?? "--"}`,
      `Profile: ${commuteOpt} · ${vulnOpt} · ${setupOpt}`,
      `Safe Ventilation Hours: ${safeWindows}`,
      `Mask Advice: ${maskAdvice}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(brief);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen mashrabiya-bg text-zinc-100 font-sans pb-20 sm:pb-16">
      <IntroSplash />
      <ScrollHUD city={aqiData?.city || persona.location} pm25={aqiData?.current.pm2_5} />
      <DashboardHeader
        currentCity={aqiData?.city || persona.location}
        latitude={aqiData?.latitude}
        longitude={aqiData?.longitude}
        loadingAQI={loadingAQI}
        commuteOpt={commuteOpt}
        vulnOpt={vulnOpt}
        setupOpt={setupOpt}
        copiedBrief={copiedBrief}
        onSelectLocation={handleSelectLocation}
        onSyncProfile={syncHouseholdProfile}
        onCopyBrief={handleCopyFamilyBrief}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3.5 text-red-300 flex items-center gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="section-telemetry">
          <LiveTelemetryCard
            aqiData={aqiData}
            fallbackCity={persona.location}
            loadingAQI={loadingAQI}
            onRefresh={() =>
              fetchAQI({ city: aqiData?.city || persona.location, latitude: aqiData?.latitude, longitude: aqiData?.longitude })
            }
          />
          <div className="lg:col-span-7 flex flex-col justify-center">
            <ExposureFacts aqiData={aqiData} />
          </div>
        </div>

        <div id="section-timeline" className="space-y-5">
          {aqiData?.hourly && aqiData.hourly.length > 0 ? (
            <>
              <ScrollReveal><AQITimeline hourlyData={aqiData.hourly} locationName={aqiData.city} /></ScrollReveal>
              <ScrollReveal delayMs={60}><AnalyticsCharts aqiData={aqiData} /></ScrollReveal>
              <ScrollReveal delayMs={100}><CityCompare primaryCity={aqiData} /></ScrollReveal>
            </>
          ) : (
            <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
              Loading 24-hour atmospheric telemetry...
            </div>
          )}
        </div>

        <ScrollReveal>
          <section id="section-inversion">
            <InversionScrubber
              hourlyData={aqiData?.hourly?.map((h) => ({ time: h.formattedTime, pm25: h.pm2_5 })) ?? []}
              selectedHour={selectedHour}
              onHourChange={setSelectedHour}
            />
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <DiurnalRoutineGrid
            recommendations={recommendations}
            selectedHour={selectedHour}
            vulnOpt={vulnOpt}
            loadingRecs={loadingRecs}
            onRegenerate={() => fetchRecommendations(persona, aqiData)}
          />
        </ScrollReveal>

        <ScrollReveal><section id="section-iaq-room"><RoomBlueprint /></section></ScrollReveal>

        <ScrollReveal>
          <div id="section-simulator">
            <ImpactSimulator
              key={`${aqiData?.city || "default"}-${commuteOpt}`}
              initialPM25={aqiData?.current.pm2_5 ?? 125}
              initialDust={aqiData?.current.dust ?? 30}
              locationName={aqiData?.city || persona.location}
              commuteType={commuteOpt}
            />
          </div>
        </ScrollReveal>
      </main>

      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-50 bg-zinc-950/95 border border-zinc-800 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex items-center justify-around text-[11px] font-medium">
        <a href="#section-telemetry" className="flex flex-col items-center py-1 px-3 text-zinc-200"><Activity className="w-4 h-4 mb-0.5 text-[#D4AF37]" /><span>Live</span></a>
        <a href="#section-timeline" className="flex flex-col items-center py-1 px-3 text-zinc-400"><Clock className="w-4 h-4 mb-0.5" /><span>Charts</span></a>
        <a href="#section-routine" className="flex flex-col items-center py-1 px-3 text-zinc-400"><Shield className="w-4 h-4 mb-0.5" /><span>Routine</span></a>
        <a href="#section-simulator" className="flex flex-col items-center py-1 px-3 text-zinc-400"><Sliders className="w-4 h-4 mb-0.5" /><span>Simulator</span></a>
      </nav>

      <footer className="border-t border-zinc-900 bg-black py-6 mt-10 text-center text-xs text-zinc-500 px-4">
        <div className="max-w-7xl mx-auto">
          NafasNet · Telemetry powered by Open-Meteo Air Quality &amp; Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
}
