# AIRWISE AI — COMPETITION DEMONSTRATION GUIDE & SCRIPT

**Project:** `AIRWISE AI`  
**Tagline:** *"Breathe Smarter. Move Safer. Live Greener."*  
**Format:** 5-Minute Live Interactive Demonstration & Jury Presentation  
**Target Environment:** Local Demonstration Server / Vercel Edge Serverless Deployment  

---

## 1. Executive Demonstration Script (5-Minute Walkthrough)

### [00:00 – 00:45] The Hook & Problem Statement
> *"Respected jury and evaluators, air pollution is not just a statistical number on a screen. For over 1.4 billion citizens across India, it is a personal daily dilemma:*  
> *- When is it safe for my child to play outdoors?*  
> *- Why did my morning run leave me wheezing when the AQI dial showed moderate?*  
> *- How can I plan my commute across town to minimize inhalation of toxic particulates?*  
>  
> *Traditional air quality dashboards provide colored gauges, but zero actionable guidance. Welcome to **AIRWISE AI** — a competition-ready environmental intelligence platform that transforms raw atmospheric chemistry data into daily personal decisions, exposure prevention, and verified sustainable habits."*

### [00:45 – 01:45] Module 1 & 2: Dynamic Hyperlocal Intelligence & CPCB Precision
> *(Navigate to Dashboard: Search for 'Mangaluru', then 'Bengaluru')*  
> *"Unlike static portals limited to fixed metro monitors, AIRWISE AI features dynamic geocoding across any Indian city, town, or locality with instant browser GPS integration.*  
>  
> *Notice our calculation core: we implement the official **Central Pollution Control Board (CPCB)** linear sub-index formula across all 6 core pollutants: $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, and $\text{O}_3$.  
> Furthermore, we uphold strict scientific honesty: atmospheric model outputs from Copernicus CAMS ($\sim 40\text{ km}$ grid resolution) are explicitly categorized as indicative estimates rather than statutory continuous CAAQMS station telemetry."*

### [01:45 – 02:45] Module 3: Signature Feature — "My Day, Air-Smart™"
> *(Navigate to `/my-day`)*  
> *"Here is our signature innovation: **My Day, Air-Smart™**. Instead of generic advice, our dynamic optimizer correlates the atmospheric forecast curve directly against the user’s waking schedule, exercise preferences, and sensitivity profile.*  
>  
> *Notice the causal environmental explanations: it identifies early morning thermal boundary layer inversions that trap vehicular exhaust, advising users to shift strenuous cardio to early afternoon when solar convection disperses particulate density."*

### [02:45 – 03:45] Module 4 & 5: AI Multilingual Voice Assistant & Clean Commute Planner
> *(Navigate to `/assistant`, switch language to Kannada or Hindi, trigger voice audio)*  
> *"AIRWISE AI speaks the user's language. With 100% leaf-key parity across 6 regional Indian languages—English, Kannada, Hindi, Tamil, Bengali, and Marathi—our Google Gemini 1.5 assistant answers complex public health inquiries in authentic regional scripts.*  
> *(Click 'Listen' to demonstrate Web Speech TTS)*  
>  
> *(Navigate to `/commute`)*  
> *In our Clean-Air Commute Planner, citizens compare travel modes along urban corridors. Choosing electric metro or cycling vs. a solo car calculates inhalation dose risk and verified $\text{CO}_2$ mitigation. With one click, citizens log eco-actions directly to their sustainability ledger."*

### [03:45 – 04:30] Module 6 & 7: Community Hotspot Watch & Sustainability
> *(Navigate to `/community` and `/sustainability`)*  
> *"Air quality governance requires civic participation. Our crowdsourced Community Watch plots localized pollution incidents—such as open waste burning or construction plumes—with client-side 2 MB image validation and duplicate prevention.*  
>  
> *In the Sustainability Tracker, citizens earn eco-points, maintain active green streaks, and unlock collective challenges. Crucially, challenge progression is tamper-resistant: advancement is strictly gated by logging genuine transit and active mobility actions."*

### [04:30 – 05:00] Conclusion & Technical Rigor
> *"AIRWISE AI was engineered with complete production rigor: Next.js 16 App Router, Turbopack compiling in 665ms, WCAG 2.2 AA accessibility, offline PWA caching, and 101 automated audit assertions passing with 100% success.*  
> *We empower citizens to breathe smarter, move safer, and live greener. Thank you, and we welcome your questions."*

---

## 2. Core Problem Statement & Target Users

### The Urban Problem:
- **Information Gap:** Millions of urban residents check air quality numbers without understanding practical personal actions.
- **Microclimate & Timing Ignorance:** Pollution fluctuates radically over 24 hours due to diurnal planetary boundary layer (PBL) dynamics and nocturnal thermal inversions.
- **Language Exclusion:** Most technical environmental dashboards exist exclusively in English, excluding regional vernacular populations.
- **Passive Anxiety vs Active Habits:** Citizens feel helpless regarding smog without tools that quantify how individual mobility choices cut exposure and emissions.

### Target Personas:
1. **The Daily Commuter:** Urban office workers balancing transit time, road soot inhalation, and travel emissions.
2. **The Health-Conscious Athlete / Parent:** Runners, cyclists, and parents planning outdoor exercise or school commutes around peak smog spikes.
3. **Sensitive Groups (Asthma, Elderly, Cardiovascular):** Individuals requiring proactive threshold warnings before stepping outdoors.
4. **Civic & Community Stewards:** Citizens documenting localized open waste burning, road dust silt, or unmonitored industrial emissions.

---

## 3. The 10 Major Application Modules

| Module | Route | Key Capabilities & Architectural Highlights |
| :--- | :---: | :--- |
| **1. Smart Dashboard** | `/` | Dynamic geocoding across any Indian town, CPCB 6-pollutant sub-index cards, 24-hr dispersion trend, and 5-day predictive forecast. |
| **2. My Day, Air-Smart™** | `/my-day` | Dynamic schedule optimizer evaluating real forecast minima and maxima with causal atmospheric inversion advice. |
| **3. AI Environmental Assistant** | `/assistant` | Google Gemini 1.5 Flash server-side integration with Web Speech STT/TTS and deterministic 6-language fallback engine. |
| **4. Exposure Explorer** | `/explorer` | Regional city comparison matrix (Delhi, Bengaluru, Mumbai, Kolkata, Chennai, Hyderabad, etc.) with CAMS resolution notes. |
| **5. Clean-Air Commute Planner** | `/commute` | Multi-modal corridor route comparison (Metro, Bus, Bike, Carpool, Car), inhalation risk ratings, and single-click sustainability logging. |
| **6. Exposure Insights Dossier** | `/insights` | Daily mean AQI, cleanest window, hours in unhealthy air (>150 AQI), live CAMS forecast trajectory, and print-ready dossier (`@media print`). |
| **7. Community Hotspot Watch** | `/community` | Interactive coordinate map, 2 MB image upload limit, MIME validation, duplicate prevention, and civic review demo workflow. |
| **8. Sustainability Tracker** | `/sustainability` | Eco-points ledger, tamper-resistant challenge progress, automatic badge unlocking, and dynamic calendar streak calculations. |
| **9. Alerts & Early Warnings** | `/notifications` | Configurable AQI threshold slider (50–300), midnight-spanning Quiet Hours (22:00–07:00), and foreground Web Notification permissions. |
| **10. User Profile & Settings** | `/preferences` | 6-language switcher, sensitivity profile selection, commute routine parameters, and saved family locations matrix. |

---

## 4. Scientific & Technical Architecture

### 1. Central Pollution Control Board (CPCB) Engine
The engine (`lib/aqi-engine.ts`) calculates individual pollutant sub-indices using the linear interpolation equation:
$$\mathrm{I}_p = \left[ \frac{\mathrm{I}_{Hi} - \mathrm{I}_{Lo}}{\mathrm{B}_{Hi} - \mathrm{B}_{Lo}} \right] \cdot (\mathrm{C}_p - \mathrm{B}_{Lo}) + \mathrm{I}_{Lo}$$
- **Data Completeness Criteria:** Enforces minimum 3 monitored pollutants with at least one particulate indicator ($\text{PM}_{2.5}$ or $\text{PM}_{10}$).
- **Unit Normalization:** Converts Carbon Monoxide ($\text{CO}$) from $\mu\text{g/m}^3$ to $\text{mg/m}^3$ prior to interpolation.
- **Concentration Capping:** Spikes beyond upper bounds cap at 500 (*Severe*).

### 2. Environmental Telemetry Pipeline
- **Primary Source:** Open-Meteo Air Quality API delivering Copernicus Atmosphere Monitoring Service (CAMS) Global forecasts.
- **Spatial Resolution Disclosure:** CAMS operates on a $0.4^\circ \times 0.4^\circ$ grid ($\sim 40\text{ km}$ across India).
- **Secondary Sensor Source:** Architecture accommodates continuous OpenAQ sensor ingestion.
- **Offline / Low-Bandwidth Fallback:** When network fails, server routes seamlessly switch to calibrated baseline demonstration datasets without 500 errors.

---

## 5. AI & Multilingual Capabilities

### 1. Six Official Indian Languages
Complete translation coverage across **168 leaf keys per language** with 0 missing keys:
- **English (`en`)**
- **Kannada (`kn`)** — Native script `[\u0C80-\u0CFF]`
- **Hindi (`hi`)** — Native script `[\u0900-\u097F]`
- **Tamil (`ta`)** — Native script `[\u0B80-\u0BFF]`
- **Bengali (`bn`)** — Native script `[\u0980-\u09FF]`
- **Marathi (`mr`)** — Native script `[\u0900-\u097F]`

### 2. Dual-Layer AI Engine
- **Cloud Layer:** Google Gemini 1.5 Flash via `/api/assistant` with strict character limits (1000 chars), per-IP rate limiting (30 req/min), and prompt grounding strictly tied to sensor telemetry.
- **Edge Layer:** Deterministic rule-based engine (`lib/assistant-engine.ts`) answering inquiries in all 6 languages if API keys are absent, quota is exceeded, or the network is offline.

### 3. Voice Interface
- **Speech-to-Text (STT):** Web Speech API with regional BCP-47 language tags (`kn-IN`, `hi-IN`, `ta-IN`, etc.).
- **Text-to-Speech (TTS):** SpeechSynthesis engine with audio cleanup, markdown stripping, and manual stop controls.

---

## 6. Suggested Live Demonstration Sequence

1. **Start on Dashboard (`/`):**
   - Demonstrate real-time geocoding search: Type `Mangaluru` or `Bengaluru`.
   - Show dominant pollutant badge and CPCB color-coded sub-index cards.
   - Point to the CAMS Model Estimate transparency badge.
2. **Navigate to My Day (`/my-day`):**
   - Walk through the schedule analysis.
   - Highlight the morning inversion warning and safe afternoon ventilation window.
3. **Navigate to Assistant (`/assistant`):**
   - Click a preset question (e.g. *"Is it suitable to go running now?"*).
   - Switch language to Kannada or Hindi using the top navigation switcher.
   - Show the assistant answering in authentic native script.
   - Click **Listen** to demonstrate text-to-speech audio playback.
4. **Navigate to Commute Planner (`/commute`):**
   - Set Origin: *"Indiranagar"*, Destination: *"Whitefield"*.
   - Point out the corridor distance estimate and $\text{CO}_2$ mitigation metrics.
   - Click **Log to Sustainability Tracker**.
5. **Navigate to Sustainability (`/sustainability`):**
   - Show the newly logged commute action appearing in the activity ledger.
   - Show how the matching challenge (Metro Mile Champions) advanced automatically.
6. **Show Offline / Print Mode:**
   - In Insights (`/insights`), click **Print / Export Report** to show the clean black-and-white dossier layout.

---

## 7. Backup Plan: Offline & Disconnected Resilience

If Wi-Fi drops or the Gemini API is blocked during the live competition demo:

| Component | Failure Mode | Automatic Built-in Resilience |
| :--- | :--- | :--- |
| **Network Loss / Offline** | Internet connection drops | Service worker (`public/sw.js`) serves cached application shell. `AppShell` displays prominent offline banner with cached timestamp disclosure. |
| **Open-Meteo API Unreachable** | External weather API timeout | Backend API route (`/api/air-quality`) automatically falls back to calibrated baseline demonstration data without crashing. |
| **Geocoding API Down** | Upstream geocoding offline | `/api/geocoding` catches network errors and falls back to curated Indian city coordinates (Mangaluru, Bengaluru, Mumbai, Delhi, etc.). |
| **Gemini API Key Missing / 429** | Gemini API quota exhausted | `/api/assistant` catches error and invokes `lib/assistant-engine.ts` deterministic rule engine in the user's selected language. |
| **Browser Audio Unsupported** | Browser lacks Web Speech | Voice buttons display graceful fallback alerts advising keyboard input. |

---

## 8. Honest Scientific & Technical Disclosures

When presenting to evaluators, maintain complete intellectual honesty:
1. **Never claim CAMS model outputs are statutory CAAQMS continuous sensor stations.** Always explain that CAMS provides atmospheric chemistry modeling at $\sim 40\text{ km}$ resolution.
2. **Never claim commute routes are turn-by-turn road navigation GPS measurements.** Disclose that distances (~8.5–26.5 km) are corridor density estimates derived deterministically from route strings.
3. **Never claim browser localStorage is a tamper-proof blockchain or server ledger.** Explain that local storage provides persistent client-side habit tracking; enterprise or municipal deployments would connect centralized relational cloud databases (e.g., PostgreSQL/Firebase).
4. **Do not claim official municipal partnership or Sameer portal integration.** Frame civic hotspot reporting as an active prototype demonstrating citizen-governance workflows.
