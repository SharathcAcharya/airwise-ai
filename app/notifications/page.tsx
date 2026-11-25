'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  Moon,
  Sliders,
  Check,
  Trash2,
  Volume2,
  AlertTriangle,
  Info,
  Send,
  MapPin
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { AQIAlert, INITIAL_ALERTS, DEFAULT_PREFERENCES, UserPreferences } from '@/lib/store';

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { currentLocation, savedLocations } = useLocation();

  const [alerts, setAlerts] = useState<AQIAlert[]>(INITIAL_ALERTS);
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [savedNotice, setSavedNotice] = useState(false);
  const [testSentNotice, setTestSentNotice] = useState(false);

  useEffect(() => {
    // Check Notification API support & status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }

    try {
      const storedAlerts = localStorage.getItem('airwise_aqi_alerts');
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      }

      const storedPrefs = localStorage.getItem('airwise_user_preferences');
      if (storedPrefs) {
        setPrefs(JSON.parse(storedPrefs));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const saveAlerts = (newAlerts: AQIAlert[]) => {
    setAlerts(newAlerts);
    try {
      localStorage.setItem('airwise_aqi_alerts', JSON.stringify(newAlerts));
    } catch (e) {
      console.warn(e);
    }
  };

  const savePrefs = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    try {
      localStorage.setItem('airwise_user_preferences', JSON.stringify(newPrefs));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported on this browser.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        savePrefs({ ...prefs, enableBrowserNotifications: true });
        new Notification('AIRWISE AI — Alerts Enabled', {
          body: 'You will receive timely clean-air alerts when pollution exceeds your threshold.',
          icon: '/favicon-32x32.png',
        });
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
    }
  };

  const markAllAsRead = () => {
    const updated = alerts.map((a) => ({ ...a, read: true }));
    saveAlerts(updated);
  };

  const clearAllAlerts = () => {
    saveAlerts([]);
  };

  const triggerTestAlert = () => {
    const newAlert: AQIAlert = {
      id: `alert-test-${Date.now()}`,
      locationName: currentLocation.name,
      aqi: prefs.notifyAQIThreshold + 25,
      category: 'Poor',
      dominantPollutant: 'PM2.5',
      message: `Test alert: Ambient particulate level crossed your threshold (${prefs.notifyAQIThreshold} AQI). Wear an N95 respirator if traveling outdoors.`,
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'warning',
    };

    const updated = [newAlert, ...alerts];
    saveAlerts(updated);
    setTestSentNotice(true);
    setTimeout(() => setTestSentNotice(false), 3000);

    // If browser notifications enabled & permitted, dispatch
    if (browserPermission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(`AIRWISE AI Alert — ${currentLocation.name}`, {
        body: newAlert.message,
        icon: '/favicon-32x32.png',
      });
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
                <Bell className="w-3.5 h-3.5 text-[#4BA9FF]" />
                {t('notifications.title', 'Intelligent AQI Alerts & Notifications')}
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold bg-[#E5484D] text-[#F9FAFF] px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F9FAFF] tracking-tight mt-1 leading-[28px] sm:leading-[32.4px]">
              Air Quality Early-Warning Center
            </h2>
            <p className="text-[12px] text-[#D0D2D7] mt-0.5 leading-[17.28px]">
              {t('notifications.subtitle', 'Real-time automated alerts when particulate concentrations cross your safety threshold.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTestAlert}
            className="aqi-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#4BA9FF]" />
            <span>Send Test Alert</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#F9FAFF] bg-[#209040] px-4 py-2.5 rounded-[8px] border border-[#4BA9FF]">
          <CheckCircle2 className="w-4 h-4 text-[#F9FAFF]" />
          <span>Alert settings updated successfully.</span>
        </div>
      )}

      {testSentNotice && (
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#F9FAFF] bg-[#296AE1] px-4 py-2.5 rounded-[8px] border border-[#4BA9FF]">
          <Bell className="w-4 h-4 text-[#4BA9FF]" />
          <span>Test environmental alert generated and recorded below.</span>
        </div>
      )}

      {/* Threshold & Notification Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Push Notification & Threshold Setting */}
        <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center border border-[#677580]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-[#F9FAFF]">
                {t('notifications.thresholdLabel', 'Alert Threshold (Indian AQI)')}
              </h3>
              <p className="text-[10px] text-[#D0D2D7]">
                Trigger warning when composite AQI crosses this level
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#F9FAFF]">
                Threshold: <span className="text-[#4BA9FF]">{prefs.notifyAQIThreshold} AQI</span>
              </span>
              <span className="text-[10px] text-[#D0D2D7]">
                {prefs.notifyAQIThreshold <= 100
                  ? 'Moderate (Sensitive early alert)'
                  : prefs.notifyAQIThreshold <= 150
                  ? 'Moderate-to-Poor (Standard adult)'
                  : prefs.notifyAQIThreshold <= 200
                  ? 'Poor (High pollution)'
                  : 'Very Poor (Hazardous)'}
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="300"
              step="25"
              value={prefs.notifyAQIThreshold}
              onChange={(e) => savePrefs({ ...prefs, notifyAQIThreshold: Number(e.target.value) })}
              className="w-full accent-[#4BA9FF] cursor-pointer"
            />

            <div className="flex justify-between text-[9px] text-[#97A7B6]">
              <span>50 (Good)</span>
              <span>100 (Moderate)</span>
              <span>150 (Warning)</span>
              <span>200 (Poor)</span>
              <span>300 (Severe)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#677580]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-bold text-[#F9FAFF]">
                  {t('notifications.enableBrowser', 'Enable Push Notifications')}
                </div>
                <div className="text-[10px] text-[#CCD3D7]">
                  {browserPermission === 'granted'
                    ? t('notifications.browserGranted', 'Browser notifications active (foreground & open tab)')
                    : browserPermission === 'denied'
                    ? 'Blocked by browser permissions'
                    : 'Receive ambient alerts while browser tab is active'}
                </div>
              </div>
              {browserPermission === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#209040] bg-[#23272B] px-2.5 py-1 rounded-[6px] border border-[#209040]">
                  <Check className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="aqi-btn-primary text-[11px] py-1 px-3"
                >
                  Enable
                </button>
              )}
            </div>
            <p className="text-[9.5px] text-[#97A7B6] mt-2.5 leading-relaxed">
              * Note: Web Notification API delivers instant system alerts while AIRWISE AI is open or running in your browser tab. Full device-level background wakeups when browser is closed require institutional Web Push (VAPID) service worker gateway.
            </p>
          </div>
        </div>

        {/* Quiet Hours & Monitored Locations */}
        <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6.8px] bg-[#23272B] text-[#4BA9FF] flex items-center justify-center border border-[#677580]">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-[#F9FAFF]">
                {t('notifications.quietHours', 'Quiet Hours (Do Not Disturb)')}
              </h3>
              <p className="text-[10px] text-[#D0D2D7]">
                Mute non-emergency alerts during resting and sleep hours
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#D0D2D7] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.quietHours?.enabled ?? true}
                  onChange={(e) =>
                    savePrefs({
                      ...prefs,
                      quietHours: {
                        ...(prefs.quietHours || { start: '22:00', end: '07:00' }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-[#296AE1] focus:ring-[#4BA9FF]"
                />
                <span>Silence notifications during night</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9.5px] font-bold text-[#CCD3D7] uppercase mb-1">
                  Mute Starts
                </label>
                <input
                  type="time"
                  value={prefs.quietHours?.start || '22:00'}
                  onChange={(e) =>
                    savePrefs({
                      ...prefs,
                      quietHours: {
                        ...(prefs.quietHours || { enabled: true, end: '07:00' }),
                        start: e.target.value,
                        enabled: true,
                      },
                    })
                  }
                  className="aqi-input w-full text-[12px] py-1"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-[#CCD3D7] uppercase mb-1">
                  Mute Ends
                </label>
                <input
                  type="time"
                  value={prefs.quietHours?.end || '07:00'}
                  onChange={(e) =>
                    savePrefs({
                      ...prefs,
                      quietHours: {
                        ...(prefs.quietHours || { enabled: true, start: '22:00' }),
                        end: e.target.value,
                        enabled: true,
                      },
                    })
                  }
                  className="aqi-input w-full text-[12px] py-1"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#677580] text-[10px] text-[#CCD3D7] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4BA9FF] shrink-0" />
              <span>
                Monitors: <strong>{currentLocation.name}</strong> + {savedLocations.length} saved places.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Feed / History */}
      <div className="bg-[#39414B] p-5 rounded-[12px] border border-[#677580] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#677580]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#4BA9FF]" />
            <h3 className="font-bold text-[15px] text-[#F9FAFF]">
              {t('notifications.alertHistory', 'Recent Environmental Alerts')}
            </h3>
          </div>

          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#4BA9FF] hover:underline px-2 py-1"
              >
                Mark all read
              </button>
              <button
                onClick={clearAllAlerts}
                className="text-[11px] font-semibold text-[#E5484D] hover:underline px-2 py-1 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#209040] mx-auto" />
            <p className="text-[13px] font-bold text-[#F9FAFF]">
              No active pollution alerts
            </p>
            <p className="text-[11px] text-[#D0D2D7] max-w-md mx-auto">
              {t('notifications.noAlerts', 'No alerts triggered in the last 24 hours. Air quality within safe parameters.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-[8px] border transition-colors ${
                  !alert.read
                    ? 'bg-[#2B313A] border-[#4BA9FF] shadow-xs'
                    : 'bg-[#23272B] border-[#677580] opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-[6.8px] flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'bg-[#E5484D]/20 text-[#E5484D]'
                        : alert.severity === 'warning'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#296AE1]/20 text-[#4BA9FF]'
                    }`}>
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[13px] text-[#F9FAFF]">
                          {alert.locationName}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-[4px] ${
                          alert.category === 'Poor' || alert.category === 'Very Poor'
                            ? 'bg-[#E5484D] text-[#F9FAFF]'
                            : alert.category === 'Moderate'
                            ? 'bg-[#F59E0B] text-[#23272B]'
                            : 'bg-[#209040] text-[#F9FAFF]'
                        }`}>
                          {alert.aqi} AQI ({alert.category})
                        </span>
                        <span className="text-[10px] text-[#97A7B6]">
                          Driver: {alert.dominantPollutant}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#D0D2D7] mt-1 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#97A7B6] block">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!alert.read && (
                      <span className="inline-block mt-1 w-2 h-2 rounded-full bg-[#4BA9FF]" title="Unread" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
