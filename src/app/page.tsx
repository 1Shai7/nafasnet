"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AirQualityResponse,
  HouseholdPersona,
  RoutineHacksResponse,
} from "@/lib/types";
import AQITimeline from "@/components/AQITimeline";
import ImpactSimulator from "@/components/ImpactSimulator";
import PersonaSelector from "@/components/PersonaSelector";
import {
  Wind,
  Shield,
  Sparkles,
  Search,
  Users,
  RefreshCw,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Sliders,
} from "lucide-react";

// Default Persona: Two-Wheeler Commuter in Delhi/NCR facing high road particulate
const DEFAULT_PERSONA: HouseholdPersona = {
  location: "New Delhi",
  sensitiveMembers: ["asthmatic"],
  homeSetup: "Naturally ventilated apartment",
  commuteType: "Two-Wheeler",
  commuteDistanceKm: 20,
  commuteHoursPerDay: 1.5,
};

const PRESET_CITIES = [
  "New Delhi",
  "Beijing",
  "Mumbai",
  "Los Angeles",
  "London",
  "Tokyo",
  "Lahore",
];

export default function Dashboard() {
  const [persona, setPersona] = useState<HouseholdPersona>(DEFAULT_PERSONA);
  const [cityInput, setCityInput] = useState<string>(DEFAULT_PERSONA.location);
  const [aqiData, setAqiData] = useState<AirQualityResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RoutineHacksResponse | null>(null);

  const [loadingAQI, setLoadingAQI] = useState<boolean>(true);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHackTab, setActiveHackTab] = useState<"all" | "zero-cost" | "diy" | "appliance">("all");

  // Fetch 24h Air Quality telemetry
  const fetchAQI = useCallback(async (city: string) => {
    setLoadingAQI(true);
    setError(null);
    try {
      const res = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error("Failed to fetch air quality data");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Air quality fetch failed");
      setAqiData(json.data);
      return json.data as AirQualityResponse;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error querying air quality";
      setError(msg);
      console.error("[Dashboard AQI Error]", err);
      return null;
    } finally {
      setLoadingAQI(false);
    }
  }, []);

  // Fetch Gemini 2.5 Flash Recommendations
  const fetchRecommendations = useCallback(
    async (currentPersona: HouseholdPersona, currentAQI: AirQualityResponse | null) => {
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
        if (!res.ok) throw new Error("Failed to fetch Gemini recommendations");
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

  // Initial Load
  useEffect(() => {
    (async () => {
      const aqi = await fetchAQI(persona.location);
      await fetchRecommendations(persona, aqi);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle City Change
  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const updatedPersona = { ...persona, location: cityInput.trim() };
    setPersona(updatedPersona);
    const aqi = await fetchAQI(updatedPersona.location);
    await fetchRecommendations(updatedPersona, aqi);
  };

  const handleCityPresetClick = async (city: string) => {
    setCityInput(city);
    const updatedPersona = { ...persona, location: city };
    setPersona(updatedPersona);
    const aqi = await fetchAQI(city);
    await fetchRecommendations(updatedPersona, aqi);
  };

  // Handle Persona Preset or Custom Change
  const handlePersonaChange = async (newPersona: HouseholdPersona) => {
    setPersona(newPersona);
    if (newPersona.location && newPersona.location !== cityInput) {
      setCityInput(newPersona.location);
    }
    await fetchRecommendations(newPersona, aqiData);
  };

  const filteredHacks =
    recommendations?.indoor_hacks.filter((hack) =>
      activeHackTab === "all" ? true : hack.category === activeHackTab
    ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20 sm:pb-12">
      {/* Top Banner & Header (Mobile Responsive) */}
      <header className="relative border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Title / Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                  <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white truncate">
                    VayuMitra
                  </h1>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Gemini 2.5
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden xs:inline-block">
                    Open-Meteo
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  Personalized Winter Smog Survival Intelligence
                </p>
              </div>
            </div>

            {/* City Search Bar (Full Width on Mobile with No iOS Auto-Zoom) */}
            <form onSubmit={handleCitySubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city (e.g. Delhi, London)..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-base sm:text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 h-10 sm:h-9"
                />
              </div>
              <button
                type="submit"
                disabled={loadingAQI || loadingRecs}
                className="px-3.5 sm:px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 h-10 sm:h-9 shrink-0 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAQI ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Quick Preset Cities (Horizontal Swipe on Mobile) */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 py-0.5 touch-pan-x">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium shrink-0">
              Presets:
            </span>
            {PRESET_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleCityPresetClick(city)}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all shrink-0 active:scale-95 ${
                  persona.location.toLowerCase() === city.toLowerCase()
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Value Proposition Banner */}
        <section className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/70 to-cyan-950/30 p-4 sm:p-6 lg:p-7 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
                <Wind className="w-3 h-3" />
                Why VayuMitra?
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
                Translating live hourly winter smog telemetry into personalized safe-window routines, zero-cost-to-appliance indoor air hacks, and quantified health/carbon impact.
              </h2>
            </div>

            {/* 3 Core Differentiator Badges */}
            <div className="flex flex-wrap lg:flex-nowrap gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Hourly Inversion Safe-Windows
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                Persona-Tailored Protocols
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Activity className="w-3.5 h-3.5 shrink-0" />
                Deterministic PM2.5 &amp; CO₂ Math
              </span>
            </div>
          </div>
        </section>

        {/* Error Alert Banner */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-3.5 sm:p-4 text-red-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white">Data Fetch Alert: </span>
              {error}
            </div>
          </div>
        )}

        {/* SECTION 1: Current Realtime Telemetry & Household Persona Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6" id="section-telemetry">
          {/* Realtime Air Metrics (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-slate-950 p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Live Atmospheric Reading
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  {aqiData?.current.time ? new Date(aqiData.current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                </span>
              </div>

              <div className="mt-3 sm:mt-4 flex items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                    {aqiData?.city || persona.location}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                    {aqiData?.country ? `${aqiData.country} • ` : ""}
                    Primary:{" "}
                    <span className="text-slate-200 font-semibold">
                      {aqiData?.current.dominant_pollutant || "PM2.5 Particulate"}
                    </span>
                  </p>
                </div>

                {/* Risk Category Badge */}
                <div
                  className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider border shadow-sm shrink-0 ${
                    aqiData?.current.risk_level === "hazardous"
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                      : aqiData?.current.risk_level === "very_unhealthy"
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : aqiData?.current.risk_level === "unhealthy"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  {aqiData?.current.risk_level?.replace("_", " ") || "Calculating"}
                </div>
              </div>

              {/* Responsive PM2.5 Meter */}
              <div className="mt-4 sm:mt-6 flex items-baseline gap-2 sm:gap-3">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                  {aqiData?.current.pm2_5 ?? 115}
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-400">µg/m³</span>
                <span className="ml-auto text-xs font-medium text-slate-400">
                  US AQI:{" "}
                  <span className="font-bold text-white font-mono text-sm">
                    {aqiData?.current.us_aqi || 165}
                  </span>
                </span>
              </div>
            </div>

            {/* Pollutant Sub-Grid (3 columns with compact mobile spacing) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-800/80">
              <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/60 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">PM10</span>
                <span className="text-base sm:text-lg font-bold text-slate-100 font-mono mt-0.5 block">
                  {aqiData?.current.pm10 ?? 120} <span className="text-[9px] font-normal text-slate-400">µg</span>
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/60 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">NO₂ Gas</span>
                <span className="text-base sm:text-lg font-bold text-purple-300 font-mono mt-0.5 block">
                  {aqiData?.current.nitrogen_dioxide ?? 55} <span className="text-[9px] font-normal text-slate-400">µg</span>
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/60 text-center sm:text-left">
                <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">Dust</span>
                <span className="text-base sm:text-lg font-bold text-cyan-300 font-mono mt-0.5 block">
                  {aqiData?.current.dust ?? 25} <span className="text-[9px] font-normal text-slate-400">µg</span>
                </span>
              </div>
            </div>
          </div>

          {/* Persona Configuration Station (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Household Persona Tuning
                  </h3>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  Gemini Prompt Input
                </span>
              </div>

              <PersonaSelector
                persona={persona}
                onPersonaChange={handlePersonaChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: 24-Hour Timeline via Recharts */}
        <div id="section-timeline">
          {aqiData?.hourly && aqiData.hourly.length > 0 ? (
            <AQITimeline hourlyData={aqiData.hourly} locationName={aqiData.city} />
          ) : (
            <div className="p-8 text-center bg-slate-900/50 rounded-2xl sm:rounded-3xl border border-slate-800 text-slate-400 text-xs sm:text-sm">
              Loading 24-hour atmospheric chemistry profile...
            </div>
          )}
        </div>

        {/* SECTION 3: Gemini 2.5 Flash Daily Routine & Categorized Indoor Hacks */}
        <div
          id="section-routine"
          className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-5 sm:space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1.5">
                <Sparkles className="w-3 h-3" />
                {recommendations?.ai_model_used || "Gemini 2.5 Flash Architecture"}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Personalized Routine & Indoor Hacks
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {recommendations?.summary ||
                  "Synthesizing optimal ventilation timing, commute shields, and micro-inversion survival hacks..."}
              </p>
            </div>

            <button
              onClick={() => fetchRecommendations(persona, aqiData)}
              disabled={loadingRecs}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 active:scale-95 self-start sm:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? "animate-spin" : ""}`} />
              Regenerate Plan
            </button>
          </div>

          {/* 4 Daily Routine Windows (Responsive Grid) */}
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Diurnal Inversion Windows
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {recommendations?.daily_routine.map((window, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-xs font-bold text-white font-mono">
                        {window.time_window.split("(")[0]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${
                          window.risk_level === "hazardous"
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                            : window.risk_level === "very_unhealthy"
                            ? "bg-red-500/20 border-red-500/40 text-red-300"
                            : window.risk_level === "unhealthy"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        }`}
                      >
                        {window.risk_level.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs font-semibold text-cyan-300 mb-2">
                      {window.time_window.includes("(") ? window.time_window.slice(window.time_window.indexOf("(")) : ""}
                    </p>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Activity Guidance
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                          {window.activity_advice}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Commute Shield
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                          {window.commute_recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px]">
                    <span className="text-slate-400">Ventilation:</span>
                    <span
                      className={`font-semibold capitalize ${
                        window.ventilation_status === "keep_closed"
                          ? "text-red-400"
                          : window.ventilation_status === "open_briefly"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {window.ventilation_status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categorized Indoor Hacks */}
          <div className="pt-4 sm:pt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Targeted Indoor Mitigation Hacks
              </h3>

              {/* Hack Category Filter Bar (Touch-Friendly Scroller) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 touch-pan-x">
                {(["all", "zero-cost", "diy", "appliance"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveHackTab(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all shrink-0 active:scale-95 ${
                      activeHackTab === cat
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Hacks Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {filteredHacks.map((hack, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${
                          hack.category === "zero-cost"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : hack.category === "diy"
                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                            : "bg-purple-500/20 border-purple-500/40 text-purple-300"
                        }`}
                      >
                        {hack.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-400">
                        {hack.estimated_aqi_drop}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1.5 leading-snug">
                      {hack.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {hack.description}
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                        Action Steps:
                      </span>
                      {hack.actionable_steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-300 leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                    <span>Effort: <span className="text-slate-200 capitalize font-medium">{hack.effort}</span></span>
                    {hack.cost_estimate && (
                      <span className="font-mono text-slate-300">{hack.cost_estimate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Deterministic Impact Simulator */}
        <div id="section-simulator">
          <ImpactSimulator
            initialPM25={aqiData?.current.pm2_5 ?? 125}
            initialDust={aqiData?.current.dust ?? 30}
            locationName={aqiData?.city || persona.location}
          />
        </div>

        {/* SECTION 5: Key Precautions for Household Vulnerabilities */}
        {recommendations?.key_precautions && recommendations.key_precautions.length > 0 && (
          <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6 md:p-8 backdrop-blur-md">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Safeguards for Sensitive Household Members
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {recommendations.key_precautions.map((precaution, pIdx) => (
                <div
                  key={pIdx}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0 mt-0.5">
                    {pIdx + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs">{precaution}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Mobile Bottom Navigation Bar (Appears on small screens < 640px) */}
      <nav className="sm:hidden fixed bottom-3 left-3 right-3 z-50 bg-slate-900/95 border border-slate-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl flex items-center justify-around text-[11px] font-semibold">
        <a
          href="#section-telemetry"
          className="flex flex-col items-center py-1 px-3 text-cyan-400 hover:text-white transition-colors"
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>Telemetry</span>
        </a>
        <a
          href="#section-timeline"
          className="flex flex-col items-center py-1 px-3 text-slate-400 hover:text-white transition-colors"
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>24h Graph</span>
        </a>
        <a
          href="#section-routine"
          className="flex flex-col items-center py-1 px-3 text-purple-400 hover:text-white transition-colors"
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>AI Plan</span>
        </a>
        <a
          href="#section-simulator"
          className="flex flex-col items-center py-1 px-3 text-emerald-400 hover:text-white transition-colors"
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>Simulator</span>
        </a>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 sm:py-8 mt-8 sm:mt-12 text-center text-[10px] sm:text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto">
          <p>
            VayuMitra • Personalized Winter Smog Survival Intelligence (Next.js 16 &amp; Tailwind CSS v4).
          </p>
          <p className="mt-1 text-slate-600">
            Open-Meteo Air Quality telemetry & Google Gemini 2.5 Flash intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
