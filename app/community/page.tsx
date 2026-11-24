'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Send, 
  ShieldAlert, 
  ThumbsUp, 
  Flame, 
  Clock, 
  Plus, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { CommunityReport, INITIAL_COMMUNITY_REPORTS } from '@/lib/store';

export default function CommunityReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [showReportForm, setShowReportForm] = useState(false);

  // Form State
  const [category, setCategory] = useState<CommunityReport['category']>('garbage_burning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Anand Vihar, Delhi');
  const [severity, setSeverity] = useState<CommunityReport['severity']>('high');

  // Load from local storage
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
      title,
      description,
      locationName,
      latitude: 28.65,
      longitude: 77.31,
      severity,
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      isVerified: false, // Explicit unverified citizen report
    };

    saveReports([newReport, ...reports]);
    setTitle('');
    setDescription('');
    setShowReportForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Citizen Environmental Watch
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Community Pollution Hotspot Reports
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Crowdsourced observation feed for open waste burning, construction dust and localized plumes.
          </p>
        </div>

        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report Pollution Incident</span>
        </button>
      </div>

      {/* Mandatory Regulatory Transparency Disclosure */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Transparent Citizen Sourced Data Policy:</p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            All items in this feed are <strong>unverified citizen observations</strong> submitted by members of the public. They do not constitute official statutory pollution monitoring or certified legal enforcement data from CPCB or State Pollution Control Boards.
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
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isHazardous
                        ? 'bg-red-100 text-red-800'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rep.severity} Severity
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-2.5 leading-snug">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {rep.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700">{rep.locationName}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(rep.reportedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 italic">Unverified</span>
                  <button
                    onClick={() => handleUpvote(rep.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              Submit Citizen Pollution Incident Report
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brief Headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open plastic burning near school boundary"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Details & Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe smoke color, wind direction, visible smell or specific landmark..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                  >
                    <option value="low">Low (Localized annoyance)</option>
                    <option value="medium">Medium (Visible haze)</option>
                    <option value="high">High (Thick dense plume)</option>
                    <option value="hazardous">Hazardous (Pungent toxicity)</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                * Submitted reports are flagged as unverified community observations.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
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
