# Project Agent Guidelines (Pelvic Health Tracking PWA)

## Dev Server & Browser Testing Port
- **User Port (5173)**: The user keeps their primary active development server running on port `5173` (`http://localhost:5173/`).
- **AI / Agent Port (5174)**: Automated agents, subagents, and browser tests MUST NEVER test or connect to port `5173`.
- **Target URL**: Always connect to or test against port `5174`: `http://localhost:5174/`.
- **Launching Port 5174**: If port 5174 is not running, launch it as a background daemon process using:
  `npm run dev -- --port 5174` (with `IsDaemon: true`).
- **Browser Testing with Chrome DevTools MCP**:
  - Automated browser verification, UI testing, and DOM inspection MUST prefer `chrome-devtools-mcp` tools (`navigate_page`, `resize_page`, `evaluate_script`, `click`, `take_screenshot`, `list_console_messages`, etc.).
  - Standard agent verification workflow:
    1. Verify port 5174 is running (launch daemon `npm run dev -- --port 5174` with `IsDaemon: true` if needed).
    2. Navigate using `chrome-devtools-mcp:navigate_page` to `http://localhost:5174/`.
    3. Check console hygiene via `chrome-devtools-mcp:list_console_messages` (zero unhandled exceptions or React crashes).
    4. Test viewports via `chrome-devtools-mcp:resize_page` (mobile: `width: 375, height: 667` vs desktop: `width: 1280, height: 800`).
    5. Inspect state and interactions via `evaluate_script`, click actions, and `take_screenshot`.

## HIPAA-by-Design & Zero-Telemetry Privacy Architecture
- **Strictly Local-First & Zero-Cloud:**
  - **No Remote Servers or APIs:** The application MUST NEVER make outbound network calls, telemetry requests, analytics pings (no Google Analytics, Mixpanel, Sentry, etc.), or external database syncs.
  - **Offline Isolation:** All patient data resides exclusively within the browser's sandboxed **IndexedDB** on the patient's local device.
  - **No Third-Party CDNs:** All fonts, icons (`lucide-react`), scripts, and styles must be bundled locally into the build. Zero external asset fetches.
  - **Patient Data Sovereignty:** PHI (Protected Health Information) only leaves the device when the patient explicitly initiates an action: printing a PDF, downloading a file, or copying a Markdown note to provide to their physical therapist.
  - **In-App Privacy Notice:** The UI must display a clear, reassuring badge/modal indicating: *"Your health data is stored strictly on this device. No data is ever sent to the cloud or third parties."*

## Project Architecture & Tech Stack
- **Stack:** React 19 + TypeScript + Vite + PWA (`vite-plugin-pwa`).
- **State Management:** Zustand, split into modular domain slices (`sexualLogSlice`, `urinaryLogSlice`, `bowelLogSlice`, `notesSlice`, `settingsSlice`, `exportSlice`). Use targeted selectors (e.g. `useLogStore((s) => s.sexualEntries)`) to prevent unnecessary re-renders.
- **Data Persistence:** Local **IndexedDB** (via `idb`) with automatic schema migration, fallback, and patient-controlled JSON backup/restore.
- **Reporting & Document Generation (Mandatory Clinical Formats):**
  - **Printable Clinical View (`@media print`):** Clean, high-contrast, paper-optimized clinical layout formatted specifically for medical providers to read or physical therapists to file.
  - **Direct PDF Generation:** Browser-triggered high-fidelity PDF export ready to email or print off for the PT.
  - **Self-Contained HTML Export:** Single-file styled `.html` export that opens in any browser offline.
  - **Markdown (`.md`) Export:** Clean Markdown tables and clinical summaries formatted for easy copy-pasting directly into EHR / EMR physical therapy documentation systems.
- **Formatting & Build:** Enforce TypeScript zero-error compilation (`npm run check` or `tsc -b`).

## Three Clinical Log Modules + Clinical Notes
1. **Sexual Function & Pelvic Pain Log (IPC Sheet Standard):**
   - Timestamp (auto-stamped with inline edit/backdating control)
   - Activity: M (masturbation), PVI (penile-vaginal intercourse), PAI (penile-anal intercourse), Other
   - Position & Duration (minutes)
   - Pain Scale (0–10 NRS): Before, During, and After
   - Erection (0–100%) & Pleasure (0–100%)
   - Ejaculation: Normal (N), Early (E), Delayed (D), Absent (A), Painful (P)
   - Entry-specific Clinical Notes / Symptom details
2. **Urinary / Bladder Diary (Pelvic Health Standard):**
   - Timestamp & Fluid Intake (amount + fluid type: water, caffeine, alcohol, carbonated)
   - Void volume (mL or Small/Med/Large) & Stream characteristics (normal, hesitant, straining)
   - Urgency Level (0–3 scale: None, Mild, Moderate, Severe)
   - Incontinence / Leakage (type: stress, urge; amount: drops, moderate, soaked; activity at leak)
   - Pad usage (dry, damp, wet, replaced)
   - Entry-specific Bladder Notes
3. **Defecation / Bowel Diary (Pelvic Health Standard):**
   - Timestamp & Bristol Stool Form Scale (Types 1 to 7 with interactive pictorial cards)
   - Straining Level (0–10 or None / Mild / Moderate / Severe)
   - Evacuation Completeness (Complete vs Incomplete sensation/tenesmus)
   - Urgency & Accidental Bowel Leakage (soiling / gas / fecal incontinence)
   - Pain/Discomfort (0–10 NRS): Before, During, and After
   - Postural / Splinting assistance (Squatty Potty / manual perineal splinting)
   - Entry-specific Bowel Notes
4. **Dedicated Patient / Provider Notes Section:**
   - Standalone general notes feed for patient journaling, trigger tracking (diet, stress, flare-ups, pelvic floor exercises/HEP compliance), and questions to ask the physical therapist during the next visit.

## Anti-God-File & Modular Architecture Protocol
- **Hard Line Ceiling (400–500 Lines):** No component or custom hook file should exceed 400 lines (500 absolute maximum for dense forms or print templates). If a file approaches 400 lines, decompose it into sub-components, sub-hooks, or utility modules.
- **Orchestrator Role for Modals & Views:** Screen and modal components (`*View.tsx`, `*Modal.tsx`) act strictly as orchestrators:
  - **Headers & Navigation:** Extracted to `LogHeader.tsx` or `LogToolbar.tsx`.
  - **Log Entry Forms:** Split per log category into discrete sub-components (`PainRatingGroup.tsx`, `DurationPicker.tsx`, `BristolStoolPicker.tsx`, `NotesField.tsx`).
  - **Data Tables & Feed Cards:** Tables (`*Table.tsx`), cards (`*EntryCard.tsx`), and row items (`*Row.tsx`) must be separated.
  - **Export Modals & Renderers:** Export preview dialogs separated into preview drawer, options panel, and individual format generators (`PdfReportView.tsx`, `HtmlExportView.tsx`, `MarkdownExportView.tsx`).
- **Hook Decomposition by Concern:**
  - **Storage Hooks (`useLogStorage.ts`):** IndexedDB initialization, transactional reads/writes, migration logic.
  - **Operation Hooks (`useLogOperations.ts`, `useExportOperations.ts`):** CRUD operations, date-range filtering, and clinical summary metrics (averages, frequencies).
  - **Orchestrator Hooks (`useLogManager.ts`):** Holds active filters/view state and returns cohesive UI callbacks.
- **Pure Helpers & Static Data Separation:** Never define static medical reference scales inline (e.g., Bristol Stool Chart types 1–7, NRS pain scales, ejaculation codes, urinary incontinence types). Extract them to `src/data/clinicalScales.ts` and `src/utils/logFormatters.ts`.
- **No Inline Functional Components:** Never declare inner functional components inside another component. Every sub-component must be an exported component in its own file.
- **3-Stage Feature Construction:**
  1. *Stage 1 (Types & Clinical Schemas):* Define interfaces in `src/types/` and pure math/formatters in `src/utils/`.
  2. *Stage 2 (Sub-Components & UI Controls):* Build form controls, score pickers, cards, and print row items.
  3. *Stage 3 (Orchestrator):* Wire together in the parent screen/modal with Zustand state.
- **Zustand Selector Hygiene:** NEVER call `const state = useLogStore()` inside a rendering component. Always bind to targeted leaf properties (e.g. `useLogStore((s) => s.entries[id])`).

## Data Serialization Invariants (Zero / False / Missing-Data Protocol)
- **Clinical Significance of Zero (0) & False:**
  - In pelvic health symptom tracking, `0` pain is a critical clinical outcome, NOT empty/falsy data. `0%` erection or `0` leaks are valid data points.
  - **NEVER** use `val || defaultVal` when `0` or `false` is valid. Always use nullish coalescing `??` or explicit `typeof val === 'number'`.
- **Explicit Serialization:** Do not omit default numbers or booleans when saving entries to IndexedDB.
- **Defensive Storage Coding:** Wrap all IndexedDB and file export operations in `try/catch`. Catch blocks MUST include bracketed tags (e.g., `console.error('[StorageService] Failed to persist log...', e)`).

## UI/UX & Clinical Ergonomics
- **Sensory & Clinical Aesthetic:** Clean, calming, gender-neutral, modern clinical design with high legibility and soft contrast (gentle sage, slate, and warm neutral tones).
- **Privacy Mode (Discretion Toggle):** An accessible quick-toggle button to mask/blur sensitive entries on-screen when entering logs in public or shared spaces.
- **Instant Timestamping & Time Adjustment:** One-tap entry creation stamped with `new Date()`, with an immediate date-time adjustment control to backdate or fine-tune.
- **Design Tokens & CSS Variables:** 1 companion CSS file per major module using semantic CSS variables (`--bg-primary`, `--card-surface`, `--text-primary`, `--accent-clinical`, `--pain-scale-0` through `--pain-scale-10`).
- **Icons & Accessibility:** Use `lucide-react`. All icon buttons require `aria-label`. Touch targets must meet 48x48px minimum for easy mobile logging.
- **Standardized Number Controls:** Use dedicated stepped spinners or slider controls (`NumberSpinner.tsx`, `ClinicalSlider.tsx`) rather than raw unchecked inputs.

## Session Hygiene & Agent Modes
- **Default Daily Driver:** Gemini 3.8 Flash (Medium Thinking) for all development tasks.
- **Builder Mode:** Apply targeted edits, run static verification (`npm run check`), and output QA test instructions.
- **QA / Tester Mode:** Launch port 5174 daemon, verify using `chrome-devtools-mcp`, check console hygiene, and test mobile viewports.
