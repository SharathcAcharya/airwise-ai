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

### 4. Personal AI Assistant (Google Gemini 1.5)
- Server-side route `/api/assistant` integrating Google Gemini with per-IP rate-limiting and character limits.
- Bounded strictly to verified environmental readings, preventing invented pollution numbers or speculative clinical claims.
- Provides public health advisory framing with immediate practical alternatives (N95 mask requirements, indoor HEPA filtration, low-exposure travel routes).
- Comprehensive deterministic fallback engine (`lib/assistant-engine.ts`) with tested coverage across 10 realistic user inquiries.

### 5. Exposure Explorer & Monitoring Grid
- Regional overview of active continuous monitoring stations across India.
- Clear disclosure regarding CAMS atmospheric model resolution ($\sim 40\text{ km}$) vs. street-level microclimates, preventing misleading claims.

### 6. Sustainability & Eco-Action Tracker
- Interactive tracker for walking, cycling, electric metro transit, carpooling, and engine shut-off at long traffic signals.
- Transparent carbon abatement estimates based on urban transit benchmarks (~140–180 g $\text{CO}_2/\text{km}$ avoided vs. single-occupant petrol cars).
- Dynamic streak calculation based on unique logged calendar days, input validation, and duplicate prevention.

### 7. Citizen Community Watch
- Crowdsourced reporting for localized environmental violations: municipal waste burning, construction dust drift, unpaved road dust, and industrial plumes.
- Upvoting and severity indicators clearly marked as **unverified citizen observations**.

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

# Comprehensive 27-point competition readiness audit
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

---

## 🔒 Security & Privacy

- **Server-Side API Security:** Gemini API keys are never exposed to the client browser.
- **Rate Limiting:** In-memory sliding-window request throttling on `/api/assistant`.
- **Graceful Degradation:** The platform functions even without external credentials.
- **Privacy First:** User schedules and preferences are stored locally in the browser (`localStorage`) without collecting unnecessary personal identity data.

---

## ⚖️ Assumptions & Limitations

- **CAMS Global Model Resolution:** Global atmospheric chemistry models operate at approximately $0.4^\circ \times 0.4^\circ$ grid cells ($\sim 40\text{ km}$ across India). They represent regional convective distributions rather than street-corner microclimates.
- **Citizen Observations:** Community reports represent unverified citizen flags to assist local awareness and are not certified legal enforcement records.

---

## 🚀 Future Roadmap

- Integration with localized low-cost IoT sensor networks (Breathe Delhi, PurpleAir).
- Push notification service for episodic spike alerts (firecrackers, stubble haze).
- Multilingual accessibility in Hindi, Tamil, Bengali, and Marathi.

---

**AIRWISE AI** — *Breathe Smarter. Move Safer. Live Greener.*
