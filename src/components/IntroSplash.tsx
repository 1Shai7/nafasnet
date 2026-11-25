"use client";

import React, { useEffect, useState } from "react";

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
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(229,169,60,0.45) 0%, rgba(16,185,129,0.18) 50%, rgba(5,5,5,0) 75%)",
        }}
      />

      {/* Centered Mashrabiya Emblem + Bilingual Wordmark */}
      <div className="relative flex flex-col items-center gap-4 animate-intro-logo">
        <div className="relative w-20 h-20 rounded-2xl border border-[#E5A93C]/50 bg-black flex items-center justify-center shadow-[0_0_40px_-8px_rgba(229,169,60,0.5)] overflow-hidden">
          <svg width="52" height="52" viewBox="0 0 42 42" fill="none" aria-hidden="true">
            <rect x="9" y="9" width="24" height="24" rx="1.5" stroke="#E5A93C" strokeWidth="1.25" strokeOpacity="0.85" />
            <rect x="9" y="9" width="24" height="24" rx="1.5" transform="rotate(45 21 21)" stroke="#E5A93C" strokeWidth="1.25" strokeOpacity="0.85" />
            <circle cx="21" cy="13.5" r="1.45" fill="#E5A93C" />
            <path d="M12.5 21.5C15.5 18.2 18.8 18.2 21.2 21C23.6 23.8 26.8 23.8 29.5 20.5" stroke="#F5F0E6" strokeWidth="1.45" strokeLinecap="round" />
            <path d="M14 25.5C16.6 23 19.2 23 21.2 25.1C23.2 27.2 25.8 27.2 28.2 24.6" stroke="#E5A93C" strokeWidth="1.35" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#E5A93C]/15 to-transparent animate-sheen pointer-events-none" />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-baseline gap-2.5">
            <span
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              <span className="text-[#F5F0E6]">Nafas</span>
              <span className="text-[#E5A93C]">Net</span>
            </span>
            <span
              lang="ar"
              dir="rtl"
              className="text-xl sm:text-2xl text-[#E5A93C]"
              style={{ fontFamily: "var(--font-arabic), serif" }}
            >
              نَفَس
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Breath &amp; Indoor Air Intelligence for Winter Smog
          </p>
        </div>

        <div className="w-48 h-[2px] bg-zinc-900 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-[#8A6D1B] via-[#E5A93C] to-[#F5F0E6] animate-intro-sweep" />
        </div>

        <span className="text-[10px] font-mono text-zinc-600 tracking-wider">
          TAP ANYWHERE TO SKIP
        </span>
      </div>
    </div>
  );
}
