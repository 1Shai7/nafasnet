"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
        return "border-rose-500/40 bg-rose-500/10 text-rose-300";
      case "unhealthy":
        return "border-amber-500/40 bg-amber-500/10 text-amber-300";
      case "moderate":
        return "border-white/15 bg-white/5 text-slate-300";
      default:
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1117] text-slate-100 font-sans pb-20 sm:pb-16">
      <IntroSplash />
      <ScrollHUD city={aqiData?.city || persona.location} pm25={aqiData?.current.pm2_5} />

      {/* Non-Sticky Top Header & Location Bar */}
      <header className="border-b border-white/10 bg-[#0B1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-white/15 bg-[#131B24] overflow-hidden flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="NafasNet Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                    NafasNet
                  </h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-white/15 bg-[#131B24] text-slate-300">
                    نَفَس
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Civic Air Quality Telemetry &amp; Household Exposure Guidance
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-400 hidden md:block">
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
          <div className="rounded-xl border border-white/10 bg-[#131B24] p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">Commute:</span>
                {COMMUTE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => syncHouseholdProfile(opt, vulnOpt, setupOpt)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      commuteOpt === opt
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium"
                        : "bg-[#0B1117] border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">Vulnerability:</span>
                {VULNERABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => syncHouseholdProfile(commuteOpt, opt, setupOpt)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      vulnOpt === opt
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-medium"
                        : "bg-[#0B1117] border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">Setup:</span>
                {SETUP_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => syncHouseholdProfile(commuteOpt, vulnOpt, opt)}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      setupOpt === opt
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium"
                        : "bg-[#0B1117] border-white/10 text-slate-400 hover:text-slate-200"
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
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0 self-start lg:self-auto"
            >
              {copiedBrief ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedBrief ? "Copied for WhatsApp" : "Copy Family Brief"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-rose-200 flex items-center gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: Live Telemetry + Exposure Reality Check */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="section-telemetry">
          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#131B24] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Live Atmospheric Reading
                </span>
                <span className="font-mono">
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
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {aqiData?.country ? `${aqiData.country} · ` : ""}
                    Dominant:{" "}
                    <span className="text-slate-200">
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
                <span className="text-base font-mono text-slate-400">µg/m³</span>
                <span className="ml-auto text-xs font-mono text-slate-400">
                  US AQI{" "}
                  <strong className="text-emerald-400 text-sm">
                    <AnimatedNumber value={aqiData?.current.us_aqi} />
                  </strong>
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/10 bg-[#0B1117] text-xs font-mono text-slate-300">
                <Cigarette className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Equiv:{" "}
                  <strong className="text-slate-100">
                    {aqiData ? (aqiData.current.pm2_5 / 22).toFixed(1) : "--"}
                  </strong>{" "}
                  cigarettes/day
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-white/10">
              <div className="bg-[#0B1117] p-3 rounded-lg border border-white/10">
                <span className="text-xs text-slate-400 block">PM10</span>
                <span className="text-base font-semibold text-slate-100 font-mono mt-0.5 block">
                  {aqiData?.current.pm10 ?? "--"}{" "}
                  <span className="text-[11px] font-normal text-slate-500">µg</span>
                </span>
              </div>
              <div className="bg-[#0B1117] p-3 rounded-lg border border-white/10">
                <span className="text-xs text-slate-400 block">NO₂</span>
                <span className="text-base font-semibold text-slate-100 font-mono mt-0.5 block">
                  {aqiData?.current.nitrogen_dioxide ?? "--"}{" "}
                  <span className="text-[11px] font-normal text-slate-500">µg</span>
                </span>
              </div>
              <div className="bg-[#0B1117] p-3 rounded-lg border border-white/10">
                <span className="text-xs text-slate-400 block">Dust</span>
                <span className="text-base font-semibold text-slate-100 font-mono mt-0.5 block">
                  {aqiData?.current.dust ?? "--"}{" "}
                  <span className="text-[11px] font-normal text-slate-500">µg</span>
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
            <div className="p-8 text-center bg-[#131B24] rounded-xl border border-white/10 text-slate-400 text-xs">
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
            className="rounded-xl border border-white/10 bg-[#131B24] p-4 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                  Personalized Daily Routine
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {recommendations?.summary ||
                    "Synthesizing thermal inversion timing and household exposure guidance..."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchRecommendations(persona, aqiData)}
                disabled={loadingRecs}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-white/15 bg-[#0B1117] hover:bg-white/5 text-slate-100 font-medium text-xs transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0"
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
                    className={`rounded-lg border p-4 flex flex-col justify-between transition-all duration-200 ${
                      isHighlighted
                        ? "border-emerald-400/60 bg-[#182330] ring-1 ring-emerald-400/30"
                        : "border-white/10 bg-[#0B1117]"
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
                        <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Selected Hour ({String(selectedHour).padStart(2, "0")}:00)
                        </div>
                      )}

                      <div className="space-y-2.5 text-xs mt-1">
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                            Activity
                          </span>
                          <p className="text-slate-200 leading-relaxed text-[11px]">
                            {window.activity_advice}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                            Commute
                          </span>
                          <p className="text-slate-200 leading-relaxed text-[11px]">
                            {window.commute_recommendation}
                          </p>
                        </div>
                        {vulnOpt !== "None" && (
                          <div className="pt-1.5 border-t border-white/10 text-[11px] text-amber-300">
                            {vulnOpt === "Asthma"
                              ? "Asthma tip: Keep rescue inhaler accessible & wear N95."
                              : "Kids & Elderly: Keep indoors with sealed gaps during peak."}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Ventilation</span>
                      <span
                        className={
                          window.ventilation_status === "keep_closed"
                            ? "text-rose-400"
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
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-50 bg-[#131B24]/95 border border-white/10 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex items-center justify-around text-[11px] font-medium">
        <a href="#section-telemetry" className="flex flex-col items-center py-1 px-3 text-slate-200">
          <Activity className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span>Live</span>
        </a>
        <a href="#section-timeline" className="flex flex-col items-center py-1 px-3 text-slate-400">
          <Clock className="w-4 h-4 mb-0.5" />
          <span>Charts</span>
        </a>
        <a href="#section-routine" className="flex flex-col items-center py-1 px-3 text-slate-400">
          <Shield className="w-4 h-4 mb-0.5" />
          <span>Routine</span>
        </a>
        <a href="#section-simulator" className="flex flex-col items-center py-1 px-3 text-slate-400">
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>Simulator</span>
        </a>
      </nav>

      {/* Minimal Attribution Footer */}
      <footer className="border-t border-white/10 bg-[#0B1117] py-6 mt-10 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto">
          NafasNet · Telemetry powered by Open-Meteo Air Quality &amp; Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
}
