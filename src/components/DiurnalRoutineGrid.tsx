"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { RoutineHacksResponse } from "@/lib/types";
import { VulnerabilityOption } from "@/lib/constants";
import { doesHourMatchWindow, getRiskBadgeStyle } from "@/lib/airMath";

interface DiurnalRoutineGridProps {
  recommendations: RoutineHacksResponse | null;
  selectedHour: number;
  vulnOpt: VulnerabilityOption;
  loadingRecs: boolean;
  onRegenerate: () => void;
}

export default function DiurnalRoutineGrid({
  recommendations,
  selectedHour,
  vulnOpt,
  loadingRecs,
  onRegenerate,
}: DiurnalRoutineGridProps) {
  return (
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
          onClick={onRegenerate}
          disabled={loadingRecs}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-50 self-start sm:self-auto shrink-0"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loadingRecs ? "animate-spin" : ""}`}
          />
          Regenerate Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recommendations?.daily_routine.map((window, idx) => {
          const isHighlighted = doesHourMatchWindow(
            selectedHour,
            window.time_window
          );
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
                    className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize border ${getRiskBadgeStyle(
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
  );
}
