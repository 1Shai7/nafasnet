"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Train,
  Bike,
  Wind,
  Leaf,
  Clock,
  Gauge,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface ImpactSimulatorProps {
  initialPM25?: number;
  initialDust?: number;
  locationName?: string;
}

export default function ImpactSimulator({
  initialPM25 = 125,
  initialDust = 35,
  locationName = "Your City",
}: ImpactSimulatorProps) {
  // 1. Commuter Profile State (Defaults: Two-Wheeler Commuter facing high dust)
  const [commuteDistance, setCommuteDistance] = useState<number>(20); // km one-way
  const [exposureHours, setExposureHours] = useState<number>(1.5); // hrs on road daily
  const [ambientPM25, setAmbientPM25] = useState<number>(initialPM25);
  
  // 2. Interactive Sustainable / Protective Toggles
  const [maskType, setMaskType] = useState<"n95" | "cloth" | "none">("n95");
  const [switchToMetro, setSwitchToMetro] = useState<boolean>(true);
  const [offPeakTravel, setOffPeakTravel] = useState<boolean>(false);
  const [indoorAirSealing, setIndoorAirSealing] = useState<boolean>(true);

  // 3. Mask Efficiency Constants
  const MASK_EFFICIENCY = {
    n95: 0.95,
    cloth: 0.3,
    none: 0.0,
  };

  // 4. Deterministic Math Engine
  const metrics = useMemo(() => {
    // Breathing inhalation rate = 1.2 m³/hour
    const BREATHING_RATE = 1.2;
    const currentMaskEff = MASK_EFFICIENCY[maskType];
    const effectiveHours = offPeakTravel ? exposureHours * 0.8 : exposureHours;
    const dailyDistance = commuteDistance * 2; // Round trip

    // --- FORMULA 1: PM2.5 Avoided ---
    // PM2.5 Avoided = (1.2m³/hr * exposure_hours * PM2.5_level * mask_efficiency)
    const dailyPM25Avoided_ug =
      BREATHING_RATE * effectiveHours * ambientPM25 * currentMaskEff;
    
    const baselineIntake_ug = BREATHING_RATE * effectiveHours * ambientPM25;
    const actualInhaled_ug = baselineIntake_ug - dailyPM25Avoided_ug;
    const monthlyAvoided_mg = (dailyPM25Avoided_ug * 30) / 1000;

    // --- FORMULA 2: CO2 Saved ---
    // CO2 Saved = (Distance * 40g for two-wheeler) - (Distance * 15g for Metro)
    let co2SavedDaily_grams = 0;
    if (switchToMetro) {
      co2SavedDaily_grams = dailyDistance * 40 - dailyDistance * 15;
    }
    const monthlyCO2Saved_kg = (co2SavedDaily_grams * 22) / 1000;

    // Protection Shield Rating (0 - 100)
    let protectionScore = currentMaskEff * 60;
    if (switchToMetro) protectionScore += 25;
    if (offPeakTravel) protectionScore += 10;
    if (indoorAirSealing) protectionScore += 5;
    protectionScore = Math.min(100, Math.round(protectionScore));

    return {
      dailyPM25Avoided_ug: Math.round(dailyPM25Avoided_ug * 10) / 10,
      monthlyAvoided_mg: Math.round(monthlyAvoided_mg * 100) / 100,
      baselineIntake_ug: Math.round(baselineIntake_ug * 10) / 10,
      actualInhaled_ug: Math.round(actualInhaled_ug * 10) / 10,
      co2SavedDaily_grams: Math.round(co2SavedDaily_grams),
      monthlyCO2Saved_kg: Math.round(monthlyCO2Saved_kg * 10) / 10,
      protectionScore,
    };
  }, [
    commuteDistance,
    exposureHours,
    ambientPM25,
    maskType,
    switchToMetro,
    offPeakTravel,
    indoorAirSealing,
  ]);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header (Responsive Stack) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1.5">
            <Gauge className="w-3 h-3" />
            Deterministic Physics Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Commuter Impact & Inhalation Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate exposure math for a two-wheeler rider navigating heavy road particulate in{" "}
            <span className="text-slate-200 font-medium">{locationName}</span>.
          </p>
        </div>

        {/* Respiratory Shield Badge (Responsive layout) */}
        <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
          <div className="relative flex items-center justify-center">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 19}
                strokeDashoffset={
                  2 * Math.PI * 19 * (1 - metrics.protectionScore / 100)
                }
                strokeLinecap="round"
                className={`transition-all duration-700 ${
                  metrics.protectionScore >= 75
                    ? "text-emerald-400"
                    : metrics.protectionScore >= 40
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs sm:text-sm font-bold text-white">
              {metrics.protectionScore}%
            </span>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Respiratory Shield
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5">
              {metrics.protectionScore >= 75
                ? "Fortified Defense"
                : metrics.protectionScore >= 40
                ? "Partial Barrier"
                : "Critical Exposure"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mt-5 sm:mt-6">
        {/* Left Column: Sliders & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          {/* Persona Context Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            <Bike className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="leading-snug">
              <span className="font-semibold text-white">Default Profile: </span>
              Two-wheeler rider facing road particulate, brake dust & ambient PM2.5.
            </div>
          </div>

          {/* Interactive Touch Sliders */}
          <div className="space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Exposure Parameters
            </h3>

            {/* Ambient PM2.5 Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Ambient PM2.5 Level</span>
                <span className="font-mono font-semibold text-amber-400">
                  {ambientPM25} µg/m³
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="350"
                value={ambientPM25}
                onChange={(e) => setAmbientPM25(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 py-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Clean (15)</span>
                <span>Unhealthy (100)</span>
                <span>Severe (350)</span>
              </div>
            </div>

            {/* Commute Distance Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">One-Way Distance</span>
                <span className="font-mono font-semibold text-cyan-400">
                  {commuteDistance} km (Round-trip: {commuteDistance * 2} km)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={commuteDistance}
                onChange={(e) => setCommuteDistance(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 py-1"
              />
            </div>

            {/* Daily Hours On Road */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Daily Road Duration</span>
                <span className="font-mono font-semibold text-purple-400">
                  {exposureHours} hours/day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={exposureHours}
                onChange={(e) => setExposureHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 py-1"
              />
            </div>
          </div>

          {/* Interactive Sustainable & Protective Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Protective Choices & Modals
            </h3>

            {/* Mask Selection Segmented Control */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
              <label className="text-xs font-medium text-slate-300 mb-2 block">
                Respiratory Mask Specification:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setMaskType("n95")}
                  className={`flex flex-col items-center justify-center py-2 px-2 sm:px-3 rounded-xl border text-xs font-semibold transition-all min-h-[52px] active:scale-95 ${
                    maskType === "n95"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm ring-1 ring-emerald-500/50"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mb-0.5 text-emerald-400" />
                  <span>N95 / FFP2</span>
                  <span className="text-[9px] opacity-75 font-normal">95% Shield</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMaskType("cloth")}
                  className={`flex flex-col items-center justify-center py-2 px-2 sm:px-3 rounded-xl border text-xs font-semibold transition-all min-h-[52px] active:scale-95 ${
                    maskType === "cloth"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm ring-1 ring-amber-500/50"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                  <span>Cloth Scarf</span>
                  <span className="text-[9px] opacity-75 font-normal">30% Shield</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMaskType("none")}
                  className={`flex flex-col items-center justify-center py-2 px-2 sm:px-3 rounded-xl border text-xs font-semibold transition-all min-h-[52px] active:scale-95 ${
                    maskType === "none"
                      ? "bg-red-500/20 border-red-500/40 text-red-300 shadow-sm ring-1 ring-red-500/50"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 mb-0.5 text-red-400" />
                  <span>No Mask</span>
                  <span className="text-[9px] opacity-75 font-normal">0% Shield</span>
                </button>
              </div>
            </div>

            {/* Sustainable Toggles (Touch Friendly cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Toggle 1: Metro Transit Switch */}
              <div
                onClick={() => setSwitchToMetro(!switchToMetro)}
                className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 select-none active:scale-[0.98] ${
                  switchToMetro
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition-colors shrink-0 ${
                    switchToMetro
                      ? "bg-emerald-500 border-emerald-400 text-slate-950"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {switchToMetro && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Switch to Metro Transit
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Saves 25g CO₂/km vs two-wheeler & avoids road plume.
                  </div>
                </div>
              </div>

              {/* Toggle 2: Off-Peak Shift */}
              <div
                onClick={() => setOffPeakTravel(!offPeakTravel)}
                className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 select-none active:scale-[0.98] ${
                  offPeakTravel
                    ? "bg-purple-950/30 border-purple-500/40 text-purple-200"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition-colors shrink-0 ${
                    offPeakTravel
                      ? "bg-purple-500 border-purple-400 text-slate-950"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {offPeakTravel && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Off-Peak Commute
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Bypasses peak morning inversion plumes & cuts duration 20%.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gauges & Impact Outputs (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: PM2.5 Inhalation Avoided (Primary Formula Gauge) */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-950 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                PM2.5 Avoided
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                1.2m³/hr × {exposureHours}h × {ambientPM25} × {MASK_EFFICIENCY[maskType]}
              </span>
            </div>

            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {metrics.dailyPM25Avoided_ug}
              </span>
              <span className="text-base sm:text-lg font-semibold text-emerald-400">µg / day</span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Particulate filtered before entering bronchial airway.
            </p>

            <div className="mt-4 pt-3 sm:pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 sm:gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] sm:text-[11px] text-slate-400">Monthly Avoided</div>
                <div className="text-sm font-bold text-white mt-0.5 font-mono">
                  {metrics.monthlyAvoided_mg} mg
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] sm:text-[11px] text-slate-400">Actual Inhaled</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5 font-mono">
                  {metrics.actualInhaled_ug} µg
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: CO2 Saved Gauge (Formula: Two-Wheeler vs Metro) */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-950/30 via-slate-950 to-slate-950 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Leaf className="w-4 h-4" />
                CO₂ Emissions Saved
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                ({commuteDistance * 2}km × 40g) - ({commuteDistance * 2}km × 15g)
              </span>
            </div>

            <div className="mt-3 sm:mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {metrics.co2SavedDaily_grams}
              </span>
              <span className="text-base sm:text-lg font-semibold text-blue-400">g CO₂ / day</span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {switchToMetro
                ? `Saved by commuting via Metro rail instead of two-wheeler over ${commuteDistance * 2} km.`
                : "Toggle 'Switch to Metro' above to simulate emissions saved."}
            </p>

            <div className="mt-4 pt-3 sm:pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Monthly Offset:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {metrics.monthlyCO2Saved_kg} kg CO₂e
              </span>
            </div>
          </div>

          {/* Scientific Validation Note */}
          <div className="p-3 sm:p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 text-[10px] sm:text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-medium">Physiological Formula: </span>
              Calculations assume ventilation rate of 1.2 m³/hour. Mask filtration efficiency benchmarked per NIOSH N95 standards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
