"use client";

import React, { useEffect, useState } from "react";
import { Activity, Clock, Shield, Sliders } from "lucide-react";

interface ScrollHUDProps {
  city: string;
  pm25?: number;
}

const SECTIONS = [
  { id: "section-telemetry", label: "Live", icon: Activity },
  { id: "section-timeline", label: "Charts", icon: Clock },
  { id: "section-routine", label: "Routine", icon: Shield },
  { id: "section-simulator", label: "Simulator", icon: Sliders },
] as const;

export default function ScrollHUD({ city, pm25 }: ScrollHUDProps) {
  const [progress, setProgress] = useState(0);
  const [showFloating, setShowFloating] = useState(false);
  const [activeId, setActiveId] = useState<string>("section-telemetry");

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
      setShowFloating(scrollTop > 220);

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220) {
            setActiveId(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top Atmospheric Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Desktop Scroll-Spy Quick Nav */}
      <div
        className={`hidden sm:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-[#131B24]/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
          showFloating
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-1.5 pr-2.5 mr-1 border-r border-white/10 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300 max-w-[90px] truncate">{city}</span>
          {pm25 !== undefined && (
            <span className="text-emerald-300 font-semibold">{pm25}</span>
          )}
        </div>

        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeId === sec.id;
          return (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{sec.label}</span>
            </a>
          );
        })}
      </div>
    </>
  );
}
