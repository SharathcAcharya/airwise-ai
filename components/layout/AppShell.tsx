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
  ShieldCheck,
  ChevronRight
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Wind className="w-5 h-5" />
          </div>
          <span>AIRWISE AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1">
              AIRWISE <span className="text-emerald-600">AI</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
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
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Standard Verification Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 m-3 rounded-2xl">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-800">CPCB Verified Protocol</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Complies with official Indian National Air Quality Index calculation rules.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              &copy; 2026 <span className="font-semibold text-slate-700">AIRWISE AI</span>. "Breathe Smarter. Move Safer. Live Greener."
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <span>CPCB Indian AQI Standard</span>
              <span>•</span>
              <span>Open-Meteo Air Quality</span>
              <span>•</span>
              <span>Google Gemini 1.5</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
