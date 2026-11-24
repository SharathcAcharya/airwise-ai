'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ShieldCheck
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
        <Link href="/" className="flex items-center gap-2 font-bold text-sm text-[#F9FAFF] tracking-tight">
          <div className="w-8 h-8 rounded-[6.8px] bg-[#296AE1] flex items-center justify-center text-[#F9FAFF]">
            <Wind className="w-4 h-4" />
          </div>
          <span>AIRWISE AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-[6.4px] text-[#D0D2D7] hover:bg-[#555555] transition-colors"
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
        <div className="p-6 border-b border-[#677580] flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10.88px] bg-[#296AE1] flex items-center justify-center text-[#F9FAFF] shadow-xs">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-[18px] text-[#F9FAFF] tracking-tight flex items-center gap-1.5 leading-[22.4px]">
              AIRWISE <span className="text-[#4BA9FF]">AI</span>
            </h1>
            <p className="text-[10px] text-[#D0D2D7] font-semibold tracking-wider uppercase leading-[13.6px]">
              Breathe Smarter
            </p>
          </div>
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

        {/* CPCB Standard Verification Footer */}
        <div className="p-4 border-t border-[#677580] bg-[#23272B] m-3 rounded-[10.88px]">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4BA9FF] mt-0.5 shrink-0" />
            <div className="text-[10px] text-[#D0D2D7]">
              <p className="font-bold text-[#F9FAFF] leading-[13.6px]">CPCB Methodology</p>
              <p className="text-[10px] text-[#CCD3D7] mt-0.5 leading-[13.6px]">
                Indian National Air Quality Index calculation protocols.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#23272B]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#677580] bg-[#39414B] py-6 px-6 text-center text-[10px] text-[#CCD3D7]">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="leading-[15.2px]">
              &copy; 2026 <span className="font-bold text-[#F9FAFF]">AIRWISE AI</span>. "Breathe Smarter. Move Safer. Live Greener."
            </p>
            <div className="flex items-center gap-4 text-[#D0D2D7]">
              <span>CPCB Indian Standards</span>
              <span>•</span>
              <span>CAMS Global Forecast (~40 km)</span>
              <span>•</span>
              <span>Google Gemini 1.5</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
