"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AirQualityResponse,
  HouseholdPersona,
  RoutineHacksResponse,
} from "@/lib/types";
import LocationPicker, { SelectedLocation } from "@/components/LocationPicker";
import AQITimeline from "@/components/AQITimeline";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import CityCompare from "@/components/CityCompare";
import ExposureFacts from "@/components/ExposureFacts";
import ImpactSimulator from "@/components/ImpactSimulator";
import AnimatedNumber from "@/components/AnimatedNumber";
import IntroSplash from "@/components/IntroSplash";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollHUD from "@/components/ScrollHUD";
import InversionScrubber from "@/components/InversionScrubber";
import RoomBlueprint from "@/components/RoomBlueprint";
import BrandLogo from "@/components/BrandLogo";
import {
  Shield,
  RefreshCw,
  Clock,
  AlertTriangle,
  Activity,
  Sliders,
  Share2,
  Check,
  Cigarette,
} from "lucide-react";

type CommuteOption = "Two-Wheeler" | "Metro" | "Car" | "WFH";
type VulnerabilityOption = "None" | "Asthma" | "Kids & Elderly";
type SetupOption = "Zero-Cost & DIY" | "Air Purifier";

const COMMUTE_OPTIONS: CommuteOption[] = ["Two-Wheeler", "Metro", "Car", "WFH"];
const VULNERABILITY_OPTIONS: VulnerabilityOption[] = ["None", "Asthma", "Kids & Elderly"];
const SETUP_OPTIONS: SetupOption[] = ["Zero-Cost & DIY", "Air Purifier"];

const DEFAULT_PERSONA: HouseholdPersona = {
  location: "New Delhi",
  sensitiveMembers: ["asthmatic"],
  homeSetup: "Naturally ventilated apartment",
  commuteType: "Two-Wheeler",
  commuteDistanceKm: 20,
  commuteHoursPerDay: 1.5,
};

function doesHourMatchWindow(hour: number, timeWindow: string): boolean {
  const match = timeWindow.match(/(\d{1,2}):\d{2}\s*[-–]\s*(\d{1,2}):\d{2}/);
  if (!match) return false;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export default function Dashboard() {
  const [persona, setPersona] = useState<HouseholdPersona>(DEFAULT_PERSONA);
  const [commuteOpt, setCommuteOpt] = useState<CommuteOption>("Two-Wheeler");
  const [vulnOpt, setVulnOpt] = useState<VulnerabilityOption>("Asthma");
  const [setupOpt, setSetupOpt] = useState<SetupOption>("Zero-Cost & DIY");

  const [aqiData, setAqiData] = useState<AirQualityResponse | null>(null);
  const [recommendations, setRecommendations] =
    useState<RoutineHacksResponse | null>(null);
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
        nextVuln === "None"
          ? []
          : nextVuln === "Asthma"
          ? ["asthmatic"]
          : ["infant", "elderly"],
      homeSetup:
        nextSetup === "Air Purifier"
          ? "Apartment with air purifiers"
          : "Naturally ventilated apartment",
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
    const pm25 = aqiData?.current.pm2_5 ?? "--";
    const maskAdvice =
      aqiData && aqiData.current.pm2_5 > 75
        ? "Wear a tight-fit N95/FFP2 outdoors"
        : "Surgical/N95 recommended for traffic commutes";

    const safeWindows =
      recommendations?.daily_routine
        .filter((w) => w.ventilation_status === "open_briefly")
        .map((w) => w.time_window)
        .join(", ") || "12:00–16:00 (Solar Mixing Window)";

    const briefLines = [
      `*NafasNet Family Air Brief — ${city}*`,
      `Live PM2.5: ${pm25} µg/m³ | US AQI: ${aqiData?.current.us_aqi ?? "--"}`,
      `Profile: ${commuteOpt} · ${vulnOpt} · ${setupOpt}`,
      `Safe Ventilation Hours: ${safeWindows}`,
      `Mask Advice: ${maskAdvice}`,
    ];

    try {
      await navigator.clipboard.writeText(briefLines.join("\n"));
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  const riskBadgeStyle = (risk?: string) => {
    switch (risk) {
      case "hazardous":
      case "very_unhealthy":
        return "border-red-500/40 bg-red-950/40 text-red-300";
      case "unhealthy":
        return "border-amber-500/40 bg-amber-950/40 text-amber-300";
      case "moderate":
        return "border-zinc-700 bg-zinc-900 text-zinc-300";
      default:
        return "border-emerald-500/40 bg-emerald-950/40 text-emerald-300";
    }
  };

  return (
    <div className="min-h-screen mashrabiya-bg text-zinc-100 font-sans pb-20 sm:pb-16">
      <IntroSplash />
      <ScrollHUD city={aqiData?.city || persona.location} pm25={aqiData?.current.pm2_5} />

      {/* Non-Sticky Top Header & Location Bar */}
      <header className="relative overflow-hidden bg-black/90">
        {/* Inline SVG Mashrabiya Lattice Pattern masked with radial gradient */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
        >
          <defs>
            <pattern
              id="headerMashrabiya"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M24 0L48 24L24 48L0 24Z M24 8L40 24L24 40L8 24Z"
                fill="none"
                stroke="#E5A93C"
                strokeWidth="0.9"
              />
              <circle cx="24" cy="24" r="2" fill="none" stroke="#E5A93C" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#headerMashrabiya)" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo />

            <div className="text-right font-mono text-xs text-zinc-500 hidden md:block">
              {aqiData
                ? `${aqiData.latitude.toFixed(2)}°N, ${aqiData.longitude.toFixed(2)}°E`
                : "Resolving coordinates..."}
            </div>
          </div>

          <LocationPicker
            currentCity={aqiData?.city || persona.location}
            latitude={aqiData?.latitude}
            longitude={aqiData?.longitude}
            loading={loadingAQI}
            onSelectLocation={handleSelectLocation}
          />

          {/* Global Household Context Bar + Family Brief Export */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400 font-medium">Commute:</span>
                {COMMUTE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => syncHouseholdProfile(opt, vulnOpt, setupOpt)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      commuteOpt === opt
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#E5C158] font-medium"
                        : "bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400 font-medium">Vulnerability:</span>
                {VULNERABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => syncHouseholdProfile(commuteOpt, opt, setupOpt)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      vulnOpt === opt
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#E5C158] font-medium"
                        : "bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400 font-medium">Setup:</span>
                {SETUP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => syncHouseholdProfile(commuteOpt, vulnOpt, opt)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      setupOpt === opt
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/60 text-[#E5C158] font-medium"
                        : "bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyFamilyBrief}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] hover:bg-[#E5C158] text-black transition-colors shrink-0 self-start lg:self-auto"
            >
              {copiedBrief ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedBrief ? "Copied for WhatsApp" : "Copy Family Brief"}
            </button>
          </div>
        </div>
        {/* Subtle Burnished-Gold Bottom Hairline */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3.5 text-red-300 flex items-center gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: Live Telemetry + Exposure Reality Check */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="section-telemetry">
          <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between card-interactive">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-gold-pulse" />
                  Live Atmospheric Reading
                </span>
                <span className="font-mono text-zinc-500">
                  {aqiData?.current.time
                    ? new Date(aqiData.current.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </span>
              </div>

              <div className="mt-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold text-white tracking-tight truncate">
                    {aqiData?.city || persona.location}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">
                    {aqiData?.country ? `${aqiData.country} · ` : ""}
                    Dominant:{" "}
                    <span className="text-zinc-300">
                      {aqiData?.current.dominant_pollutant || "PM2.5"}
                    </span>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border shrink-0 ${riskBadgeStyle(
                    aqiData?.current.risk_level
                  )}`}
                >
                  {aqiData?.current.risk_level?.replace("_", " ") || "Loading"}
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-white font-mono tabular-nums">
                  <AnimatedNumber value={aqiData?.current.pm2_5} decimals={1} />
                </span>
                <span className="text-base font-mono text-zinc-500">µg/m³</span>
                <span className="ml-auto text-xs font-mono text-zinc-500">
                  US AQI{" "}
                  <strong className="text-[#E5C158] text-sm">
                    <AnimatedNumber value={aqiData?.current.us_aqi} />
                  </strong>
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-800 bg-black text-xs font-mono text-zinc-400">
                <Cigarette className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>
                  Equiv:{" "}
                  <strong className="text-zinc-100">
                    {aqiData ? (aqiData.current.pm2_5 / 22).toFixed(1) : "--"}
                  </strong>{" "}
                  cigarettes/day
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-zinc-800">
              <div className="bg-black p-3 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-500 block">PM10</span>
                <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
                  {aqiData?.current.pm10 ?? "--"}{" "}
                  <span className="text-[11px] font-normal text-zinc-500">µg</span>
                </span>
              </div>
              <div className="bg-black p-3 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-500 block">NO₂</span>
                <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
                  {aqiData?.current.nitrogen_dioxide ?? "--"}{" "}
                  <span className="text-[11px] font-normal text-zinc-500">µg</span>
                </span>
              </div>
              <div className="bg-black p-3 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-500 block">Dust</span>
                <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
                  {aqiData?.current.dust ?? "--"}{" "}
                  <span className="text-[11px] font-normal text-zinc-500">µg</span>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <ExposureFacts aqiData={aqiData} />
          </div>
        </div>

        {/* SECTION 2: Interactive Charts Suite & Multi-City Matrix */}
        <div id="section-timeline" className="space-y-5">
          {aqiData?.hourly && aqiData.hourly.length > 0 ? (
            <>
              <ScrollReveal>
                <AQITimeline hourlyData={aqiData.hourly} locationName={aqiData.city} />
              </ScrollReveal>
              <ScrollReveal delayMs={60}>
                <AnalyticsCharts aqiData={aqiData} />
              </ScrollReveal>
              <ScrollReveal delayMs={100}>
                <CityCompare primaryCity={aqiData} />
              </ScrollReveal>
            </>
          ) : (
            <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
              Loading 24-hour atmospheric telemetry...
            </div>
          )}
        </div>

        {/* SECTION 2B: Thermal Inversion Scrubber */}
        <ScrollReveal>
          <section id="section-inversion">
            <InversionScrubber
              hourlyData={
                aqiData?.hourly?.map((h) => ({
                  time: h.formattedTime,
                  pm25: h.pm2_5,
                })) ?? []
              }
              selectedHour={selectedHour}
              onHourChange={setSelectedHour}
            />
          </section>
        </ScrollReveal>

        {/* SECTION 3: Diurnal Routine Cards (synced with InversionScrubber & Household Profile) */}
        <ScrollReveal>
          <div
            id="section-routine"
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                  Personalized Daily Routine
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  {recommendations?.summary ||
                    "Synthesizing thermal inversion timing and household exposure guidance..."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchRecommendations(persona, aqiData)}
                disabled={loadingRecs}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? "animate-spin" : ""}`} />
                Regenerate Plan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recommendations?.daily_routine.map((window, idx) => {
                const isHighlighted = doesHourMatchWindow(selectedHour, window.time_window);
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-4 flex flex-col justify-between transition-all duration-200 card-interactive ${
                      isHighlighted
                        ? "border-[#D4AF37]/70 bg-zinc-900/90 ring-1 ring-[#D4AF37]/30"
                        : "border-zinc-800 bg-black"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className="text-xs font-semibold text-white font-mono">
                          {window.time_window.split("(")[0]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${riskBadgeStyle(
                            window.risk_level
                          )}`}
                        >
                          {window.risk_level.replace("_", " ")}
                        </span>
                      </div>

                      {isHighlighted && (
                        <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/40">
                          Selected Hour ({String(selectedHour).padStart(2, "0")}:00)
                        </div>
                      )}

                      <div className="space-y-2.5 text-xs mt-1">
                        <div>
                          <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">
                            Activity
                          </span>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {window.activity_advice}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-zinc-400 block mb-0.5">
                            Commute
                          </span>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {window.commute_recommendation}
                          </p>
                        </div>
                        {vulnOpt !== "None" && (
                          <div className="pt-1.5 border-t border-zinc-800 text-[11px] text-[#E5C158]">
                            {vulnOpt === "Asthma"
                              ? "Asthma tip: Keep rescue inhaler accessible & wear N95."
                              : "Kids & Elderly: Keep indoors with sealed gaps during peak."}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-500">Ventilation</span>
                      <span
                        className={
                          window.ventilation_status === "keep_closed"
                            ? "text-red-400"
                            : window.ventilation_status === "open_briefly"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {window.ventilation_status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* SECTION 3B: Interactive Room & Protocol Studio */}
        <ScrollReveal>
          <section id="section-iaq-room">
            <RoomBlueprint />
          </section>
        </ScrollReveal>

        {/* SECTION 4: Commuter Impact Simulator */}
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

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-50 bg-zinc-950/95 border border-zinc-800 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex items-center justify-around text-[11px] font-medium">
        <a href="#section-telemetry" className="flex flex-col items-center py-1 px-3 text-zinc-200">
          <Activity className="w-4 h-4 mb-0.5 text-[#D4AF37]" />
          <span>Live</span>
        </a>
        <a href="#section-timeline" className="flex flex-col items-center py-1 px-3 text-zinc-400">
          <Clock className="w-4 h-4 mb-0.5" />
          <span>Charts</span>
        </a>
        <a href="#section-routine" className="flex flex-col items-center py-1 px-3 text-zinc-400">
          <Shield className="w-4 h-4 mb-0.5" />
          <span>Routine</span>
        </a>
        <a href="#section-simulator" className="flex flex-col items-center py-1 px-3 text-zinc-400">
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>Simulator</span>
        </a>
      </nav>

      {/* Minimal Attribution Footer */}
      <footer className="border-t border-zinc-900 bg-black py-6 mt-10 text-center text-xs text-zinc-500 px-4">
        <div className="max-w-7xl mx-auto">
          NafasNet · Telemetry powered by Open-Meteo Air Quality &amp; Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
}
