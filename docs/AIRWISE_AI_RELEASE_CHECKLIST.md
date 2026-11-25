# AIRWISE AI — PRODUCTION RELEASE & VERCEL DEPLOYMENT CHECKLIST

**Project:** `AIRWISE AI` (`D:\Projects\airwise-ai`)  
**Target Environment:** Vercel Edge / Serverless Production Deployment  
**Current Git Commit:** `c0b9345e6d2c89c1bb28feb5c0d4556a661c36fd` on branch `main`  
**Execution Timestamp:** 2026-11-25T12:09:00+05:30  

---

## 1. Git Readiness Checklist

- [x] **Branch Isolation:** Working exclusively on local branch `main`. No extraneous feature branches exist.
- [x] **Commit State:** Commit `c0b9345` consolidates all 35 project files with 5,907 additions and 564 deletions.
- [x] **Remote Status:** Branch `main` is up to date with `origin/main`.
- [x] **Working Tree State:** `git status` reports `nothing to commit, working tree clean`.
- [x] **Whitespace & Formatting Integrity:** `git diff --check` passed with 0 errors or unexpected line endings.
- [x] **No Accidental Staging:** No sensitive `.env`, `.env.local`, or secret credential files are tracked or staged.

---

## 2. Environment Variable Checklist

| Variable Name | Environment | Required? | Purpose & Runtime Handling |
| :--- | :---: | :---: | :--- |
| **`GEMINI_API_KEY`** | Production (Vercel) / Local (`.env.local`) | Optional (Recommended) | Powers live Google Gemini 1.5 Flash natural-language responses. **Runtime Safety:** Evaluated strictly server-side in `app/api/assistant/route.ts`. If omitted or invalid, the app gracefully falls back to the deterministic 6-language rule engine (`lib/assistant-engine.ts`) with zero runtime crashes. |
| **`NODE_ENV`** | Production / Preview | Automated | Managed automatically by Vercel (`production`). Activates Service Worker registration in `components/layout/AppShell.tsx`. |

> [!IMPORTANT]
> **No other environment variables are required.** The Open-Meteo Air Quality API and Open-Meteo Geocoding API are open public endpoints that do not require API keys or credentials.
> Never commit actual secret keys to Git. Configure `GEMINI_API_KEY` directly within the Vercel Project Dashboard (**Settings $\rightarrow$ Environment Variables**).

---

## 3. Vercel Project Configuration

| Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | Next.js | Automatically detected by Vercel. |
| **Build Command** | `next build` | Compiles in ~660ms with Turbopack and verifies all 18 static/dynamic routes. |
| **Output Directory** | `.next` | Default Next.js production build output. |
| **Install Command** | `pnpm install` / `npm install` | Uses project lockfile. |
| **Node.js Version** | 20.x or 22.x | Compatible with Next.js 16.4.6 and TypeScript 5. |
| **Root Directory** | `./` | Root of repository. |
| **Serverless Function Region** | `bom1` (Mumbai, India) or `sin1` (Singapore) | Recommended for lowest latency to Indian municipal users. |

---

## 4. Production Build Status

- [x] **CPCB AQI Test Suite:** `npm run test:aqi` $\rightarrow$ **7 Passed, 0 Failed**.
- [x] **Comprehensive Readiness Audit:** `npm run test:audit` $\rightarrow$ **101 Passed, 0 Failed**.
- [x] **Next.js Turbopack Production Build:** `npm run build` $\rightarrow$ **Compiled in 664ms, TypeScript verified in 1.28s, 18/18 routes generated in 401ms**.
- [x] **Static / Dynamic Route Classification:**
  - Static Pre-rendered Pages (14): `/`, `/my-day`, `/assistant`, `/explorer`, `/commute`, `/insights`, `/community`, `/sustainability`, `/notifications`, `/preferences`, `/_not-found`, `/icon.png`, `/apple-icon.png`.
  - Dynamic Serverless Handlers (3): `/api/air-quality`, `/api/assistant`, `/api/geocoding`.

---

## 5. API Health & Telemetry Checks

- [x] **`/api/air-quality`:** Evaluates latitude/longitude inputs. Calls Open-Meteo with 10-minute caching (`revalidate: 600`). Falls back to calibrated baseline telemetry on network timeout.
- [x] **`/api/geocoding`:** Debounces user queries, strips diacritic accents (e.g. `Kankanādi` $\rightarrow$ `kankanadi`), prioritizes Indian locations, and falls back to curated Indian city coordinates on network error.
- [x] **`/api/assistant`:** Bounded to 1000 characters per message, restricts requests via sliding-window rate limiter (30 req/min), purges expired records when cache exceeds 500 IPs, and falls back to deterministic rule engine if API key is absent.

---

## 6. PWA & Service Worker Checks

- [x] **Manifest Declaration:** `<link rel="manifest" href="/manifest.json" />` declared in `app/layout.tsx`.
- [x] **Manifest Assets:** Declares valid name, short name, theme color (`#23272B`), and icons (`/favicon-32x32.png`, `/airwise-logo-icon.png`).
- [x] **Service Worker Registration:** Registered in production mode via `AppShell.tsx` using `navigator.serviceWorker.register('/sw.js')`.
- [x] **Caching Strategy:**
  - **Network-First with Cache Fallback:** Ensures fresh application code is served when online; serves cached shell when offline.
  - **Skip Waiting & Claim:** Automatically cleans old cache generations on activation (`airwise-static-v1`).
  - **External Telemetry Non-Caching:** Prevents stale external weather data from being permanently cached in the service worker.
- [x] **Offline Transparency:** `AppShell` renders a prominent red alert banner displaying the exact cached data timestamp during offline mode.

---

## 7. Mobile & Desktop Manual Testing Checklist

| Test Item | Mobile (375px–390px) | Tablet (768px) | Desktop (1366px–1920px) |
| :--- | :---: | :---: | :---: |
| **Responsive Navigation** | Sticky top bar + bottom sheet menu | Collapsible side menu | Persistent left sidebar |
| **Location Search Dropdown** | Full-width debounced overlay | Fluid container overlay | Centered search bar |
| **Recharts Trend Curves** | Responsive container (horizontal scroll guard) | 100% fluid width | Multi-column grid |
| **Community Hotspot Map** | Interactive coordinate scatter plot | Fluid aspect ratio | 2-column plot + card inspector |
| **Print Dossier Layout** | N/A (mobile share) | Tablet print preview | Clean black/white dossier (`@media print`) |
| **Touch Targets** | $\ge 44\text{px} \times 44\text{px}$ minimum | Verified | Mouse hover states enabled |

---

## 8. Competition Demonstration Checklist

- [x] **Demonstration Script Ready:** Review `docs/AIRWISE_AI_COMPETITION_DEMO.md` for the exact 5-minute timed script.
- [x] **Preset Locations Tested:**
  - Primary City: `Mangaluru` (Dakshina Kannada coastal corridor)
  - Secondary Metro: `Bengaluru` (Whitefield / Indiranagar transit corridor)
  - Severe Air Quality Benchmark: `Delhi` (Anand Vihar inversion model)
- [x] **Multilingual Voice Ready:**
  - English (`en`): Default international presentation.
  - Kannada (`kn`): Native script presentation (`"ಈಗ ಓಟಕ್ಕೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?"`).
  - Hindi (`hi`): Native script presentation (`"क्या अभी दौड़ना सुरक्षित है?"`).
- [x] **Tamper-Resistant Commute-to-Sustainability Flow:**
  - Route Indiranagar $\rightarrow$ Whitefield (~18.5 km corridor estimate).
  - Select Metro mode (-1.45 kg $\text{CO}_2$, +44 points).
  - Click *Log to Sustainability Tracker*.
  - Verify action appears in ledger and advances *Metro Mile Champions* challenge.
- [x] **Offline Contingency Plan:**
  - If venue Wi-Fi fails: PWA service worker serves cached shell; `/api/air-quality` seamlessly falls back to calibrated baseline demonstration data; Assistant falls back to built-in deterministic rule engine.

---

## 9. Rollback Procedure

If unexpected runtime issues occur upon Vercel deployment:

1. **Instant Vercel Rollback:**  
   In the Vercel Dashboard, navigate to **Deployments $\rightarrow$ [Select previous deployment] $\rightarrow$ Promote to Production**. Rollback occurs in <5 seconds.
2. **Local Git Rollback (if necessary):**  
   The previous stable commit is `bf40bc1` (*feat: add core pages, API routes, and design system components for Airwise AI*).
   ```bash
   # Inspect history without modifying working tree
   git log --oneline -5
   ```
3. **Emergency API Degradation:**  
   If Gemini API credentials trigger a 429 quota block, removing `GEMINI_API_KEY` from Vercel Environment Variables immediately forces the application into its deterministic rule-based engine (`lib/assistant-engine.ts`), restoring 100% availability.

---

## 10. Final Deployment Approval Checklist

- [x] 101/101 automated audit assertions passed.
- [x] 7/7 CPCB linear interpolation unit tests passed.
- [x] Zero trailing whitespace errors (`git diff --check` passed).
- [x] Zero API keys or secrets in tracked code or Git history.
- [x] Clean working tree on branch `main` (`nothing to commit, working tree clean`).
- [x] Commit `c0b9345` verified and pushed to `origin/main`.
- [x] Documentation verified and consistent:
  - `docs/PHASE_6_FINAL_RELEASE_VERIFICATION.md`
  - `docs/PHASE_7_COMPETITION_READINESS.md`
  - `docs/AIRWISE_AI_COMPETITION_DEMO.md`
  - `docs/AIRWISE_AI_RELEASE_CHECKLIST.md`
- [ ] **Awaiting user explicit approval to deploy.**
