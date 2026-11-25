# AIRWISE AI

> **"Breathe Smarter. Move Safer. Live Greener."**
>
> *A competition-ready, AI-powered urban air quality and sustainability intelligence platform.*

---

## 🌟 Executive Summary & Problem Statement

Urban citizens in developing nations, particularly across Indian metropolitan clusters, face chronic and episodic air pollution crises. Traditional AQI dashboards provide numbers and colored dials, but fail to answer fundamental personal questions:
- *When should I go for a jog without damaging my lungs?*
- *Is it safe to open windows this afternoon, or will morning thermal inversion trap diesel soot in my room?*
- *How can I adapt my commute to minimize toxic particulate inhalation while curbing personal carbon footprint?*

**AIRWISE AI** transforms raw environmental monitoring data into **actionable daily decisions**, **personalized exposure prevention**, and **quantifiable sustainable mobility habits**.

---

## 🚀 Key Modules & Capabilities

### 1. Smart Dashboard
- **Dynamic Geocoding Search & GPS Integration:** Real-time search across any Indian city, town, or locality (e.g. Mangaluru, Kankanady, Udupi, Bengaluru, Mysuru, Mumbai, Kochi, Delhi) powered by Open-Meteo Geocoding API with debounced autocomplete, Indian priority ranking, and instant browser GPS geolocation.
- **CPCB Indian National AQI:** True sub-index calculation conforming strictly to Central Pollution Control Board (CPCB) methodology.
- **6 Core Pollutants:** PM2.5, PM10, NO2, SO2, CO, and Ground Ozone (O3) with individual linear sub-indices, units, and clear dominant pollutant identification.
- **24-Hour Trend & 5-Day Outlook:** Atmospheric dispersion charts (Recharts) and 5-day predictive forecasts.
- **Data Provenance Transparency:** Explicit labels distinguishing measured station observations, model-based estimates, forecasts, and baseline demonstrations.

### 2. Air Quality Intelligence Engine (CPCB Verified)
- Dedicated reusable mathematical engine (`lib/aqi-engine.ts`).
- Linear interpolation across official CPCB concentration breakpoints:
  $$\mathrm{I}_p = \left[ \frac{\mathrm{I}_{Hi} - \mathrm{I}_{Lo}}{\mathrm{B}_{Hi} - \mathrm{B}_{Lo}} \right] \cdot (\mathrm{C}_p - \mathrm{B}_{Lo}) + \mathrm{I}_{Lo}$$
- **CPCB Averaging Periods & Data Completeness Protocols:**
  - 24-hour averages for PM2.5, PM10, $\text{NO}_2$, $\text{SO}_2$, and $\text{NH}_3$ requiring $\ge 16$ hourly readings ($\ge 66.7\%$ data completeness).
  - 8-hour running averages for $\text{CO}$ and $\text{O}_3$ requiring $\ge 6$ hourly readings ($\ge 75\%$ data completeness).
  - Enforces minimum 3 monitored pollutants with at least one particulate matter indicator ($\text{PM}_{2.5}$ or $\text{PM}_{10}$).
  - Strictly distinguishes official continuous CAAQMS station telemetry from global atmospheric model forecasts (Copernicus CAMS at $\sim 40\text{ km}$ grid resolution, $0.4^\circ \times 0.4^\circ$).
- Full unit and audit test suites (`npm run test:aqi` and `npm run test:audit`) covering breakpoint boundaries, CO unit normalization ($\mu\text{g/m}^3$ to $\text{mg/m}^3$), missing values, and extreme capping.

### 3. My Day, Air-Smart™ (Signature Feature)
- Dynamically maps hourly forecast curves against user daily schedules (wake-up time, outdoor workouts, commute rush hours).
- Does not assume fixed morning/afternoon rules; uses actual forecast minima and maxima.
- Recommends optimal outdoor windows and explains causal justification (e.g. shifts morning workouts indoors during nocturnal boundary layer inversions; schedules indoor air renewal when solar convection dilutes pollutants).
- Communicates explicit uncertainty if data coverage is sparse ($< 6$ hours).

### 4. Personal AI Assistant & Voice Interface (Google Gemini 1.5 + Web Speech)
- **Multilingual Intelligence:** Understands and generates fluent responses in 6 regional Indian languages (English, Kannada, Hindi, Tamil, Bengali, Marathi).
- **Web Speech API Integration:** Speech-to-text voice input and natural text-to-speech reading with pause/stop audio controls.
- **Server-Side API Security:** Server-side route `/api/assistant` integrating Google Gemini with per-IP rate-limiting and character bounds.
- **Strict Grounding:** Bounded strictly to verified environmental readings, preventing invented pollution numbers or speculative clinical claims.
- **Deterministic Offline Fallback Engine:** Rule-based environmental intelligence (`lib/assistant-engine.ts`) answering inquiries in all 6 supported languages.

### 5. Smart Clean-Air Commute Planner (`/commute`)
- Multi-modal route exposure comparison: walking, cycling, electric metro transit, city bus, carpool, and personal vehicle.
- Evaluates particulate inhalation dose risk, travel duration, and estimated $\text{CO}_2$ abatement vs single-occupancy petrol cars.
- Direct "Log to Sustainability Tracker" integration with duplicate submission prevention.
- Explicit transparency regarding CAMS $\sim 40\text{ km}$ atmospheric model resolution.

### 6. Community Pollution Hotspot Map & Citizen Watch (`/community`)
- Interactive coordinate hotspot map plotting active citizen reports across India.
- Category color-coding: waste/garbage burning, construction dust, road silt, industrial plumes, and dense vehicle smoke.
- Formal civic verification workflow with lifecycle badges: **Citizen Report (Unverified)**, **Under Civic Review**, **Community Verified**, and **Civic Action Resolved**.
- Accessible list-based fallback with search, filters, and image attachments.

### 7. Personal Exposure Insights & Dossier (`/insights`)
- Comprehensive daily and weekly analytical summaries: daily mean AQI, cleanest window, and peak smog inversion hours.
- Time spent in Unhealthy ($>150\text{ AQI}$) vs Moderate vs Good air.
- Tailored health guidance aligned with user sensitivity profiles (Asthma, Elderly, Child, Healthy Adult).
- Clean print-optimized layout (`@media print`) and exportable summary dossier.

### 8. Intelligent AQI Alerts & Early Warning Center (`/notifications`)
- User-configurable AQI thresholds (from Moderate $>100$ to Severe $>300$).
- Web Notification API integration with one-click permission toggle.
- Automated quiet hours schedule (e.g. 10:00 PM – 7:00 AM) to mute non-emergency notifications during sleep.
- Monitored locations spanning primary locality and saved family places.

### 9. Green Community Challenges & Badge System (`/sustainability`)
- Weekly collective goals (Metro Mile Champions, Zero-Emission 20K Stride, Signal Idling Stopper, Citizen Hotspot Sentinel).
- Progress tracking, eco-points accrual, and unlocked achievement badges.
- Dynamic streak calculation based on unique logged calendar days.

### 10. Multi-Location & Family Places Matrix
- Save and monitor multiple family locations (Home, Work, School, Family).
- Quick switcher bar on the Dashboard and Preferences pages with zero background GPS battery drain.

### 11. Offline & Low-Bandwidth Resilience (PWA)
- Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) precaching static assets.
- Explicit cached timestamp disclosure during offline mode (never misrepresenting stale data as live).

---

## 🌐 Supported Regional Languages

| Language | Native Name | Code | Speech Recognition / TTS Code |
| :--- | :--- | :---: | :---: |
| **English** | English | `en` | `en-IN` |
| **Kannada** | ಕನ್ನಡ | `kn` | `kn-IN` |
| **Hindi** | हिन्दी | `hi` | `hi-IN` |
| **Tamil** | தமிழ் | `ta` | `ta-IN` |
| **Bengali** | বাংলা | `bn` | `bn-IN` |
| **Marathi** | मराठी | `mr` | `mr-IN` |

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling & Brand:** Tailwind CSS v4, official Eco-Tech design system tokens, standardized typography scale, WCAG 2.2 AA contrast compliance, responsive mobile/tablet/desktop layouts
- **Brand Assets:** Official AIRWISE AI Eco-Tech Logo, high-resolution derived icon mark, OpenGraph social card, and App Router metadata icons
- **Visualization:** Recharts & Lucide React
- **Environmental APIs:** Open-Meteo Air Quality API (CAMS Global model) with OpenAQ telemetry compatibility
- **AI Engine:** Google Gemini 1.5 Flash via server-side API routes

---

## 📦 Getting Started & Setup

### Prerequisites
- Node.js 20+ / 24+
- npm or pnpm

### Installation

```bash
git clone <repo-url>
cd airwise-ai
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Google Gemini API Key for AI Assistant
# If omitted, AIRWISE AI runs with its built-in rule-based environmental engine
GEMINI_API_KEY="your-gemini-api-key"
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Test Suites

```bash
# Core CPCB mathematical checks
npm run test:aqi

# Comprehensive 101-point competition readiness audit
npm run test:audit
```

### Production Build

```bash
npm run build
npm start
```

---

## 🧪 Testing Coverage

The platform includes automated testing for:
1. **Sub-index Breakpoint Interpolation:** PM2.5, PM10, NO2, SO2, CO, and O3 calculations across Good, Satisfactory, Moderate, Poor, Very Poor, and Severe categories.
2. **CPCB Completeness Protocol:** Validation of $\ge 16$ hours for 24-hr averages and $\ge 6$ hours for 8-hr CO/O3.
3. **Rejection Safeguards:** Rejection of composite AQI when fewer than 3 pollutants exist or when particulate data is absent.
4. **CO Unit Normalization:** Conversion from $\mu\text{g/m}^3$ to $\text{mg/m}^3$.
5. **My Day Dynamic Planner:** Accurate evaluation of highest and lowest pollution hours from actual forecast curves.
6. **AI Assistant Inquiries:** 10 grounded public health inquiries verified without medical hallucination.
7. **Sustainability Math:** Model consistency across transit emission calculations.
8. **Phase 4 Multilingual i18n:** Automated schema validation across all 6 language dictionaries (`en`, `kn`, `hi`, `ta`, `bn`, `mr`).
9. **Regional Language AI Grounding:** Verification of native script generation in Kannada, Hindi, Tamil, Bengali, and Marathi.
10. **Commute Routing & Abatement:** Verification of multi-modal route calculations and $\text{CO}_2$ mitigation formulas.
11. **Hotspot Workflow:** Formal verification status validation (`unverified`, `under_review`, `verified`, `resolved`).
12. **PWA Manifest & Service Worker Assets:** Pre-caching asset definitions and registration checks.
13. **Quiet Hours Logic:** Algorithmic night-time mute boundary validation across midnight intervals.
14. **Phase 5 Real-World E2E Integrity:** Validation of commute edge cases (identical origin/destination rejection, dynamic corridor distance scaling), unified single-source eco-actions storage (`airwise_eco_actions`), challenge progression tamper resistance (advancement strictly gated by matching action types), community upload boundaries (2 MB ceiling, strict MIME whitelist), 100% leaf key parity across all 6 language schemas (168 keys), and bounded rate limiter memory management.

---

## 🔒 Security & Privacy

- **Server-Side API Security:** Gemini API keys are never exposed to the client browser.
- **Rate Limiting:** In-memory sliding-window request throttling on `/api/assistant`.
- **Graceful Degradation:** The platform functions even without external credentials.
- **Privacy First:** User schedules, saved family places, and preferences are stored locally in the browser (`localStorage`) without collecting unnecessary personal identity data.
- **No Background GPS Tracking:** Geolocation is only accessed when explicitly requested by user action.

---

## ⚖️ Assumptions & Limitations

- **CAMS Global Model Resolution:** Global atmospheric chemistry models operate at approximately $0.4^\circ \times 0.4^\circ$ grid cells ($\sim 40\text{ km}$ across India). They represent regional convective distributions rather than street-corner microclimates.
- **Citizen Observations:** Community reports represent unverified citizen flags to assist local awareness and are not certified legal enforcement records until reviewed and confirmed.

---

## 🚀 Institutional & Smart-City Roadmap

- Direct integration with institutional dashboard viewports for schools, hospitals, and corporate campuses.
- Ingestion of localized micro-sensor CAAQMS station feeds.
- Automated municipal grievance redressal API hooks (e.g. Sameer app / CPCB portal).

---

**AIRWISE AI** — *Breathe Smarter. Move Safer. Live Greener.*
