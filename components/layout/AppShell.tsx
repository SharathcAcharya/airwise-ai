'use client';

import React, { useState, useEffect } from 'react';
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
  Route,
  BarChart3,
  Bell,
  Globe,
  WifiOff,
  Award
} from 'lucide-react';
import { useLanguage, SupportedLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { INITIAL_ALERTS, AQIAlert } from '@/lib/store';

interface NavItem {
  id: string;
  nameKey: string;
  defaultName: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupKey: string;
  defaultGroup: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'nav.groups.overview',
    defaultGroup: 'Overview',
    items: [
      { id: 'dashboard', nameKey: 'nav.dashboard', defaultName: 'Dashboard', href: '/', icon: Wind },
      { id: 'myDay', nameKey: 'nav.myDay', defaultName: 'My Day (Air-Smart)', href: '/my-day', icon: CalendarClock, badge: 'Signature' },
    ],
  },
  {
    groupKey: 'nav.groups.intelligence',
    defaultGroup: 'Intelligence',
    items: [
      { id: 'assistant', nameKey: 'nav.assistant', defaultName: 'AI Assistant', href: '/assistant', icon: Bot },
      { id: 'explorer', nameKey: 'nav.explorer', defaultName: 'Exposure Explorer', href: '/explorer', icon: MapPin },
      { id: 'commute', nameKey: 'nav.commute', defaultName: 'Commute Planner', href: '/commute', icon: Route },
      { id: 'insights', nameKey: 'nav.insights', defaultName: 'My Insights', href: '/insights', icon: BarChart3 },
    ],
  },
  {
    groupKey: 'nav.groups.community',
    defaultGroup: 'Community',
    items: [
      { id: 'communityWatch', nameKey: 'nav.communityWatch', defaultName: 'Community Watch', href: '/community', icon: AlertTriangle },
      { id: 'challenges', nameKey: 'nav.challenges', defaultName: 'Green Challenges', href: '/sustainability#challenges', icon: Award },
    ],
  },
  {
    groupKey: 'nav.groups.personal',
    defaultGroup: 'Personal',
    items: [
      { id: 'sustainability', nameKey: 'nav.sustainability', defaultName: 'Sustainability Tracker', href: '/sustainability', icon: Leaf },
      { id: 'notifications', nameKey: 'nav.notifications', defaultName: 'Alerts & Notifications', href: '/notifications', icon: Bell },
      { id: 'preferences', nameKey: 'nav.preferences', defaultName: 'Preferences', href: '/preferences', icon: Sliders },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const { language, setLanguage, languages, currentLanguageMeta, t } = useLanguage();
  const { isOffline, cachedTelemetryTime } = useLocation();

  // Register Service Worker in production
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  // Load alert unread count from storage or fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem('airwise_aqi_alerts');
      if (stored) {
        const parsed = JSON.parse(stored) as AQIAlert[];
        if (Array.isArray(parsed)) {
          setUnreadCount(parsed.filter((a) => !a.read).length);
          return;
        }
      }
      setUnreadCount(INITIAL_ALERTS.filter((a) => !a.read).length);
    } catch (e) {
      console.warn(e);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#23272B] flex flex-col md:flex-row text-[#F9FAFF] font-sans antialiased">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-[#8B2323] text-[#F9FAFF] px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0 text-[#FFD2D2]" />
            <span>
              <strong>{t('common.offlineMode', 'Offline Mode — Cached data from')}:</strong>{' '}
              {cachedTelemetryTime ? new Date(cachedTelemetryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier session'}.
              Automatic live telemetry updates will resume when network connectivity is restored.
            </span>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className={`md:hidden flex items-center justify-between px-4 py-3 bg-[#39414B] border-b border-[#677580] sticky ${isOffline ? 'top-8' : 'top-0'} z-40`}>
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-sm text-[#F9FAFF] tracking-tight group focus-visible:outline-2 focus-visible:outline-[#4BA9FF] rounded-[6.8px]"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-8 h-8 rounded-[6.8px] bg-[#F9FAFF] p-1 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/airwise-logo-icon.png"
              alt={t('brand.tagline', 'AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.')}
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
              {t('brand.sub', 'Eco-Tech Intelligence')}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2 py-1 rounded-[6.4px] bg-[#23272B] border border-[#677580] text-[11px] font-semibold text-[#D0D2D7] hover:text-[#F9FAFF] flex items-center gap-1.5"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#4BA9FF]" />
              <span>{currentLanguageMeta.nativeName}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-[#2B313A] border border-[#677580] rounded-[8px] shadow-lg py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between hover:bg-[#3D4753] ${
                      language === l.code ? 'text-[#4BA9FF] font-bold bg-[#39414B]' : 'text-[#D0D2D7]'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[9px] text-[#97A7B6] uppercase">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="p-2 rounded-[6.4px] text-[#D0D2D7] hover:bg-[#555555] transition-colors relative"
            aria-label="View Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E5484D] ring-2 ring-[#39414B]" />
            )}
          </Link>

          {/* Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[6.4px] text-[#D0D2D7] hover:bg-[#555555] transition-colors focus-visible:outline-2 focus-visible:outline-[#4BA9FF]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#39414B] border-r border-[#677580] flex flex-col transition-transform duration-150 ease-out md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#677580]">
          <Link href="/" className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#4BA9FF] rounded-[10.88px] p-1 -m-1">
            <div className="w-10 h-10 rounded-[10.88px] bg-[#F9FAFF] p-1 flex items-center justify-center border border-[#97A7B6] shadow-xs group-hover:border-[#4BA9FF] group-hover:scale-105 transition-all shrink-0">
              <Image
                src="/airwise-logo-icon.png"
                alt={t('brand.tagline', 'AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.')}
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-[16px] text-[#F9FAFF] tracking-tight flex items-center gap-1 leading-[20px]">
                AIRWISE <span className="text-[#4BA9FF]">AI</span>
              </h1>
              <p className="text-[9px] text-[#A3A3C8] font-semibold tracking-wider uppercase leading-[13px] mt-0.5">
                {t('brand.sub', 'Eco-Tech Intelligence')}
              </p>
            </div>
          </Link>
        </div>

        {/* Global Language Switcher Bar */}
        <div className="px-3 pt-3">
          <div className="bg-[#2B313A] border border-[#677580] rounded-[8px] p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#D0D2D7]">
              <Globe className="w-3.5 h-3.5 text-[#4BA9FF]" />
              <span className="font-medium">{t('common.language', 'Language')}:</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-[#23272B] border border-[#677580] text-[#F9FAFF] text-[11px] font-semibold rounded-[6px] px-2 py-1 focus:border-[#4BA9FF] focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Links Grouped */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-1">
              <div className="px-2 text-[9.5px] font-extrabold text-[#97A7B6] uppercase tracking-wider">
                {t(group.groupKey, group.defaultGroup)}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0]);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-[6.8px] text-[12px] font-semibold transition-colors duration-150
                      ${isActive
                        ? 'bg-[#296AE1] text-[#F9FAFF] shadow-xs'
                        : 'text-[#D0D2D7] hover:text-[#F9FAFF] hover:bg-[#555555]'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F9FAFF]' : 'text-[#97A7B6]'}`} />
                      <span>{t(item.nameKey, item.defaultName)}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[8px] font-extrabold uppercase tracking-wider bg-[#3D7AB2] text-[#F9FAFF] px-2 py-0.5 rounded-[6.4px]">
                        {item.badge}
                      </span>
                    )}
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className="text-[9px] font-extrabold bg-[#E5484D] text-[#F9FAFF] px-1.5 py-0.2 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* CPCB Standard Verification & Tagline Footer */}
        <div className="p-3 border-t border-[#677580] bg-[#23272B] m-2.5 rounded-[10px] space-y-1.5">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4BA9FF] mt-0.5 shrink-0" />
            <div className="text-[10px] text-[#D0D2D7]">
              <p className="font-bold text-[#F9FAFF] leading-tight">
                {t('brand.cpcbMethodology', 'CPCB Methodology')}
              </p>
              <p className="text-[9.5px] text-[#CCD3D7] mt-0.5 leading-snug">
                {t('brand.cpcbProtocol', 'Indian National Air Quality Index calculation protocols.')}
              </p>
            </div>
          </div>
          <p className="text-[9px] text-[#A3A3C8] italic pt-1 border-t border-[#39414B] text-center leading-tight">
            "{t('brand.tagline', 'Breathe Smarter. Move Safer. Live Greener.')}"
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#23272B]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#677580] bg-[#39414B] py-5 px-6 text-[10px] text-[#CCD3D7]">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand Lockup */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#F9FAFF] p-1 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
                <Image
                  src="/airwise-logo-icon.png"
                  alt={t('brand.tagline', 'AIRWISE AI — Breathe Smarter. Move Safer. Live Greener.')}
                  width={26}
                  height={26}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-[13px] text-[#F9FAFF] tracking-tight flex items-center gap-1.5 leading-tight">
                  AIRWISE <span className="text-[#4BA9FF]">AI</span>
                </div>
                <p className="text-[9.5px] text-[#A3A3C8] leading-tight">
                  {t('brand.tagline', 'Breathe Smarter. Move Safer. Live Greener.')}
                </p>
              </div>
            </div>

            {/* Platform Provenance Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#D0D2D7]">
              <span className="px-2 py-0.5 rounded-[6.4px] bg-[#23272B] border border-[#677580]">
                {t('brand.cpcbStandard', 'CPCB Indian Standard')}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-[6.4px] bg-[#23272B] border border-[#677580]">
                {t('brand.camsModel', 'CAMS Global Model (~40 km)')}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-[6.4px] bg-[#23272B] border border-[#677580]">
                {t('brand.gemini', 'Google Gemini 1.5')}
              </span>
            </div>

            {/* Copyright */}
            <p className="leading-tight text-[#CCD3D7]">
              &copy; 2026 <span className="font-bold text-[#F9FAFF]">AIRWISE AI</span>. {t('brand.rights', 'All rights reserved.')}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
