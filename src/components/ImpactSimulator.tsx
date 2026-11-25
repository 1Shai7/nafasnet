"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Train,
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

const MASK_EFFICIENCY = {
  n95: 0.95,
  cloth: 0.3,
  none: 0.0,
} as const;

export default function ImpactSimulator({
  initialPM25 = 125,
  locationName = "Your City",
}: ImpactSimulatorProps) {
  const [commuteDistance, setCommuteDistance] = useState<number>(20);
  const [exposureHours, setExposureHours] = useState<number>(1.5);
  const [pm25Override, setPm25Override] = useState<number | null>(null);
  const ambientPM25 = pm25Override ?? Math.round(initialPM25);

  const [maskType, setMaskType] = useState<"n95" | "cloth" | "none">("n95");
  const [switchToMetro, setSwitchToMetro] = useState<boolean>(true);
  const [offPeakTravel, setOffPeakTravel] = useState<boolean>(false);

  const metrics = useMemo(() => {
    const BREATHING_RATE = 1.2;
    const currentMaskEff = MASK_EFFICIENCY[maskType];
    const effectiveHours = offPeakTravel ? exposureHours * 0.8 : exposureHours;
    const dailyDistance = commuteDistance * 2;

    const dailyPM25Avoided_ug =
      BREATHING_RATE * effectiveHours * ambientPM25 * currentMaskEff;

    const baselineIntake_ug = BREATHING_RATE * effectiveHours * ambientPM25;
    const actualInhaled_ug = baselineIntake_ug - dailyPM25Avoided_ug;
    const monthlyAvoided_mg = (dailyPM25Avoided_ug * 30) / 1000;

    let co2SavedDaily_grams = 0;
    if (switchToMetro) {
      co2SavedDaily_grams = dailyDistance * 40 - dailyDistance * 15;
    }
    const monthlyCO2Saved_kg = (co2SavedDaily_grams * 22) / 1000;

    let protectionScore = currentMaskEff * 60;
    if (switchToMetro) protectionScore += 25;
    if (offPeakTravel) protectionScore += 10;
    protectionScore = Math.min(100, Math.round(protectionScore));

    const reductionPct =
      baselineIntake_ug > 0
        ? Math.round((dailyPM25Avoided_ug / baselineIntake_ug) * 100)
        : 0;

    return {
      dailyPM25Avoided_ug: Math.round(dailyPM25Avoided_ug * 10) / 10,
      monthlyAvoided_mg: Math.round(monthlyAvoided_mg * 100) / 100,
      baselineIntake_ug: Math.round(baselineIntake_ug * 10) / 10,
      actualInhaled_ug: Math.round(actualInhaled_ug * 10) / 10,
      co2SavedDaily_grams: Math.round(co2SavedDaily_grams),
      monthlyCO2Saved_kg: Math.round(monthlyCO2Saved_kg * 10) / 10,
      protectionScore,
      reductionPct,
    };
  }, [commuteDistance, exposureHours, ambientPM25, maskType, switchToMetro, offPeakTravel]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            <Gauge className="w-3.5 h-3.5 text-zinc-400" />
            <span>Deterministic Inhalation &amp; Carbon Model</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-100">
            Commuter Impact Simulator — {locationName}
          </h2>
        </div>

        {/* Protection Score Readout */}
        <div className="flex items-center gap-3 bg-black px-4 py-2.5 rounded-lg border border-zinc-800 shrink-0">
          <div className="relative flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="17"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r="17"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 17}
                strokeDashoffset={
                  2 * Math.PI * 17 * (1 - metrics.protectionScore / 100)
                }
                strokeLinecap="round"
                className={`transition-all duration-500 ${
                  metrics.protectionScore >= 75
                    ? "text-emerald-500"
                    : metrics.protectionScore >= 40
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-white">
              {metrics.protectionScore}%
            </span>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Shield Index
            </div>
            <div className="text-xs font-medium text-zinc-200">
              {metrics.protectionScore >= 75
                ? "High Protection"
                : metrics.protectionScore >= 40
                ? "Moderate Barrier"
                : "High Exposure"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Sliders & Toggles */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-4 bg-black p-4 sm:p-5 rounded-lg border border-zinc-800">
            <h3 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              Exposure Parameters
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Ambient PM2.5 Concentration</span>
                <span className="font-mono font-semibold text-zinc-100">
                  {ambientPM25} µg/m³
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="350"
                value={ambientPM25}
                onChange={(e) => setPm25Override(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                <span>15 (Clean)</span>
                <span>100 (Poor)</span>
                <span>350 (Severe)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">One-Way Commute Distance</span>
                <span className="font-mono font-semibold text-zinc-100">
                  {commuteDistance} km ({commuteDistance * 2} km round-trip)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={commuteDistance}
                onChange={(e) => setCommuteDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Daily Outdoor Duration</span>
                <span className="font-mono font-semibold text-zinc-100">
                  {exposureHours} hrs/day
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={exposureHours}
                onChange={(e) => setExposureHours(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200"
              />
            </div>
          </div>

          {/* Mask & Transit Controls */}
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-black p-3.5 sm:p-4">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2.5 block">
                Respirator Standard
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMaskType("n95")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    maskType === "n95"
                      ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mb-1" />
                  <span>N95 / FFP2</span>
                  <span className="text-[10px] opacity-75 font-mono">95% eff.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMaskType("cloth")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    maskType === "cloth"
                      ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 mb-1" />
                  <span>Cloth Mask</span>
                  <span className="text-[10px] opacity-75 font-mono">30% eff.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMaskType("none")}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    maskType === "none"
                      ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 mb-1" />
                  <span>Unmasked</span>
                  <span className="text-[10px] opacity-75 font-mono">0% eff.</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSwitchToMetro(!switchToMetro)}
                className={`text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 ${
                  switchToMetro
                    ? "bg-zinc-900 border-zinc-600 text-zinc-100"
                    : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center mt-0.5 border shrink-0 ${
                    switchToMetro
                      ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                      : "border-zinc-700 bg-zinc-950"
                  }`}
                >
                  {switchToMetro && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-zinc-400" />
                    Switch to Metro Rail
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Saves 25g CO₂/km vs two-wheeler.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOffPeakTravel(!offPeakTravel)}
                className={`text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 ${
                  offPeakTravel
                    ? "bg-zinc-900 border-zinc-600 text-zinc-100"
                    : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center mt-0.5 border shrink-0 ${
                    offPeakTravel
                      ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                      : "border-zinc-700 bg-zinc-950"
                  }`}
                >
                  {offPeakTravel && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Off-Peak Window Shift
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Cuts road exposure duration by 20%.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Deterministic Output Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-lg border border-zinc-800 bg-black p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                PM2.5 Filtered
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                1.2 × {exposureHours}h × {ambientPM25} × {MASK_EFFICIENCY[maskType]}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
                {metrics.dailyPM25Avoided_ug}
              </span>
              <span className="text-sm font-mono text-zinc-400">µg / day</span>
              <span className="ml-auto text-xs font-mono text-emerald-400">
                -{metrics.reductionPct}%
              </span>
            </div>

            {/* Visual Reduction Bar */}
            <div className="mt-3 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300"
                style={{ width: `${metrics.reductionPct}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Monthly Avoided</div>
                <div className="text-sm font-semibold text-zinc-100 mt-0.5 font-mono">
                  {metrics.monthlyAvoided_mg} mg
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Net Inhaled</div>
                <div className="text-sm font-semibold text-amber-400 mt-0.5 font-mono">
                  {metrics.actualInhaled_ug} µg
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-black p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-zinc-400" />
                CO₂ Emissions Avoided
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {commuteDistance * 2}km × (40g − 15g)
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
                {metrics.co2SavedDaily_grams}
              </span>
              <span className="text-sm font-mono text-zinc-400">g CO₂ / day</span>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Monthly Commute Offset</span>
              <span className="font-mono font-semibold text-zinc-100">
                {metrics.monthlyCO2Saved_kg} kg CO₂e
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-zinc-800 bg-black text-[11px] text-zinc-500 leading-relaxed flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
            <span>
              Assumes 1.2 m³/hr adult ventilation rate and NIOSH N95 filtration efficiency (0.95).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
