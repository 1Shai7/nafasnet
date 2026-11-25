"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { AirQualityHourlyPoint } from "@/lib/types";
import { Activity, Info } from "lucide-react";

interface AQITimelineProps {
  hourlyData: AirQualityHourlyPoint[];
  locationName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const pm25 = payload.find((p) => p.name === "PM2.5")?.value ?? 0;
    let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    let statusText = "Good / Moderate";

    if (pm25 > 150) {
      badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";
      statusText = "Severe / Hazardous";
    } else if (pm25 > 75) {
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";
      statusText = "Very Unhealthy";
    } else if (pm25 > 35) {
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
      statusText = "Unhealthy";
    }

    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-md text-xs max-w-[260px] pointer-events-none z-50">
        <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-800">
          <span className="font-mono font-semibold text-slate-300 text-[11px] sm:text-xs">
            {label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold border ${badgeColor}`}>
            {statusText}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300 font-sans text-xs">
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{entry.value} µg/m³</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AQITimeline({ hourlyData, locationName }: AQITimelineProps) {
  const [showPM25, setShowPM25] = useState(true);
  const [showPM10, setShowPM10] = useState(true);
  const [showNO2, setShowNO2] = useState(true);
  const [showDust, setShowDust] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formattedChartData = hourlyData.map((d) => ({
    time: d.formattedTime,
    "PM2.5": d.pm2_5,
    PM10: d.pm10,
    NO2: d.nitrogen_dioxide,
    Dust: d.dust,
  }));

  const maxPM25 = Math.max(...hourlyData.map((d) => d.pm2_5), 50);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Chart Title and Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1.5">
            <Activity className="w-3 h-3" />
            Live 24-Hour Timeline
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Atmospheric Inversion & Particulate Profile
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Real-time dispersion forecast for <span className="text-slate-200">{locationName}</span> via Open-Meteo.
          </p>
        </div>

        {/* Mobile-Friendly Layer Filters (Horizontally scrollable with tap targets) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 touch-pan-x">
          <button
            type="button"
            onClick={() => setShowPM25(!showPM25)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
              showPM25
                ? "bg-red-500/20 border-red-500/40 text-red-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            PM2.5
          </button>

          <button
            type="button"
            onClick={() => setShowPM10(!showPM10)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
              showPM10
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            PM10
          </button>

          <button
            type="button"
            onClick={() => setShowNO2(!showNO2)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
              showNO2
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            NO₂
          </button>

          <button
            type="button"
            onClick={() => setShowDust(!showDust)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
              showDust
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            Dust
          </button>
        </div>
      </div>

      {/* Recharts Area Container (Responsive height and touch interaction) */}
      <div className="w-full h-64 sm:h-72 md:h-80 mt-4 sm:mt-6 -ml-2 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedChartData}
            margin={{
              top: 10,
              right: isMobile ? 8 : 12,
              left: isMobile ? -22 : -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorDust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={isMobile ? 9 : 11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              interval={isMobile ? 3 : 1} // Clean mobile spacing: show every 4th hour
            />
            <YAxis
              stroke="#64748b"
              fontSize={isMobile ? 9 : 11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              domain={[0, Math.ceil(maxPM25 * 1.15)]}
              width={isMobile ? 32 : 40}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* WHO Guideline Threshold lines */}
            <ReferenceLine
              y={35}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: isMobile ? "WHO 35µg" : "WHO 24h Threshold (35µg)",
                position: "insideTopLeft",
                fill: "#f59e0b",
                fontSize: isMobile ? 9 : 10,
              }}
            />

            {showPM25 && (
              <Area
                type="monotone"
                dataKey="PM2.5"
                stroke="#ef4444"
                strokeWidth={isMobile ? 2 : 2.5}
                fillOpacity={1}
                fill="url(#colorPM25)"
              />
            )}
            {showPM10 && (
              <Area
                type="monotone"
                dataKey="PM10"
                stroke="#f59e0b"
                strokeWidth={isMobile ? 1.5 : 2}
                fillOpacity={1}
                fill="url(#colorPM10)"
              />
            )}
            {showNO2 && (
              <Area
                type="monotone"
                dataKey="NO2"
                stroke="#a855f7"
                strokeWidth={isMobile ? 1.5 : 1.8}
                fillOpacity={1}
                fill="url(#colorNO2)"
              />
            )}
            {showDust && (
              <Area
                type="monotone"
                dataKey="Dust"
                stroke="#06b6d4"
                strokeWidth={isMobile ? 1.5 : 1.8}
                fillOpacity={1}
                fill="url(#colorDust)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Atmospheric Context Footer */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Tap anywhere on chart to inspect hourly particulate breakdown.</span>
        </span>
        <span className="font-mono text-slate-500">Unit: µg/m³</span>
      </div>
    </div>
  );
}
