import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { LocationProvider } from "@/context/LocationContext";

export const viewport: Viewport = {
  themeColor: "#23272B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.",
    template: "%s | AIRWISE AI",
  },
  description:
    "Competition-ready, AI-powered urban air quality and sustainability intelligence platform built with CPCB Indian AQI standards and Google Gemini intelligence.",
  keywords: [
    "AIRWISE AI",
    "Air Quality Index",
    "CPCB AQI",
    "Indian National AQI",
    "Urban Air Quality Assistant",
    "Breathe Smarter Move Safer Live Greener",
    "My Day Air-Smart",
    "Sustainability Tracker",
    "Eco-Tech Intelligence",
  ],
  authors: [{ name: "AIRWISE AI Team" }],
  creator: "AIRWISE AI",
  publisher: "AIRWISE AI",
  metadataBase: new URL("https://airwise-ai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/airwise-logo-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
  },
  openGraph: {
    title: "AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.",
    description:
      "Transforming urban environmental data into actionable daily activity recommendations, exposure awareness, and sustainable mobility habits.",
    url: "https://airwise-ai.vercel.app",
    siteName: "AIRWISE AI",
    images: [
      {
        url: "/airwise-og.png",
        width: 1200,
        height: 630,
        alt: "AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.",
    description:
      "AI-powered urban air quality and sustainability intelligence platform with CPCB sub-index precision.",
    images: ["/airwise-og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#23272B] text-[#F9FAFF]">
        <LocationProvider>
          <AppShell>{children}</AppShell>
        </LocationProvider>
      </body>
    </html>
  );
}
