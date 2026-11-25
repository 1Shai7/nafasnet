"use client";

import React from "react";

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3.5 select-none">
      {/* Custom 42x42 Mashrabiya 8-Pointed Star + Breath Curves SVG Emblem */}
      <div className="relative w-[42px] h-[42px] shrink-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(229,169,60,0.45) 0%, rgba(16,185,129,0.22) 55%, transparent 75%)",
          }}
        />
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="NafasNet Emblem"
          className="relative z-10"
        >
          {/* 8-Pointed Arabic Geometric Mashrabiya Star Frame */}
          <rect
            x="9"
            y="9"
            width="24"
            height="24"
            rx="1.5"
            stroke="#E5A93C"
            strokeWidth="1.25"
            strokeOpacity="0.85"
          />
          <rect
            x="9"
            y="9"
            width="24"
            height="24"
            rx="1.5"
            transform="rotate(45 21 21)"
            stroke="#E5A93C"
            strokeWidth="1.25"
            strokeOpacity="0.85"
          />
          {/* Subtle Nūn (ن) Dot Motif */}
          <circle cx="21" cy="13.5" r="1.45" fill="#E5A93C" />

          {/* Two Flowing Wind / Breath Curves */}
          <path
            d="M12.5 21.5C15.5 18.2 18.8 18.2 21.2 21C23.6 23.8 26.8 23.8 29.5 20.5"
            stroke="#F5F0E6"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
          <path
            d="M14 25.5C16.6 23 19.2 23 21.2 25.1C23.2 27.2 25.8 27.2 28.2 24.6"
            stroke="#E5A93C"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeOpacity="0.95"
          />
        </svg>
      </div>

      {/* Bilingual Wordmark + Calligraphic Underline + Tagline */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            <span className="text-[#F5F0E6]">Nafas</span>
            <span className="text-[#E5A93C]">Net</span>
          </h1>

          <div className="relative inline-flex flex-col items-center">
            <span
              lang="ar"
              dir="rtl"
              className="text-lg sm:text-xl leading-none text-[#E5A93C]"
              style={{ fontFamily: "var(--font-arabic), serif" }}
            >
              نَفَس
            </span>
            {/* Tapered Golden Calligraphic Underline Accent */}
            <svg
              width="44"
              height="5"
              viewBox="0 0 44 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="mt-0.5"
            >
              <path
                d="M1 2.5C11 1.2 31 1.2 43 2.5C31 3.6 11 3.6 1 2.5Z"
                fill="url(#calligraphicGold)"
              />
              <defs>
                <linearGradient id="calligraphicGold" x1="1" y1="2.5" x2="43" y2="2.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E5A93C" stopOpacity="0.15" />
                  <stop offset="0.5" stopColor="#E5A93C" stopOpacity="0.95" />
                  <stop offset="1" stopColor="#E5A93C" stopOpacity="0.15" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mt-1 hidden sm:block">
          Breath &amp; Indoor Air Intelligence for Winter Smog
        </p>
      </div>
    </div>
  );
}
