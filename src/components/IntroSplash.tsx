"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function IntroSplash() {
  const [phase, setPhase] = useState<"enter" | "exit" | "done">("enter");

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const t = setTimeout(() => setPhase("done"), 0);
      return () => clearTimeout(t);
    }

    const exitTimer = setTimeout(() => setPhase("exit"), 1150);
    const doneTimer = setTimeout(() => setPhase("done"), 1650);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      onClick={() => setPhase("exit")}
      role="status"
      aria-label="NafasNet initializing"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] mashrabiya-bg cursor-pointer select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        phase === "exit"
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient radial gold glow behind emblem */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(5,5,5,0) 70%)",
        }}
      />

      {/* Centered Logo + Wordmark */}
      <div className="relative flex flex-col items-center gap-4 animate-intro-logo">
        <div className="relative w-20 h-20 rounded-2xl border border-[#D4AF37]/60 bg-black p-1 shadow-[0_0_40px_-8px_rgba(212,175,55,0.55)] overflow-hidden">
          <Image
            src="/logo.png"
            alt="NafasNet"
            width={80}
            height={80}
            className="w-full h-full object-cover rounded-xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/15 to-transparent animate-sheen pointer-events-none" />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-white">Nafas</span>
              <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
                Net
              </span>
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#E5C158]">
              نَفَس
            </span>
          </div>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400">
            Atmospheric Telemetry OS
          </p>
        </div>

        {/* Gold Telemetry Sweep Bar */}
        <div className="w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-[#8A6D1B] via-[#D4AF37] to-[#F3E5AB] animate-intro-sweep" />
        </div>

        <span className="text-[10px] font-mono text-zinc-600 tracking-wider mt-1">
          TAP ANYWHERE TO SKIP
        </span>
      </div>
    </div>
  );
}
