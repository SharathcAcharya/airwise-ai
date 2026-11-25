'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Wind, 
  Bot, 
  CalendarClock, 
  MapPin, 
  Leaf, 
  AlertTriangle, 
  Sliders, 
  Menu, 
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Wind },
  { name: 'My Day (Air-Smart)', href: '/my-day', icon: CalendarClock, badge: 'Signature' },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Exposure Explorer', href: '/explorer', icon: MapPin },
  { name: 'Sustainability Tracker', href: '/sustainability', icon: Leaf },
  { name: 'Community Reports', href: '/community', icon: AlertTriangle },
  { name: 'Preferences', href: '/preferences', icon: Sliders },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#23272B] flex flex-col md:flex-row text-[#F9FAFF] font-sans antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#39414B] border-b border-[#677580] sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-sm text-[#F9FAFF] tracking-tight group focus-visible:outline-2 focus-visible:outline-[#4BA9FF] rounded-[6.8px]">
          <div className="w-8 h-8 rounded-[6.8px] bg-[#F9FAFF] p-1 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/airwise-logo-icon.png"
              alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
              width={26}
              height={26}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-[15px] leading-tight text-[#F9FAFF]">
              AIRWISE <span className="text-[#4BA9FF]">AI</span>
            </span>
            <span className="text-[9px] text-[#A3A3C8] font-medium leading-none">
              Breathe Smarter
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-[6.4px] text-[#D0D2D7] hover:bg-[#555555] transition-colors focus-visible:outline-2 focus-visible:outline-[#4BA9FF]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#39414B] border-r border-[#677580] flex flex-col transition-transform duration-150 ease-out md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#677580]">
          <Link href="/" className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#4BA9FF] rounded-[10.88px] p-1 -m-1">
            <div className="w-11 h-11 rounded-[10.88px] bg-[#F9FAFF] p-1.5 flex items-center justify-center border border-[#97A7B6] shadow-xs group-hover:border-[#4BA9FF] group-hover:scale-105 transition-all shrink-0">
              <Image
                src="/airwise-logo-icon.png"
                alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
                width={38}
                height={38}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-[17px] text-[#F9FAFF] tracking-tight flex items-center gap-1 leading-[20px]">
                AIRWISE <span className="text-[#4BA9FF]">AI</span>
              </h1>
              <p className="text-[9.5px] text-[#A3A3C8] font-semibold tracking-wider uppercase leading-[13px] mt-0.5">
                Eco-Tech Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-[6.8px] text-[12px] font-semibold transition-colors duration-150
                  ${isActive 
                    ? 'bg-[#296AE1] text-[#F9FAFF] shadow-xs' 
                    : 'text-[#D0D2D7] hover:text-[#F9FAFF] hover:bg-[#555555]'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F9FAFF]' : 'text-[#97A7B6]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-extrabold uppercase tracking-wider bg-[#3D7AB2] text-[#F9FAFF] px-2 py-0.5 rounded-[6.4px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* CPCB Standard Verification & Tagline Footer */}
        <div className="p-3.5 border-t border-[#677580] bg-[#23272B] m-3 rounded-[10.88px] space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4BA9FF] mt-0.5 shrink-0" />
            <div className="text-[10px] text-[#D0D2D7]">
              <p className="font-bold text-[#F9FAFF] leading-[13.6px]">CPCB Methodology</p>
              <p className="text-[10px] text-[#CCD3D7] mt-0.5 leading-[13.6px]">
                Indian National Air Quality Index calculation protocols.
              </p>
            </div>
          </div>
          <p className="text-[9px] text-[#A3A3C8] italic pt-1 border-t border-[#39414B] text-center leading-tight">
            "Breathe Smarter. Move Safer. Live Greener."
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#23272B]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#677580] bg-[#39414B] py-6 px-6 text-[10px] text-[#CCD3D7]">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand Lockup */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#F9FAFF] p-1 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
                <Image
                  src="/airwise-logo-icon.png"
                  alt="AIRWISE AI — Breathe Smarter. Move Safer. Live Greener."
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-[13px] text-[#F9FAFF] tracking-tight flex items-center gap-1.5 leading-tight">
                  AIRWISE <span className="text-[#4BA9FF]">AI</span>
                </div>
                <p className="text-[10px] text-[#A3A3C8] leading-tight">
                  Breathe Smarter. Move Safer. Live Greener.
                </p>
              </div>
            </div>

            {/* Platform Provenance Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#D0D2D7]">
              <span className="px-2 py-0.5 rounded-[6.4px] bg-[#23272B] border border-[#677580]">
                CPCB Indian Standard
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-[6.4px] bg-[#23272B] border border-[#677580]">
                CAMS Global Model (~40 km)
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-[6.4px] bg-[#23272B] border border-[#677580]">
                Google Gemini 1.5
              </span>
            </div>

            {/* Copyright */}
            <p className="leading-[15.2px] text-[#CCD3D7]">
              &copy; 2026 <span className="font-bold text-[#F9FAFF]">AIRWISE AI</span>. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
