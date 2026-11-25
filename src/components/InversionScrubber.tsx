"use client";

import React from "react";
import { MotionConfig, motion } from "framer-motion";
import { Sun, CloudFog, ShieldCheck, AlertTriangle } from "lucide-react";

interface InversionScrubberProps {
  hourlyData: { time: string; pm25: number }[];
  selectedHour: number;
  onHourChange: (hour: number) => void;
}

export default function InversionScrubber({
  hourlyData,
  selectedHour,
  onHourChange,
}: InversionScrubberProps) {
  const safeData =
    hourlyData.length > 0
      ? hourlyData
      : Array.from({ length: 24 }, (_, i) => ({
          time: `${String(i).padStart(2, "0")}:00`,
          pm25: i >= 12 && i <= 16 ? 48 : 135,
        }));

  const current = safeData[Math.min(selectedHour, safeData.length - 1)];
  const isDispersion = selectedHour >= 12 && selectedHour <= 16;
  const isDaytime = selectedHour >= 6 && selectedHour <= 18;

  const dispersion = isDaytime
    ? Math.max(0, 1 - Math.abs(selectedHour - 14) / 7)
    : 0;
  const smogY = 86 - dispersion * 58;
  const smogOpacity = 0.62 - dispersion * 0.42;

  const dayProgress = isDaytime
    ? (selectedHour - 6) / 12
    : selectedHour < 6
    ? 0
    : 1;
  const sunX = 36 + dayProgress * 328;
  const sunY = isDaytime ? 128 - Math.sin(dayProgress * Math.PI) * 94 : 150;

  return (
    <MotionConfig reducedMotion="user">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <CloudFog className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Thermal Inversion Physics</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
              24-Hour Atmospheric Lid &amp; Dispersion Scrubber
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                isDispersion
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                  : current.pm25 > 75
                  ? "border-red-500/40 bg-red-950/40 text-red-300"
                  : "border-amber-500/40 bg-amber-950/40 text-amber-300"
              }`}
            >
              {isDispersion ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {isDispersion
                ? "Dispersion Window — Safe to Ventilate"
                : "Trapped Inversion — Stay Indoors"}
            </span>
            <span className="px-2.5 py-1 rounded-md border border-zinc-800 bg-black text-xs font-mono text-zinc-200 tabular-nums">
              {current.time} ·{" "}
              <strong className="text-[#E5C158]">{current.pm25}</strong> µg/m³
            </span>
          </div>
        </div>

        {/* SVG Skyline + Sun Arc + Smog Layer */}
        <div className="mt-4 rounded-lg border border-zinc-800/80 bg-black overflow-hidden">
          <svg viewBox="0 0 400 165" className="w-full h-44 sm:h-52 block">
            <defs>
              <linearGradient id="smogGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#D97706" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            <path
              d="M 36 128 Q 200 -20 364 128"
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            <motion.g
              animate={{ x: sunX, y: sunY, opacity: isDaytime ? 1 : 0.15 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <circle r="16" fill="#F59E0B" fillOpacity="0.18" />
              <circle r="8" fill="#FBBF24" />
            </motion.g>

            {[110, 175, 240, 305].map((x, idx) => (
              <motion.path
                key={x}
                d={`M ${x} 135 Q ${x - 6} 118 ${x} 102 T ${x} 72`}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{
                  opacity: isDispersion ? [0.15, 0.55, 0.15] : 0.05,
                  y: isDispersion ? [4, -6, 4] : 0,
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.25 }}
              />
            ))}

            <motion.rect
              x="0"
              width="400"
              height="38"
              fill="url(#smogGrad)"
              animate={{ y: smogY, opacity: smogOpacity }}
              transition={{ type: "spring", stiffness: 110, damping: 20 }}
            />

            <path
              d="M0 165 L0 128 L28 128 L28 106 L58 106 L58 134 L84 134 L84 94 L116 94 L116 122 L144 122 L144 82 L176 82 L176 118 L208 118 L208 92 L240 92 L240 130 L272 130 L272 78 L306 78 L306 116 L336 116 L336 100 L368 100 L368 126 L400 126 L400 165 Z"
              fill="#09090b"
              stroke="#27272a"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* 0-23 Hour Scrubber */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
              Scrub hour to highlight matching routine window below
            </span>
            <span className="font-mono text-zinc-200">{current.time}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, safeData.length - 1)}
            value={selectedHour}
            onChange={(e) => onHourChange(Number(e.target.value))}
            aria-label="Scrub hour of day"
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />
          <div className="flex justify-between text-[11px] font-mono text-zinc-500">
            <span>00:00</span>
            <span>08:00 (Inversion)</span>
            <span>14:00 (Dispersion)</span>
            <span>22:00</span>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
