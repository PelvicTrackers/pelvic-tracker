# Pelvic Health Tracker PWA

A zero-telemetry, local-first Progressive Web App (PWA) designed for tracking pelvic floor health, symptom patterns, and physical therapy outcomes with clinical rigor and absolute privacy.

[![Deploy to GitHub Pages](https://github.com/PelvicTrackers/pelvic-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/PelvicTrackers/pelvic-tracker/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Privacy-Zero%20Telemetry-2B7A68.svg)](#privacy--security-architecture)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-blue.svg)](#installation--pwa)

**Live Web App:** [https://pelvictrackers.github.io/pelvic-tracker/](https://pelvictrackers.github.io/pelvic-tracker/)

---

## Key Features

### 1. Sexual Function & Pelvic Pain Diary (IPC Standard)
- **Activity Classification:** Masturbation, Penile-Vaginal Intercourse (PVI), Penile-Anal Intercourse (PAI), and Other.
- **Comprehensive Pain Scale:** 0–10 NRS tracking Before, During, and After activity.
- **Efficacy Metrics:** Erection quality (0–100%) and pleasure rating (0–100%).
- **Ejaculation & Symptom Qualifiers:** Normal, Early, Delayed, Absent, or Painful ejaculation tracking.
- **Custom Clinical Prompts:** Track triggers, positions, and physical therapy observations.

### 2. Urinary & Bladder Diary (Pelvic Health Standard)
- **Intake Logging:** Fluid volume (mL) and categories (Water, Caffeine, Alcohol, Carbonated).
- **Voiding Tracking:** Void volume (mL or Small / Medium / Large) and stream dynamics (Normal, Hesitant, Straining).
- **Urgency & Leakage:** 4-level urgency scale (0–3), leakage triggers (Stress vs. Urge), leak volume, and pad status (Dry, Damp, Wet, Replaced).
- **3-Day Bladder Diary View:** Automated day-by-day clinical aggregation displaying total 24h intake, diurnal/nocturnal void frequencies, and volume breakdowns.

### 3. Bowel & Defecation Diary (Bristol Stool Scale)
- **Bristol Stool Form Scale:** Interactive pictorial cards for Types 1 through 7 with clinical descriptions.
- **Evacuation Sensation:** Complete vs. Incomplete evacuation / tenesmus.
- **Straining & Pain:** 0–10 straining rating and before/during/after discomfort scores.
- **Accidental Bowel Leakage:** Soiling, gas, and fecal incontinence tracking.
- **Postural & Assistive Aids:** Squatty Potty and manual perineal splinting usage flags.

### 4. Custom Forms & Practice Metric Builder
- **Dynamic Form Builder:** Construct custom physical therapy forms tailored to specific patient protocols.
- **Form Sharing:** Export and import form configurations via encrypted sharing URLs or JSON schemas.
- **Dedicated Notes & HEP Journal:** Log home exercise program (HEP) compliance, stress triggers, and questions for your healthcare provider.

### 5. Multi-Format Clinical Reporting & EMR Export
- **Printable Clinical View (`@media print`):** Clean, high-contrast, paper-optimized clinical report ready to hand to a physical therapist or urologist.
- **Direct PDF Export:** High-fidelity document generation directly from the browser.
- **Offline Self-Contained HTML Export:** Styled, standalone `.html` bundle viewable on any device without internet.
- **EHR / EMR Markdown Export:** Clean Markdown tables formatted for instant copy-pasting into electronic medical record systems.
- **Encrypted Local Backup & Restore:** Complete JSON export and restoration for total patient data sovereignty.

---

## Privacy & Security Architecture

This application was engineered around a **HIPAA-by-Design, Zero-Cloud, Zero-Telemetry** standard:

- **100% Local-First:** All Protected Health Information (PHI) is stored exclusively within your browser's sandboxed **IndexedDB** on your physical device.
- **Zero External Tracking:** No Google Analytics, no telemetry pings, no cloud databases, and no remote trackers.
- **No Third-Party CDNs:** All icons, styles, fonts, and assets are bundled locally into the build.
- **Discretion / Privacy Mode:** A one-tap toggle on the navigation bar to immediately blur sensitive numbers, ratings, and notes when logging in public environments.

---

## Installation & PWA

Install this application directly onto your home screen or desktop:

- **iOS (Safari):** Open [https://pelvictrackers.github.io/pelvic-tracker/](https://pelvictrackers.github.io/pelvic-tracker/) $\rightarrow$ Tap the **Share** button $\rightarrow$ Select **"Add to Home Screen"**.
- **Android (Chrome):** Open the site $\rightarrow$ Tap the **⋮ Menu** $\rightarrow$ Select **"Install app"** or **"Add to Home Screen"**.
- **Desktop (Chrome / Edge / Brave):** Click the **Install** icon in the URL address bar.

---

## Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build System:** [Vite](https://vite.dev/)
- **Offline / PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Modular Domain Slices)
- **Local Database:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Modular CSS Tokens & CSS Variables

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/PelvicTrackers/pelvic-tracker.git
cd pelvic-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript type check
npm run check

# Build production bundle
npm run build
```

---

## License

This project is licensed under the [MIT License](LICENSE).
