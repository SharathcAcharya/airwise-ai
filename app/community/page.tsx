'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  MapPin,
  ShieldAlert,
  ThumbsUp,
  Clock,
  Plus,
  Map as MapIcon,
  List,
  Filter,
  CheckCircle,
  Eye,
  Upload,
  X,
  Flame,
  Building,
  Truck,
  Factory,
  Search,
  Sparkles
} from 'lucide-react';
import { CommunityReport, INITIAL_COMMUNITY_REPORTS } from '@/lib/store';
import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CommunityReportsPage() {
  const { currentLocation } = useLocation();
  const { t } = useLanguage();

  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<CommunityReport | null>(null);

  // Form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [category, setCategory] = useState<CommunityReport['category']>('garbage_burning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(currentLocation.name);
  const [severity, setSeverity] = useState<CommunityReport['severity']>('high');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    setLocationName(currentLocation.name);
  }, [currentLocation]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('airwise_community_reports');
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const saveReports = (newReports: CommunityReport[]) => {
    setReports(newReports);
    try {
      localStorage.setItem('airwise_community_reports', JSON.stringify(newReports));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpvote = (id: string) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r
    );
    saveReports(updated);
    if (activeReport && activeReport.id === id) {
      setActiveReport({ ...activeReport, upvotes: activeReport.upvotes + 1 });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict client-side bounds check: Max 2 MB to prevent localStorage quota exhaustion
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image file size exceeds 2 MB limit. Please select a smaller photo.');
      e.target.value = '';
      setImagePreview(null);
      return;
    }

    // Strict MIME-type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Unsupported file type. Please upload a JPEG, PNG, or WebP photo.');
      e.target.value = '';
      setImagePreview(null);
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateStatus = (id: string, newStatus: CommunityReport['verificationStatus']) => {
    const updated = reports.map((r) =>
      r.id === id
        ? {
            ...r,
            verificationStatus: newStatus,
            isVerified: newStatus === 'verified' || newStatus === 'resolved',
          }
        : r
    );
    saveReports(updated);
    if (activeReport && activeReport.id === id) {
      setActiveReport({
        ...activeReport,
        verificationStatus: newStatus,
        isVerified: newStatus === 'verified' || newStatus === 'resolved',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageError) return;
    if (!title.trim() || !description.trim()) return;

    // Prevent duplicate hotspot submission within same locality
    const isDuplicate = reports.some(
      (r) =>
        r.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        r.locationName.trim().toLowerCase() === locationName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setImageError('An active hotspot report for this exact incident and locality already exists.');
      return;
    }

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim() || currentLocation.name,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      severity,
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      isVerified: false,
      verificationStatus: 'unverified',
      imageUrl: imagePreview || undefined,
    };

    saveReports([newReport, ...reports]);
    setTitle('');
    setDescription('');
    setImagePreview(null);
    setShowReportForm(false);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (selectedStatus !== 'all') {
        const status = r.verificationStatus || (r.isVerified ? 'verified' : 'unverified');
        if (status !== selectedStatus) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesLoc = r.locationName.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLoc && !matchesDesc) return false;
      }
      return true;
    });
  }, [reports, selectedCategory, selectedStatus, searchQuery]);

  // Color mapping helper
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'garbage_burning':
        return '#E5484D'; // Red
      case 'construction_dust':
        return '#EA8C34'; // Orange
      case 'road_dust':
        return '#F59E0B'; // Amber
      case 'industrial_plume':
        return '#A855F7'; // Purple
      case 'visible_smoke':
        return '#3D7AB2'; // Blue
      default:
        return '#97A7B6';
    }
  };

  const getStatusBadge = (status?: string, isVerified?: boolean) => {
    const s = status || (isVerified ? 'verified' : 'unverified');
    switch (s) {
      case 'verified':
        return { label: t('community.status.verified', 'Community Verified'), bg: 'bg-[#209040]', text: 'text-[#F9FAFF]' };
      case 'under_review':
        return { label: t('community.status.under_review', 'Under Civic Review'), bg: 'bg-[#EA8C34]', text: 'text-[#23272B]' };
      case 'resolved':
        return { label: t('community.status.resolved', 'Civic Action Resolved'), bg: 'bg-[#296AE1]', text: 'text-[#F9FAFF]' };
      default:
        return { label: t('community.status.unverified', 'Citizen Report (Unverified)'), bg: 'bg-[#555555]', text: 'text-[#F9FAFF]' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFF] p-1.5 flex items-center justify-center border border-[#97A7B6] shadow-xs shrink-0">
            <Image
              src="/airwise-logo-icon.png"
              alt="AIRWISE AI"
              width={42}
              height={42}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-2.5 py-0.5 rounded-[6.4px]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EA8C34]" />
                {t('community.title', 'Community Pollution Hotspot Map & Citizen Watch')}
              </span>
              <span className="text-[10px] font-bold bg-[#3D7AB2] text-[#F9FAFF] px-2 py-0.5 rounded-[6.4px]">
                {filteredReports.length} Active Hotspots
              </span>
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Crowdsourced Environmental Watch & Incident Tracker
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              {t('community.subtitle', 'Hyperlocal crowd-sourced pollution alerts and civic air quality reporting across India.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowReportForm(true)}
            className="aqi-btn-danger text-[12px] py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t('community.reportIssue', 'Report Pollution Hotspot')}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Transparency Disclosure */}
      <div className="bg-[#23272B] border border-[#EA8C34] p-4 rounded-[8px] flex items-start gap-3 text-[11px] text-[#D0D2D7]">
        <ShieldAlert className="w-4 h-4 text-[#EA8C34] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#F9FAFF]">Transparent Citizen Sourced Data Policy:</p>
          <p className="mt-0.5 text-[#CCD3D7] leading-relaxed">
            {t('community.disclaimer', 'Citizen reports represent crowd-sourced ground observations. The initial reports displayed are demonstration examples to preview citizen reporting workflows; new reports submitted in your browser are saved to your local device.')}
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search & View Switcher */}
      <div className="bg-[#39414B] p-4 rounded-[12px] border border-[#677580] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-[6.8px] bg-[#23272B] p-0.5 border border-[#677580]">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-[5px] text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map' ? 'bg-[#296AE1] text-[#F9FAFF]' : 'text-[#D0D2D7] hover:text-[#F9FAFF]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t('community.mapView', 'Map View')}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-[5px] text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-[#296AE1] text-[#F9FAFF]' : 'text-[#D0D2D7] hover:text-[#F9FAFF]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('community.listView', 'List View')}</span>
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#23272B] border border-[#677580] text-[#F9FAFF] text-[11px] font-medium rounded-[6.8px] px-2.5 py-1.5 focus:border-[#4BA9FF] focus:outline-none"
          >
            <option value="all">{t('community.allCategories', 'All Categories')}</option>
            <option value="garbage_burning">{t('community.categories.garbage_burning', 'Waste / Plastic Burning')}</option>
            <option value="construction_dust">{t('community.categories.construction_dust', 'Demolition / Construction Dust')}</option>
            <option value="road_dust">{t('community.categories.road_dust', 'Suspended Road Silt')}</option>
            <option value="industrial_plume">{t('community.categories.industrial_plume', 'Industrial Emissions')}</option>
            <option value="visible_smoke">{t('community.categories.visible_smoke', 'Dense Vehicular Smoke')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#23272B] border border-[#677580] text-[#F9FAFF] text-[11px] font-medium rounded-[6.8px] px-2.5 py-1.5 focus:border-[#4BA9FF] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="unverified">Unverified (Citizen)</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified Hotspots</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#97A7B6] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locality or keyword..."
            className="aqi-input w-full pl-8 py-1.5 text-[11.5px]"
          />
        </div>
      </div>

      {/* Main Display: Interactive Map or Grid List */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Interactive Coordinate Hotspot Map */}
          <div className="lg:col-span-2 bg-[#2B313A] rounded-[12px] border border-[#677580] p-4 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#677580]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4BA9FF]" />
                <span className="text-[13px] font-bold text-[#F9FAFF]">
                  Regional Urban Hotspot Spatial Plot
                </span>
              </div>
              <span className="text-[10px] text-[#A3A3C8]">
                Click any pin to inspect verified citizen telemetry
              </span>
            </div>

            {/* Stylized Visual Coordinate Grid */}
            <div className="relative my-4 flex-1 h-[360px] w-full bg-[#1F2327] rounded-[8px] border border-[#39414B] overflow-hidden flex items-center justify-center">
              {/* Subtle map coordinate grid background */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4BA9FF_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* Center City Radar Ping */}
              <div className="absolute w-44 h-44 rounded-full border border-[#4BA9FF]/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full border border-[#209040]/30" />

              {/* Center Location Indicator */}
              <div className="absolute flex flex-col items-center pointer-events-none z-10">
                <div className="w-3 h-3 rounded-full bg-[#4BA9FF] ring-4 ring-[#4BA9FF]/30" />
                <span className="text-[9px] font-extrabold text-[#F9FAFF] bg-[#23272B] px-1.5 py-0.5 rounded mt-1 border border-[#677580]">
                  {currentLocation.name.split(',')[0]}
                </span>
              </div>

              {/* Plotted Hotspot Pins */}
              {filteredReports.map((rep, idx) => {
                // Scatter dynamically around center based on coordinate delta or hash
                const xOffset = ((rep.longitude * 1000) % 70) - 35;
                const yOffset = ((rep.latitude * 1000) % 60) - 30;
                const pinColor = getCategoryColor(rep.category);
                const isSelected = activeReport?.id === rep.id;

                return (
                  <button
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    style={{
                      transform: `translate(${xOffset * 6}px, ${yOffset * 4}px)`,
                    }}
                    className={`absolute z-20 group transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
                    aria-label={`Hotspot: ${rep.title}`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white"
                      style={{ backgroundColor: pinColor }}
                    >
                      {rep.category === 'garbage_burning' && <Flame className="w-3 h-3" />}
                      {rep.category === 'construction_dust' && <Building className="w-3 h-3" />}
                      {rep.category === 'road_dust' && <MapPin className="w-3 h-3" />}
                      {rep.category === 'industrial_plume' && <Factory className="w-3 h-3" />}
                      {rep.category === 'visible_smoke' && <Truck className="w-3 h-3" />}
                    </div>

                    <span className="absolute left-1/2 -translate-x-1/2 top-7 whitespace-nowrap text-[8.5px] font-bold text-[#F9FAFF] bg-[#23272B] px-1.5 py-0.5 rounded border border-[#677580] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {rep.title.slice(0, 24)}...
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] text-[#D0D2D7] border-t border-[#677580]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
                Waste Burning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA8C34]" />
                Construction Dust
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                Road Dust
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                Industrial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D7AB2]" />
                Vehicular Plume
              </span>
            </div>
          </div>

          {/* Active Hotspot Inspector Card */}
          <div className="bg-[#39414B] rounded-[12px] border border-[#677580] p-5 flex flex-col justify-between">
            {activeReport ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#23272B] text-[#D0D2D7] border border-[#677580]">
                      {activeReport.category.replace('_', ' ')}
                    </span>
                    {activeReport.isSampleData && (
                      <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#23272B] text-[#4BA9FF] border border-[#296AE1]">
                        Sample Incident
                      </span>
                    )}
                  </div>
                  {(() => {
                    const badge = getStatusBadge(activeReport.verificationStatus, activeReport.isVerified);
                    return (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <h3 className="text-[16px] font-bold text-[#F9FAFF] leading-snug">
                    {activeReport.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3C8] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#4BA9FF]" />
                    <span>{activeReport.locationName}</span>
                  </div>
                </div>

                <p className="text-[12px] text-[#CCD3D7] leading-relaxed bg-[#23272B] p-3 rounded-[8px] border border-[#677580]">
                  {activeReport.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="bg-[#2B313A] p-2 rounded-[6px]">
                    <span className="text-[#97A7B6] block">Severity</span>
                    <strong className="text-[#E5484D] uppercase font-bold">{activeReport.severity}</strong>
                  </div>
                  <div className="bg-[#2B313A] p-2 rounded-[6px]">
                    <span className="text-[#97A7B6] block">Coordinates</span>
                    <strong className="text-[#F9FAFF]">{activeReport.latitude}°N, {activeReport.longitude}°E</strong>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2 border-t border-[#677580]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#97A7B6]">
                      Reported {new Date(activeReport.reportedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleUpvote(activeReport.id)}
                      className="aqi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#4BA9FF]" />
                      <span>{t('community.upvote', 'Support')} ({activeReport.upvotes})</span>
                    </button>
                  </div>
                  {/* Status Lifecycle Transition */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      {activeReport.verificationStatus !== 'verified' && activeReport.verificationStatus !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(activeReport.id, 'verified')}
                          className="text-[10px] font-bold bg-[#209040] hover:bg-[#209040]/80 text-[#F9FAFF] py-1 px-2.5 rounded-[5px] transition-colors"
                        >
                          Verify Hotspot (Demo Mode)
                        </button>
                      )}
                      {activeReport.verificationStatus === 'verified' && (
                        <button
                          onClick={() => handleUpdateStatus(activeReport.id, 'resolved')}
                          className="text-[10px] font-bold bg-[#296AE1] hover:bg-[#296AE1]/80 text-[#F9FAFF] py-1 px-2.5 rounded-[5px] transition-colors"
                        >
                          Mark as Resolved (Demo Mode)
                        </button>
                      )}
                      {activeReport.verificationStatus === 'resolved' && (
                        <span className="text-[10px] text-[#209040] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Civic Action Completed
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-[#97A7B6] leading-tight">
                      * Status verification workflow demonstrates community review lifecycles. Official statutory verification requires municipal credentials.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-2">
                <MapPin className="w-8 h-8 text-[#97A7B6] mx-auto" />
                <h4 className="text-[13px] font-bold text-[#F9FAFF]">
                  Select a Hotspot on Map
                </h4>
                <p className="text-[11px] text-[#CCD3D7] max-w-xs mx-auto">
                  Click any colored coordinate pin on the spatial map to inspect details, citizen verification status, or add your endorsement.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Accessible List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((rep) => {
            const badge = getStatusBadge(rep.verificationStatus, rep.isVerified);
            return (
              <div
                key={rep.id}
                className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex flex-col justify-between hover:border-[#97A7B6] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#23272B] text-[#D0D2D7] border border-[#677580]">
                        {rep.category.replace('_', ' ')}
                      </span>
                      {rep.isSampleData && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#23272B] text-[#4BA9FF] border border-[#296AE1]">
                          Sample Incident
                        </span>
                      )}
                    </div>
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-[4px] ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[14px] text-[#F9FAFF] leading-snug">
                      {rep.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#A3A3C8] mt-1">
                      <MapPin className="w-3 h-3 text-[#4BA9FF]" />
                      <span>{rep.locationName}</span>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-[#CCD3D7] leading-relaxed line-clamp-3">
                    {rep.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#677580] flex items-center justify-between text-[11px] mt-4">
                  <span className="text-[10px] text-[#97A7B6] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(rep.reportedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleUpvote(rep.id)}
                    className="flex items-center gap-1.5 text-[#4BA9FF] hover:text-[#F9FAFF] font-semibold text-[11px]"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{rep.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Citizen Report Form */}
      {showReportForm && (
        <div className="fixed inset-0 z-50 bg-[#23272B]/85 flex items-center justify-center p-4">
          <div className="bg-[#39414B] border border-[#677580] rounded-[12px] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#677580]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#EA8C34]" />
                <h3 className="font-bold text-[16px] text-[#F9FAFF]">
                  Submit Local Pollution Incident
                </h3>
              </div>
              <button
                onClick={() => setShowReportForm(false)}
                className="text-[#D0D2D7] hover:text-[#F9FAFF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {imageError && (
                <div className="text-[11px] font-semibold text-[#FFD2D2] bg-[#E5484D]/20 border border-[#E5484D] p-2.5 rounded-[6px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#E5484D] shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Pollution Source Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="aqi-input w-full text-[12px]"
                >
                  <option value="garbage_burning">Waste / Open Garbage / Plastic Burning</option>
                  <option value="construction_dust">Demolition / Uncovered Construction Dust</option>
                  <option value="road_dust">Heavy Silt / Unpaved Road Dust</option>
                  <option value="industrial_plume">Smokestack / Factory Emissions Plume</option>
                  <option value="visible_smoke">Heavy Vehicular / Freight Diesel Exhaust</option>
                  <option value="other">Other Local Environmental Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Short Incident Summary
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open plastic burning behind market bypass"
                  className="aqi-input w-full text-[12px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Location / Landmarks
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Locality, crossroads or landmark"
                  className="aqi-input w-full text-[12px]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                  Detailed Observation
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe smoke density, odor, wind direction, and immediate impact..."
                  rows={3}
                  className="aqi-input w-full text-[12px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="aqi-input w-full text-[12px]"
                  >
                    <option value="low">Low (Light localized dust)</option>
                    <option value="medium">Medium (Noticeable haze)</option>
                    <option value="high">High (Heavy pungent smoke)</option>
                    <option value="hazardous">Hazardous (Zero visibility plume)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#CCD3D7] uppercase tracking-wider mb-1">
                    Photo Attachment
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="text-[11px] text-[#CCD3D7] file:mr-2 file:py-1 file:px-2 file:rounded-[4px] file:border-0 file:text-[10px] file:font-semibold file:bg-[#296AE1] file:text-[#F9FAFF] hover:file:bg-[#3D7AB2]"
                  />
                  {imagePreview && (
                    <div className="relative mt-2 w-20 h-20 rounded-[6px] overflow-hidden border border-[#677580]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Incident preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageError(null);
                        }}
                        className="absolute top-1 right-1 bg-[#23272B]/80 text-white rounded-full p-0.5 hover:bg-[#E5484D]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#677580]">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="aqi-btn-secondary text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aqi-btn-danger text-[11px]"
                >
                  Post Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
