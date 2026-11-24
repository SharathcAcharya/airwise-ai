'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  ShieldAlert, 
  ThumbsUp, 
  Clock, 
  Plus
} from 'lucide-react';
import { CommunityReport, INITIAL_COMMUNITY_REPORTS } from '@/lib/store';

export default function CommunityReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [showReportForm, setShowReportForm] = useState(false);

  const [category, setCategory] = useState<CommunityReport['category']>('garbage_burning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Anand Vihar, Delhi');
  const [severity, setSeverity] = useState<CommunityReport['severity']>('high');

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim(),
      latitude: 28.65,
      longitude: 77.31,
      severity,
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      isVerified: false,
    };

    saveReports([newReport, ...reports]);
    setTitle('');
    setDescription('');
    setShowReportForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#39414B] p-5 rounded-[12px] border border-[#677580]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#F9FAFF] bg-[#296AE1] px-2.5 py-0.5 rounded-[6.4px]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#EA8C34]" />
              Citizen Environmental Watch
            </span>
          </div>
          <h2 className="text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[32.4px]">
            Community Pollution Hotspot Reports
          </h2>
          <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
            Crowdsourced observation feed for open waste burning, construction dust and localized plumes.
          </p>
        </div>

        <button
          onClick={() => setShowReportForm(true)}
          className="aqi-btn-danger"
        >
          <Plus className="w-4 h-4" />
          <span>Report Pollution Incident</span>
        </button>
      </div>

      {/* Mandatory Regulatory Transparency Disclosure */}
      <div className="bg-[#23272B] border border-[#EA8C34] p-4 rounded-[6.8px] flex items-start gap-3 text-[10px] text-[#D0D2D7]">
        <ShieldAlert className="w-4 h-4 text-[#EA8C34] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#F9FAFF]">Transparent Citizen Sourced Data Policy:</p>
          <p className="mt-0.5 text-[#D0D2D7] leading-[15.2px]">
            All items in this feed are <strong>unverified citizen observations</strong> submitted by members of the public. They do not constitute official statutory pollution monitoring from CPCB or State Pollution Control Boards.
          </p>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((rep) => {
          const isHazardous = rep.severity === 'hazardous';
          const isHigh = rep.severity === 'high';

          return (
            <div
              key={rep.id}
              className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] flex flex-col justify-between hover:border-[#97A7B6] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6.4px] bg-[#23272B] text-[#D0D2D7] border border-[#677580]">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6.4px] ${
                      isHazardous
                        ? 'bg-[#E5484D] text-[#F9FAFF]'
                        : isHigh
                        ? 'bg-[#EA8C34] text-[#23272B]'
                        : 'bg-[#555555] text-[#F9FAFF]'
                    }`}
                  >
                    {rep.severity} Severity
                  </span>
                </div>

                <h3 className="font-bold text-[14px] text-[#F9FAFF] mt-2.5 leading-[19.2px]">
                  {rep.title}
                </h3>
                <p className="text-[12px] text-[#D0D2D7] mt-1.5 leading-[17.28px]">
                  {rep.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-[#CCD3D7] mt-3">
                  <MapPin className="w-3.5 h-3.5 text-[#4BA9FF] shrink-0" />
                  <span className="font-semibold text-[#F9FAFF]">{rep.locationName}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#677580] flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-[#CCD3D7] text-[8px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(rep.reportedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-[#CCD3D7] italic">Unverified</span>
                  <button
                    onClick={() => handleUpvote(rep.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#23272B] hover:bg-[#555555] border border-[#677580] text-[#F9FAFF] rounded-[6.4px] font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3 text-[#4BA9FF]" />
                    <span>{rep.upvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Submitting Citizen Report */}
      {showReportForm && (
        <div className="fixed inset-0 z-50 bg-[#23272B]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#39414B] rounded-[12px] border border-[#677580] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-[18px] text-[#F9FAFF] leading-[24px]">
              Submit Citizen Pollution Incident Report
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="aqi-input w-full"
                >
                  <option value="garbage_burning">Open Municipal / Plastic Garbage Burning</option>
                  <option value="road_dust">Heavy Suspended Road Dust / Silt</option>
                  <option value="construction_dust">Uncovered Demolition / Construction Dust</option>
                  <option value="visible_smoke">Dense Black Tailpipe or Generator Smoke</option>
                  <option value="industrial_plume">Industrial Chimney Bypass Plume</option>
                  <option value="other">Other Environmental Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Brief Headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open plastic burning near school boundary"
                  className="aqi-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                  Incident Details & Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe smoke color, wind direction, visible smell or specific landmark..."
                  className="aqi-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="aqi-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#D0D2D7] uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="aqi-input w-full"
                  >
                    <option value="low">Low (Localized annoyance)</option>
                    <option value="medium">Medium (Visible haze)</option>
                    <option value="high">High (Thick dense plume)</option>
                    <option value="hazardous">Hazardous (Pungent toxicity)</option>
                  </select>
                </div>
              </div>

              <div className="text-[8px] text-[#CCD3D7] italic">
                * Submitted reports are flagged as unverified community observations.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="aqi-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aqi-btn-danger"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
