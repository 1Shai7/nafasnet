import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VayuMitra • Personalized Winter Smog Survival Intelligence",
  description:
    "Translating live hourly winter smog telemetry into personalized safe-window routines, zero-cost-to-appliance indoor air hacks, and quantified health/carbon impact — built for India's 400M+ urban breathers.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VayuMitra",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
