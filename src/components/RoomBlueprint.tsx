"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, DoorClosed, Fan, Droplets, Wind } from "lucide-react";

export default function RoomBlueprint() {
  const [doorSeal, setDoorSeal] = useState(false);
  const [chimney, setChimney] = useState(false);
  const [wetMop, setWetMop] = useState(false);
  const [boxFan, setBoxFan] = useState(false);

  const score = [doorSeal, chimney, wetMop, boxFan].filter(Boolean).length * 25;

  const toggles = [
    {
      id: "door",
      label: "Damp-Cloth Door Seal",
      active: doorSeal,
      onClick: () => setDoorSeal((v) => !v),
      icon: DoorClosed,
    },
    {
      id: "chimney",
      label: "Kitchen Chimney / Exhaust",
      active: chimney,
      onClick: () => setChimney((v) => !v),
      icon: Fan,
    },
    {
      id: "mop",
      label: "Wet Mop (No Dry Sweep)",
      active: wetMop,
      onClick: () => setWetMop((v) => !v),
      icon: Droplets,
    },
    {
      id: "fan",
      label: "DIY Box-Fan Filter",
      active: boxFan,
      onClick: () => setBoxFan((v) => !v),
      icon: Wind,
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 card-interactive">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Interactive IAQ Blueprint</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
            Zero-Cost &amp; DIY Room Protection Simulator
          </h3>
        </div>

        <div className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-black flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            Room Protection Score
          </span>
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

      {/* SVG Apartment Cutaway */}
      <div className="mt-4 rounded-lg border border-zinc-800/80 bg-black overflow-hidden">
        <svg viewBox="0 0 420 190" className="w-full h-44 sm:h-52 block">
          {/* Room Walls & Floor */}
          <rect x="24" y="20" width="372" height="142" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
          <line x1="24" y1="162" x2="396" y2="162" stroke="#3f3f46" strokeWidth="2" />

          {/* Front Door (Left) */}
          <rect x="38" y="64" width="38" height="96" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
          <circle cx="70" cy="114" r="2.2" fill="#D4AF37" />
          {/* Damp-Cloth Door Seal */}
          <motion.rect
            x="38"
            y="158"
            width="38"
            height="4"
            rx="2"
            fill="#22d3ee"
            initial={false}
            animate={{ scaleX: doorSeal ? 1 : 0, opacity: doorSeal ? 1 : 0 }}
            style={{ originX: 0.5 }}
            transition={{ duration: 0.35 }}
          />

          {/* Window (Center-Left) */}
          <rect x="116" y="48" width="76" height="46" fill="#050505" stroke="#3f3f46" strokeWidth="1.2" />
          <line x1="154" y1="48" x2="154" y2="94" stroke="#27272a" strokeWidth="1" />
          <line x1="116" y1="71" x2="192" y2="71" stroke="#27272a" strokeWidth="1" />

          {/* Kitchen Stove & Hood (Right) */}
          <rect x="292" y="114" width="78" height="48" fill="#18181b" stroke="#3f3f46" strokeWidth="1.2" />
          <path d="M 304 62 L 358 62 L 344 40 L 318 40 Z" fill="#18181b" stroke="#52525b" strokeWidth="1.2" />
          <rect x="324" y="20" width="14" height="20" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

          {/* Spinning Chimney Fan */}
          <motion.g
            transform="translate(331, 51)"
            animate={{ rotate: chimney ? 360 : 0 }}
            transition={chimney ? { repeat: Infinity, duration: 0.9, ease: "linear" } : { duration: 0.2 }}
          >
            <line x1="-6" y1="0" x2="6" y2="0" stroke={chimney ? "#34d399" : "#52525b"} strokeWidth="2" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke={chimney ? "#34d399" : "#52525b"} strokeWidth="2" />
          </motion.g>

          {/* Smoke Particles (fade out when chimney is on) */}
          {[316, 331, 346].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy={96 - i * 10}
              r="5"
              fill="#71717a"
              animate={{ opacity: chimney ? 0 : [0.25, 0.7, 0.25], y: chimney ? -14 : [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}

          {/* Settled Dust Dots on Floor (hide when wet mopped) */}
          {[110, 145, 185, 225, 260].map((dx) => (
            <motion.circle
              key={dx}
              cx={dx}
              cy={158}
              r="2"
              fill="#a1a1aa"
              animate={{ opacity: wetMop ? 0 : 0.75 }}
              transition={{ duration: 0.35 }}
            />
          ))}

          {/* Wet Mop Blue Shimmer Wave */}
          {wetMop && (
            <motion.rect
              y="156"
              width="68"
              height="6"
              rx="3"
              fill="#38bdf8"
              fillOpacity="0.65"
              initial={{ x: 84, opacity: 0.9 }}
              animate={{ x: [84, 220, 84], opacity: [0.35, 0.8, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* DIY Box-Fan Clean-Air Circulation Arrows (Center) */}
          <motion.g
            animate={{ opacity: boxFan ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <rect x="218" y="106" width="24" height="24" rx="4" fill="#18181b" stroke="#D4AF37" strokeWidth="1.2" />
            <motion.path
              d="M 186 112 L 210 112 M 204 107 L 210 112 L 204 117"
              stroke="#34d399"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              animate={boxFan ? { x: [0, 6, 0] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.path
              d="M 248 118 L 274 118 M 268 113 L 274 118 L 268 123"
              stroke="#D4AF37"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              animate={boxFan ? { x: [0, 8, 0] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
          </motion.g>
        </svg>
      </div>

      {/* 4 Interactive Toggle Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
        {toggles.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all active:scale-[0.98] ${
                item.active
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/60 text-zinc-100"
                  : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${item.active ? "text-[#D4AF37]" : "text-zinc-500"}`} />
              <span className="leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
