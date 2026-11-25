"use client";

import React from "react";
import { Share2, Check } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import LocationPicker from "@/components/LocationPicker";
import {
  COMMUTE_OPTIONS,
  CommuteOption,
  SelectedLocation,
  SETUP_OPTIONS,
  SetupOption,
  VULNERABILITY_OPTIONS,
  VulnerabilityOption,
} from "@/lib/constants";

interface DashboardHeaderProps {
  currentCity: string;
  latitude?: number;
  longitude?: number;
  loadingAQI: boolean;
  commuteOpt: CommuteOption;
  vulnOpt: VulnerabilityOption;
  setupOpt: SetupOption;
  copiedBrief: boolean;
  onSelectLocation: (loc: SelectedLocation) => void;
  onSyncProfile: (
    commute: CommuteOption,
    vuln: VulnerabilityOption,
    setup: SetupOption
  ) => void;
  onCopyBrief: () => void;
}

export default function DashboardHeader({
  currentCity,
  latitude,
  longitude,
  loadingAQI,
  commuteOpt,
  vulnOpt,
  setupOpt,
  copiedBrief,
  onSelectLocation,
  onSyncProfile,
  onCopyBrief,
}: DashboardHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-black/90">
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
            <circle
              cx="24"
              cy="24"
              r="2"
              fill="none"
              stroke="#E5A93C"
              strokeWidth="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#headerMashrabiya)" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3.5">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo />

          <div className="text-right font-mono text-xs text-zinc-500 hidden md:block">
            {latitude !== undefined && longitude !== undefined
              ? `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`
              : "Resolving coordinates..."}
          </div>
        </div>

        <LocationPicker
          currentCity={currentCity}
          latitude={latitude}
          longitude={longitude}
          loading={loadingAQI}
          onSelectLocation={onSelectLocation}
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
                  onClick={() => onSyncProfile(opt, vulnOpt, setupOpt)}
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
                  onClick={() => onSyncProfile(commuteOpt, opt, setupOpt)}
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
                  onClick={() => onSyncProfile(commuteOpt, vulnOpt, opt)}
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
            onClick={onCopyBrief}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] hover:bg-[#E5C158] text-black transition-colors shrink-0 self-start lg:self-auto"
          >
            {copiedBrief ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {copiedBrief ? "Copied for WhatsApp" : "Copy Family Brief"}
          </button>
        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
    </header>
  );
}
