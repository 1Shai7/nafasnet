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
import ImpactSimulator from "@/components/ImpactSimulator";
import PersonaSelector from "@/components/PersonaSelector";
import {
  Wind,
  Shield,
  Users,
  RefreshCw,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Sliders,
  Share2,
  Check,
  Cigarette,
} from "lucide-react";

const DEFAULT_PERSONA: HouseholdPersona = {
  location: "New Delhi",
  sensitiveMembers: ["asthmatic"],
  homeSetup: "Naturally ventilated apartment",
  commuteType: "Two-Wheeler",
  commuteDistanceKm: 20,
  commuteHoursPerDay: 1.5,
};

export default function Dashboard() {
  const [persona, setPersona] = useState<HouseholdPersona>(DEFAULT_PERSONA);
  const [aqiData, setAqiData] = useState<AirQualityResponse | null>(null);
  const [recommendations, setRecommendations] =
    useState<RoutineHacksResponse | null>(null);

  const [loadingAQI, setLoadingAQI] = useState<boolean>(true);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHackTab, setActiveHackTab] = useState<
    "all" | "zero-cost" | "diy" | "appliance"
  >("all");
  const [copiedBrief, setCopiedBrief] = useState(false);

  const handleCopyBrief = async () => {
    const city = aqiData?.city || persona.location;
    const pm25 = aqiData?.current.pm2_5 ?? "--";
    const cigs = aqiData ? (aqiData.current.pm2_5 / 22).toFixed(1) : "--";
    const briefLines = [
      `PranaGrid Daily Air Brief — ${city}`,
      `Live PM2.5: ${pm25} µg/m³ (~${cigs} cigarettes/day) | US AQI: ${aqiData?.current.us_aqi ?? "--"}`,
      `Profile: ${persona.commuteType} | ${persona.homeSetup}`,
      ``,
      ...(recommendations?.daily_routine.map(
        (w) => `• ${w.time_window}: ${w.ventilation_status.replace("_", " ")} — ${w.activity_advice}`
      ) || []),
    ];
    try {
      await navigator.clipboard.writeText(briefLines.join("\n"));
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

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
      const msg =
        err instanceof Error ? err.message : "Error querying air quality";
      setError(msg);
      return null;
    } finally {
      setLoadingAQI(false);
    }
  }, []);

  const fetchRecommendations = useCallback(
    async (
      currentPersona: HouseholdPersona,
      currentAQI: AirQualityResponse | null
    ) => {
      setLoadingRecs(true);
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            persona: currentPersona,
            aqiData: currentAQI,
          }),
        });
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const json = await res.json();
        if (json.success && json.data) {
          setRecommendations(json.data);
        }
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

  const handleSelectLocation = async (loc: SelectedLocation) => {
    const updatedPersona = { ...persona, location: loc.city };
    setPersona(updatedPersona);
    const aqi = await fetchAQI(loc);
    await fetchRecommendations(updatedPersona, aqi);
  };

  const handlePersonaChange = async (newPersona: HouseholdPersona) => {
    setPersona(newPersona);
    await fetchRecommendations(newPersona, aqiData);
  };

  const filteredHacks =
    recommendations?.indoor_hacks.filter((hack) =>
      activeHackTab === "all" ? true : hack.category === activeHackTab
    ) || [];

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
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans pb-20 sm:pb-12">
      {/* Top Header & Location Bar */}
      <header className="border-b border-zinc-800 bg-black/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4 text-zinc-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                    PranaGrid
                  </h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded border border-zinc-800 bg-zinc-950 text-zinc-400">
                    Open-Meteo
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded border border-zinc-800 bg-zinc-950 text-zinc-400 hidden sm:inline-block">
                    Gemini 2.5
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">
                  Winter Smog Telemetry &amp; Indoor Air Quality Intelligence
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-zinc-500 hidden md:block">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Concise Mission & Differentiator Strip */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Why PranaGrid
            </span>
            <p className="text-sm text-zinc-200 mt-1 leading-relaxed">
              Translating live hourly smog telemetry into inversion safe-windows, zero-cost-to-DIY indoor air hacks, and deterministic PM2.5 &amp; CO₂ math.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 transition-colors"
            >
              {copiedBrief ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Share2 className="w-3 h-3 text-zinc-400" />
              )}
              {copiedBrief ? "Brief Copied" : "Copy Air Brief"}
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-800 bg-black text-zinc-300">
              <Clock className="w-3 h-3 text-zinc-400" />
              Inversion Windows
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-800 bg-black text-zinc-300">
              <Activity className="w-3 h-3 text-zinc-400" />
              PM2.5 &amp; CO₂ Math
            </span>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3.5 text-red-300 flex items-center gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: Live Telemetry + Persona Tuning */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          id="section-telemetry"
        >
          {/* Realtime Telemetry */}
          <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="uppercase tracking-wider">
                  Live Atmospheric Reading
                </span>
                <span>
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
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border shrink-0 ${riskBadgeStyle(
                    aqiData?.current.risk_level
                  )}`}
                >
                  {aqiData?.current.risk_level?.replace("_", " ") || "Loading"}
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-white font-mono tabular-nums">
                  {aqiData?.current.pm2_5 ?? "--"}
                </span>
                <span className="text-base font-mono text-zinc-500">µg/m³</span>
                <span className="ml-auto text-xs font-mono text-zinc-500">
                  US AQI{" "}
                  <strong className="text-zinc-200 text-sm">
                    {aqiData?.current.us_aqi ?? "--"}
                  </strong>
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-zinc-800 bg-black text-[11px] font-mono text-zinc-400">
                <Cigarette className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  Berkeley Earth equiv:{" "}
                  <strong className="text-zinc-100">
                    {aqiData ? (aqiData.current.pm2_5 / 22).toFixed(1) : "--"}
                  </strong>{" "}
                  cigarettes/day
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-zinc-800">
              <div className="bg-black p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  PM10
                </span>
                <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
                  {aqiData?.current.pm10 ?? "--"}{" "}
                  <span className="text-[10px] font-normal text-zinc-500">µg</span>
                </span>
              </div>
              <div className="bg-black p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  NO₂
                </span>
                <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
                  {aqiData?.current.nitrogen_dioxide ?? "--"}{" "}
                  <span className="text-[10px] font-normal text-zinc-500">µg</span>
                </span>
              </div>
              <div className="bg-black p-3 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  Dust
                </span>
                <span className="text-base font-semibold text-zinc-100 font-mono mt-0.5 block">
                  {aqiData?.current.dust ?? "--"}{" "}
                  <span className="text-[10px] font-normal text-zinc-500">µg</span>
                </span>
              </div>
            </div>
          </div>

          {/* Persona Tuning */}
          <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
                  Household Persona Configuration
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                PROTOCOL INPUT
              </span>
            </div>

            <PersonaSelector
              persona={persona}
              onPersonaChange={handlePersonaChange}
            />
          </div>
        </div>

        {/* SECTION 2: Interactive Charts Suite & Multi-City Matrix */}
        <div id="section-timeline" className="space-y-5">
          {aqiData?.hourly && aqiData.hourly.length > 0 ? (
            <>
              <AQITimeline
                hourlyData={aqiData.hourly}
                locationName={aqiData.city}
              />
              <AnalyticsCharts aqiData={aqiData} />
              <CityCompare primaryCity={aqiData} />
            </>
          ) : (
            <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 text-xs font-mono">
              Loading 24-hour atmospheric telemetry...
            </div>
          )}
        </div>

        {/* SECTION 3: Daily Routine & Indoor Hacks */}
        <div
          id="section-routine"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                {recommendations?.ai_model_used || "Gemini 2.5 Flash Engine"}
              </span>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white mt-0.5">
                Personalized Routine &amp; Indoor Mitigation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                {recommendations?.summary ||
                  "Synthesizing thermal inversion timing and indoor filtration protocols..."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchRecommendations(persona, aqiData)}
              disabled={loadingRecs}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingRecs ? "animate-spin" : ""}`}
              />
              Regenerate Plan
            </button>
          </div>

          {/* 4 Diurnal Windows */}
          <div>
            <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Diurnal Inversion Windows
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recommendations?.daily_routine.map((window, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-800 bg-black p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white font-mono">
                        {window.time_window.split("(")[0]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${riskBadgeStyle(
                          window.risk_level
                        )}`}
                      >
                        {window.risk_level.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mb-3 font-medium">
                      {window.time_window.includes("(")
                        ? window.time_window.slice(
                            window.time_window.indexOf("(")
                          )
                        : ""}
                    </p>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                          Activity
                        </span>
                        <p className="text-zinc-300 leading-relaxed text-[11px]">
                          {window.activity_advice}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                          Commute
                        </span>
                        <p className="text-zinc-300 leading-relaxed text-[11px]">
                          {window.commute_recommendation}
                        </p>
                      </div>
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
              ))}
            </div>
          </div>

          {/* Indoor Hacks */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                Indoor Mitigation Protocols
              </h3>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(["all", "zero-cost", "diy", "appliance"] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveHackTab(cat)}
                      className={`px-3 py-1 rounded-md text-xs font-medium capitalize border transition-colors shrink-0 ${
                        activeHackTab === cat
                          ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                          : "bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {cat.replace("-", " ")}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredHacks.map((hack, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-800 bg-black p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase border border-zinc-800 bg-zinc-950 text-zinc-300">
                        {hack.category}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {hack.estimated_aqi_drop}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-100 mb-1.5">
                      {hack.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      {hack.description}
                    </p>

                    <div className="space-y-1.5">
                      {hack.actionable_steps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2 text-[11px] text-zinc-300 leading-snug"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Effort: {hack.effort}</span>
                    {hack.cost_estimate && <span>{hack.cost_estimate}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Impact Simulator */}
        <div id="section-simulator">
          <ImpactSimulator
            key={aqiData?.city || "default"}
            initialPM25={aqiData?.current.pm2_5 ?? 125}
            initialDust={aqiData?.current.dust ?? 30}
            locationName={aqiData?.city || persona.location}
          />
        </div>

        {/* SECTION 5: Key Precautions */}
        {recommendations?.key_precautions &&
          recommendations.key_precautions.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                Safeguards for Vulnerable Residents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.key_precautions.map((precaution, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-lg bg-black border border-zinc-800 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0">
                      {pIdx + 1}
                    </span>
                    <span>{precaution}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-50 bg-zinc-950/95 border border-zinc-800 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex items-center justify-around text-[11px] font-medium">
        <a
          href="#section-telemetry"
          className="flex flex-col items-center py-1 px-3 text-zinc-200"
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>Live</span>
        </a>
        <a
          href="#section-timeline"
          className="flex flex-col items-center py-1 px-3 text-zinc-400"
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>Charts</span>
        </a>
        <a
          href="#section-routine"
          className="flex flex-col items-center py-1 px-3 text-zinc-400"
        >
          <Shield className="w-4 h-4 mb-0.5" />
          <span>Plan</span>
        </a>
        <a
          href="#section-simulator"
          className="flex flex-col items-center py-1 px-3 text-zinc-400"
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>Simulator</span>
        </a>
      </nav>

      <footer className="border-t border-zinc-900 bg-black py-6 mt-10 text-center text-[11px] text-zinc-500 px-4">
        <div className="max-w-7xl mx-auto font-mono">
          PranaGrid · Open-Meteo Air Quality &amp; Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
}
