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
  title: "NafasNet • Urban Air Intelligence & Exposure OS",
  description:
    "Translating live hourly air quality telemetry into thermal-inversion safe-windows, zero-cost-to-DIY indoor air hacks, and deterministic PM2.5 & CO2 math.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NafasNet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0B1117",
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
      <body className="min-h-full flex flex-col bg-[#0B1117] text-slate-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-100">
        {children}
      </body>
    </html>
  );
}
