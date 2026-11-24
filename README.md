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
- **Live Location Selector & GPS Integration:** Real-time lookup for major metropolitan cities across India (Delhi Anand Vihar, Connaught Place, Mumbai BKC, Bengaluru Whitefield, Kolkata, Chennai, Hyderabad, Pune, etc.) with browser geolocation.
- **CPCB Indian National AQI:** True sub-index calculation conforming strictly to Central Pollution Control Board (CPCB) methodology.
- **6 Core Pollutants:** PM2.5, PM10, NO2, SO2, CO, and Ground Ozone (O3) with individual linear sub-indices, units, and clear dominant pollutant identification.
- **24-Hour Trend & 5-Day Outlook:** Atmospheric dispersion charts (Recharts) and 5-day predictive forecasts.
- **Data Provenance Transparency:** Explicit labels distinguishing measured sensor data, model-based estimates, forecasts, and baseline demonstrations.

### 2. Air Quality Intelligence Engine (CPCB Verified)
- Dedicated reusable mathematical engine (`lib/aqi-engine.ts`).
- Linear interpolation across official CPCB concentration breakpoints:
  $$\mathrm{I}_p = \left[ \frac{\mathrm{I}_{Hi} - \mathrm{I}_{Lo}}{\mathrm{B}_{Hi} - \mathrm{B}_{Lo}} \right] \cdot (\mathrm{C}_p - \mathrm{B}_{Lo}) + \mathrm{I}_{Lo}$$
- **Data Quality Safeguard:** In strict compliance with CPCB protocols, composite AQI requires a minimum of **3 valid pollutants** and **at least one particulate parameter (PM2.5 or PM10)**. If these criteria are not met, the engine gracefully flags insufficient data rather than returning an invalid index.
- Full unit test suite (`lib/run-tests.mjs`) covering breakpoint boundaries, CO unit normalization ($\mu\text{g/m}^3$ to $\text{mg/m}^3$), missing values, and extreme capping.

### 3. My Day, Air-Smart™ (Signature Feature)
- Maps hourly forecast curves against user daily schedules (wake-up time, outdoor workouts, commute rush hours).
- Provides actionable recommendations with **clear causal justification** (e.g. shifts morning workouts indoors during nocturnal boundary layer inversions; schedules indoor air renewal between 1:30 PM and 4:30 PM when solar convection dilutes pollutants).
- Tailors advice to user sensitivity profiles (Healthy Adult, Asthma / Respiratory, Children, Elderly).

### 4. Personal AI Assistant (Google Gemini 1.5)
- Server-side route `/api/assistant` integrating Google Gemini.
- Bounded strictly to verified environmental readings, preventing invented pollution numbers or speculative clinical claims.
- Provides public health advisory framing with immediate practical alternatives (N95 mask requirements, indoor HEPA filtration, low-exposure travel routes).
- Graceful server-side fallback engine if an API key is not configured.

### 5. Exposure Explorer & Monitoring Grid
- Regional overview of active continuous monitoring stations across India.
- Clear disclosure regarding atmospheric model resolution (~10 km) vs. street-level microclimates, preventing misleading claims.

### 6. Sustainability & Eco-Action Tracker
- Interactive tracker for walking, cycling, electric metro transit, carpooling, and engine shut-off at long traffic signals.
- Transparent carbon abatement estimates based on urban transit benchmarks (~140–180 g $\text{CO}_2/\text{km}$ avoided vs. single-occupant petrol cars).
- Gamified eco-points, streaks, and habit reinforcement.

### 7. Citizen Community Watch
- Crowdsourced reporting for localized environmental violations: municipal waste burning, construction dust drift, unpaved road dust, and industrial plumes.
- Upvoting and severity indicators clearly marked as **unverified citizen observations**.

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Modern clean design system: emerald accents, slate typography, rounded cards, subtle transitions)
- **Visualization:** Recharts & Lucide React
- **Environmental APIs:** Open-Meteo Air Quality API (with OpenAQ fallback compatibility)
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

### Running Test Suite

```bash
npm run test:aqi
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
2. **CPCB Minimum Criteria Verification:** Rejection of composite AQI when fewer than 3 pollutants exist or when particulate data is absent.
3. **CO Unit Normalization:** Conversion from $\mu\text{g/m}^3$ to $\text{mg/m}^3$.
4. **My Day Schedule Alignment:** Correct categorization and rescheduling recommendations during high pollution periods.
5. **Sustainability Math:** Model consistency across transit emission calculations.

---

## 🔒 Security & Privacy

- **Server-Side API Security:** Gemini API keys are never exposed to the client browser.
- **Graceful Degradation:** The platform functions even without external credentials.
- **Privacy First:** User schedules and preferences are stored locally in the browser (`localStorage`) without collecting unnecessary personal identity data.

---

## ⚖️ Assumptions & Limitations

- **Model vs. Sensor Measurements:** Open-Meteo Air Quality provides modeled estimates combining satellite observations (Copernicus CAMS) and meteorological forecasts. They are explicitly marked as model-estimates.
- **Street-Level Accuracy:** Urban microclimates can vary within 100 meters due to localized building canyons. The app clearly informs users that coarse resolution models do not substitute for dense localized sensor networks.

---

## 🚀 Future Roadmap

- Integration with localized low-cost IoT sensor networks (Breathe Delhi, PurpleAir).
- Push notification service for episodic spike alerts (firecrackers, stubble haze).
- Multilingual accessibility in Hindi, Tamil, Bengali, and Marathi.

---

**AIRWISE AI** — *Breathe Smarter. Move Safer. Live Greener.*
