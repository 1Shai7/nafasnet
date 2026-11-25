"use client";

import React, { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Sun, CloudFog, ShieldCheck, AlertTriangle } from "lucide-react";

interface InversionScrubberProps {
  hourlyData: { time: string; pm25: number }[];
}

export default function InversionScrubber({ hourlyData }: InversionScrubberProps) {
  const [hour, setHour] = useState<number>(8);
  const safeData =
    hourlyData.length > 0
      ? hourlyData
      : Array.from({ length: 24 }, (_, i) => ({
          time: `${String(i).padStart(2, "0")}:00`,
          pm25: i >= 12 && i <= 16 ? 48 : 135,
        }));

  const current = safeData[Math.min(hour, safeData.length - 1)];
  const isDispersion = hour >= 12 && hour <= 16;
  const isDaytime = hour >= 6 && hour <= 18;

  // Midday dispersion factor (0 = trapped night/morning, 1 = peak 14:00 solar mixing)
  const dispersion = isDaytime ? Math.max(0, 1 - Math.abs(hour - 14) / 7) : 0;
  const smogY = 86 - dispersion * 58;
  const smogOpacity = 0.62 - dispersion * 0.42;

  const dayProgress = isDaytime ? (hour - 6) / 12 : hour < 6 ? 0 : 1;
  const sunX = 36 + dayProgress * 328;
  const sunY = isDaytime ? 128 - Math.sin(dayProgress * Math.PI) * 94 : 150;

  return (
    <MotionConfig reducedMotion="user">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              <CloudFog className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Thermal Inversion Physics</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
              24-Hour Atmospheric Lid &amp; Dispersion Scrubber
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
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
            <span className="px-2.5 py-1 rounded-md border border-zinc-800 bg-black text-xs font-mono text-zinc-200">
              {current.time} · <strong className="text-[#E5C158]">{current.pm25}</strong> µg/m³
            </span>
          </div>
        </div>

        {/* SVG Skyline + Sun Arc + Smog Layer */}
        <div className="mt-4 rounded-lg border border-zinc-800/80 bg-black overflow-hidden">
          <svg viewBox="0 0 400 165" className="w-full h-44 sm:h-52 block">
            <defs>
              <linearGradient id="smogGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Sun Arc Guide */}
            <path
              d="M 36 128 Q 200 -20 364 128"
              fill="none"
              stroke="#27272a"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Animated Sun */}
            <motion.g
              animate={{ x: sunX, y: sunY, opacity: isDaytime ? 1 : 0.15 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <circle r="16" fill="#D4AF37" fillOpacity="0.18" />
              <circle r="8" fill="#E5C158" />
            </motion.g>

            {/* Rising Heat-Wave Lines (stronger during solar mixing) */}
            {[110, 175, 240, 305].map((x, idx) => (
              <motion.path
                key={x}
                d={`M ${x} 135 Q ${x - 6} 118 ${x} 102 T ${x} 72`}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{
                  opacity: isDispersion ? [0.15, 0.55, 0.15] : 0.05,
                  y: isDispersion ? [4, -6, 4] : 0,
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.25 }}
              />
            ))}

            {/* Translucent Amber Smog Layer */}
            <motion.rect
              x="0"
              width="400"
              height="38"
              fill="url(#smogGrad)"
              animate={{ y: smogY, opacity: smogOpacity }}
              transition={{ type: "spring", stiffness: 110, damping: 20 }}
            />

            {/* City Skyline Silhouette */}
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
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
              Scrub Hour of Day
            </span>
            <span className="text-zinc-200">{current.time}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, safeData.length - 1)}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            aria-label="Scrub hour of day"
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-600">
            <span>00:00 (Trapped)</span>
            <span>08:00 (Inversion)</span>
            <span>14:00 (Dispersion)</span>
            <span>22:00 (Re-Inversion)</span>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
