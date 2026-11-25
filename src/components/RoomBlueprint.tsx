"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, DoorClosed, Fan, Droplets, Wind, CheckCircle2 } from "lucide-react";

type ProtocolId = "door" | "chimney" | "mop" | "fan";

interface ProtocolMeta {
  id: ProtocolId;
  label: string;
  reduction: string;
  cost: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: string[];
}

const PROTOCOLS: ProtocolMeta[] = [
  {
    id: "door",
    label: "Damp-Cloth Door Seal",
    reduction: "25–35% PM2.5 drop",
    cost: "₹0 (Zero-cost)",
    icon: DoorClosed,
    steps: [
      "Roll a damp cotton towel tightly along the bottom gap of exterior doors.",
      "Keep balcony & corridor doors latched during 06:00–10:00 and 20:00–06:00 inversions.",
      "Re-dampen every 4 hours in dry winter air to trap infiltrating soot.",
    ],
  },
  {
    id: "chimney",
    label: "Kitchen Chimney / Exhaust",
    reduction: "40–55% indoor spike cut",
    cost: "₹0 (Existing fan)",
    icon: Fan,
    steps: [
      "Switch on the kitchen chimney or exhaust fan 2 minutes before lighting the stove.",
      "Cover pans with lids to minimize cooking aerosol & PM2.5 plumes.",
      "Run exhaust for 10 minutes after cooking ends to purge lingering NO₂.",
    ],
  },
  {
    id: "mop",
    label: "Wet Mop (No Dry Sweep)",
    reduction: "30% dust resuspension cut",
    cost: "₹0 (Zero-cost)",
    icon: Droplets,
    steps: [
      "Replace dry broom sweeping, which kicks settled PM10 & PM2.5 back to breathing height.",
      "Wet-mop floors and wipe window sills with a damp microfiber cloth twice daily.",
      "Keep outdoor shoes on a mat outside the entry threshold.",
    ],
  },
  {
    id: "fan",
    label: "DIY Box-Fan Filter",
    reduction: "50–65% room PM2.5 drop",
    cost: "~₹1,200 (MERV-13 + fan)",
    icon: Wind,
    steps: [
      "Tape a 20×20 MERV-13 or HEPA replacement filter tightly onto the intake side of a box/table fan.",
      "Seal all four cardboard edges with masking tape so air cannot bypass the media.",
      "Run on medium speed in the bedroom 45 minutes before sleep.",
    ],
  },
];

export default function RoomBlueprint() {
  const [activeMap, setActiveMap] = useState<Record<ProtocolId, boolean>>({
    door: false,
    chimney: false,
    mop: false,
    fan: false,
  });
  const [inspectedId, setInspectedId] = useState<ProtocolId>("door");

  const score = Object.values(activeMap).filter(Boolean).length * 25;
  const inspected = PROTOCOLS.find((p) => p.id === inspectedId) || PROTOCOLS[0];

  const handleToggle = (id: ProtocolId) => {
    setActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setInspectedId(id);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 card-interactive">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Interactive Room &amp; Protocol Studio</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
            Indoor Air Protection Cutaway &amp; Mitigation Steps
          </h3>
        </div>

        <div className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-black flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-zinc-400">Room Protection Score</span>
          <span
            className={`text-sm font-mono font-bold ${
              score >= 75
                ? "text-emerald-400"
                : score >= 50
                ? "text-[#E5C158]"
                : "text-zinc-200"
            }`}
          >
            {score}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: SVG Cutaway + 4 Toggles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-lg border border-zinc-800/80 bg-black overflow-hidden">
            <svg viewBox="0 0 420 190" className="w-full h-44 sm:h-52 block">
              <rect x="24" y="20" width="372" height="142" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
              <line x1="24" y1="162" x2="396" y2="162" stroke="#3f3f46" strokeWidth="2" />

              {/* Front Door + Damp-Cloth Seal */}
              <rect x="38" y="64" width="38" height="96" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
              <circle cx="70" cy="114" r="2.2" fill="#D4AF37" />
              <motion.rect
                x="38" y="158" width="38" height="4" rx="2" fill="#22D3EE"
                initial={false}
                animate={{ scaleX: activeMap.door ? 1 : 0, opacity: activeMap.door ? 1 : 0 }}
                style={{ originX: 0.5 }}
                transition={{ duration: 0.35 }}
              />

              {/* Window */}
              <rect x="116" y="48" width="76" height="46" fill="#050505" stroke="#3f3f46" strokeWidth="1.2" />
              <line x1="154" y1="48" x2="154" y2="94" stroke="#27272a" strokeWidth="1" />
              <line x1="116" y1="71" x2="192" y2="71" stroke="#27272a" strokeWidth="1" />

              {/* Kitchen Stove & Hood + Spinning Fan */}
              <rect x="292" y="114" width="78" height="48" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
              <path d="M 304 62 L 358 62 L 344 40 L 318 40 Z" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
              <rect x="324" y="20" width="14" height="20" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <motion.g
                transform="translate(331, 51)"
                animate={{ rotate: activeMap.chimney ? 360 : 0 }}
                transition={activeMap.chimney ? { repeat: Infinity, duration: 0.9, ease: "linear" } : { duration: 0.2 }}
              >
                <line x1="-6" y1="0" x2="6" y2="0" stroke={activeMap.chimney ? "#10B981" : "#64748B"} strokeWidth="2" />
                <line x1="0" y1="-6" x2="0" y2="6" stroke={activeMap.chimney ? "#10B981" : "#64748B"} strokeWidth="2" />
              </motion.g>

              {[316, 331, 346].map((cx, i) => (
                <motion.circle
                  key={cx} cx={cx} cy={96 - i * 10} r="5" fill="#94A3B8"
                  animate={{ opacity: activeMap.chimney ? 0 : [0.25, 0.7, 0.25], y: activeMap.chimney ? -14 : [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}

              {/* Settled Dust Dots + Wet Mop Shimmer */}
              {[110, 145, 185, 225, 260].map((dx) => (
                <motion.circle
                  key={dx} cx={dx} cy={158} r="2" fill="#94A3B8"
                  animate={{ opacity: activeMap.mop ? 0 : 0.75 }}
                  transition={{ duration: 0.35 }}
                />
              ))}
              {activeMap.mop && (
                <motion.rect
                  y="156" width="68" height="6" rx="3" fill="#38BDF8" fillOpacity="0.65"
                  initial={{ x: 84, opacity: 0.9 }}
                  animate={{ x: [84, 220, 84], opacity: [0.35, 0.8, 0.35] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* DIY Box-Fan Clean-Air Arrows */}
              <motion.g animate={{ opacity: activeMap.fan ? 1 : 0 }} transition={{ duration: 0.3 }}>
                <rect x="218" y="106" width="24" height="24" rx="4" fill="#1E293B" stroke="#10B981" strokeWidth="1.2" />
                <motion.path
                  d="M 186 112 L 210 112 M 204 107 L 210 112 L 204 117"
                  stroke="#10B981" strokeWidth="1.6" fill="none" strokeLinecap="round"
                  animate={activeMap.fan ? { x: [0, 6, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.path
                  d="M 248 118 L 274 118 M 268 113 L 274 118 L 268 123"
                  stroke="#34D399" strokeWidth="1.6" fill="none" strokeLinecap="round"
                  animate={activeMap.fan ? { x: [0, 8, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
              </motion.g>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PROTOCOLS.map((item) => {
              const Icon = item.icon;
              const isActive = activeMap[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all active:scale-[0.98] ${
                    isActive
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]/60 text-zinc-100"
                      : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#D4AF37]" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </span>
                  <span className={`text-[10px] font-mono ${isActive ? "text-[#E5C158]" : "text-zinc-500"}`}>
                    {isActive ? "ON" : "OFF"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Protocol Inspector */}
        <div className="lg:col-span-5 rounded-lg border border-zinc-800 bg-black p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <span className="text-xs font-medium text-zinc-400">Protocol Inspector</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#D4AF37]/10 text-[#E5C158] border border-[#D4AF37]/30">
                {inspected.reduction}
              </span>
            </div>

            <h4 className="text-base font-semibold text-zinc-100 mt-3">{inspected.label}</h4>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">Estimated cost: {inspected.cost}</p>

            <div className="mt-4 space-y-2.5">
              {inspected.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Status in room</span>
            <span className={`font-mono font-semibold ${activeMap[inspected.id] ? "text-[#E5C158]" : "text-zinc-500"}`}>
              {activeMap[inspected.id] ? "Active (+25%)" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
