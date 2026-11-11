# Northside Discovery Centre — Project Architecture & File Directory Guide

This document provides a comprehensive structural guide to the Northside Discovery Centre codebase, detailing the purpose, responsibility, and contents of each folder and file for clear organization, interview review, and effortless maintenance.

---

## 1. High-Level Architectural Principles

- **Zero-Dependency Core**: The essential site (exhibits, opening hours, ticket pricing, accessibility information, and the dynamic 0/1 Knapsack visit planner) functions with 100% fidelity without any external database, authentication service, or network connection.
- **Ports & Adapters (Hexagonal Architecture)**: Data persistence for anonymous visitor features (feedback ratings, 6-character short plan links, exhibit favourite counters) is abstracted behind a clean interface layer (`src/store/types.ts`). Swappable adapters exist for in-memory (`src/store/memory.ts`), Supabase Postgres RPC (`src/store/supabase.ts`), and disabled/graceful degradation (`src/store/off.ts`).
- **Server-Only Database Safety**: The browser never connects to Supabase or any third-party backend. All data interactions are mediated by server-side Express route handlers over HTTPS with strict input validation and row-level security.
- **Client-Side Graceful Fallback**: If an API call fails or times out, the browser transparently executes the identical pure TypeScript planner engine locally (`src/lib/plan-engine.ts`), guaranteeing that users never see broken screens.

---

## 2. Directory & File Breakdown

### Root Directory (`/`)
| File / Folder | Purpose & Summary |
|---|---|
| `architecture.md` | **This document**: Complete folder-by-folder and file-by-file structural reference guide. |
| `package.json` | Project configuration, scripts (`dev`, `build`, `lint`, `test`, `check`, `quality:report`), runtime dependencies, and devDependencies. |
| `tsconfig.json` | Strict TypeScript configuration enforcing ES2022 target, bundler module resolution, and path aliases (`@/*`). |
| `vite.config.ts` | Vite build tool configuration with React plugin, Tailwind CSS v4 integration, and alias mappings. |
| `server.ts` | **Full-Stack Express Server**: Hosts all typed REST API endpoints (`/api/*`), serves static production files or mounts Vite dev server in development, enforces CSP security headers, and handles rate limiting. |
| `index.html` | HTML entry point containing `<title>`, metadata, OpenGraph tags, PWA links, and a render-blocking no-flash script for dark theme and quiet mode. |
| `metadata.json` | Google AI Studio workspace configuration establishing application title, description, and capabilities. |
| `.env.example` | Template environment variable file listing all optional configuration keys with explanatory comments and generation instructions. |
| `.env` | Local active environment variables file (defaults to self-contained Mode B with in-memory persistence). |
| `vercel.json` | Production deployment configuration for Vercel Functions in `bom1` (Mumbai), cache-control rules, and keepalive cron scheduling. |
| `README.md` | Comprehensive developer documentation covering running instructions, tech stack justifications, API tables, and operational guides. |

---

### `/src` — Frontend Application Source

#### `/src/content/` (Single Source of Truth for Content)
*All user-facing factual data is authored here in pure TypeScript modules and validated at build-time with Zod schemas.*
- `centre.ts`: Fixed facts (§1.2) for Northside Discovery Centre: name, address (`18 Garden Road, Riverdale`), weekly hours (Tue–Sun 10:00–17:00, closed Mondays), ticket pricing (Adult INR 100, Child INR 50), accessibility claim, and contact details.
- `exhibits.ts`: The 5 exhibits: **Light Lab** (30 min), **Build Bench** (45 min), **Sky Room** (25 min, calm: true), **Echo Tunnel** (20 min, loud acoustic note), and **Garden Trail** (20 min, calm: true). Includes sensory notes, what you'll do, tips, age ranges, and accent color tokens.
- `busyness.ts`: Fictional deterministic 7×7 crowd busy-ness matrix for Sunday–Saturday across 10:00–16:00 hourly slots (Monday closed/null). Tuesday 10:00 is global quiet minimum (18/100); Sunday 12:00–14:00 is peak (92/100).
- `faq.ts`: 9 practical visitor questions and answers (hours, ticket booking, strollers, rain plan, quiet hours, outside food, photography, etc.) in English and Tamil.
- `journey.ts`: The 3-stage visitor journey (**Arriving** → **Exploring** → **Deciding**) with concise descriptions (≤ 40 words) and Pip guide character lines (≤ 12 words).
- `quality-report.generated.json`: Generated JSON snapshot recording Lighthouse scores (98/100/100/100), axe accessibility violations (0), test run counts, and coverage.

#### `/src/lib/` (Pure Business Logic & Calculations)
*Pure modules with zero UI, React, or DOM dependencies. Enforces deterministic math and shared schemas.*
- `schemas.ts`: Shared Zod validation schemas for centre facts, exhibits, FAQs, busyness, `PlanInputSchema`, `FeedbackInputSchema`, and short plan payloads.
- `status.ts`: Timezone-safe computation of current opening status in `Asia/Kolkata` time. Correctly calculates open/closed states, next opening timestamps, and boundary conditions (09:59:59 closed, 16:59:59 open, 17:00:00 closed).
- `pricing.ts`: Admission ticket quotation function (`quote(adults, children)`) with group size bounds (1–20 visitors) and adult accompaniment rules.
- `plan-engine.ts`: **0/1 Knapsack Dynamic Programming visit planning engine**. Scores exhibits based on interests (10 pts), family bonus (2 pts), and quiet bonus (4 pts). Arranges timeline chronologically, prioritizes calm spaces first when quiet mode is enabled, trims stops exceeding 17:00 closing, and compiles complete explainability metrics (`PlanExplain`).
- `busyness.ts`: Heatmap generators and `bestArrival()` algorithm identifying lowest-crowd arrival windows.
- `ics.ts`: RFC 5545 iCalendar (`.ics`) file generator featuring `VTIMEZONE` (`Asia/Kolkata`), CRLF line endings, and 75-octet line folding.
- `share.ts`: Canonical plan URL query codec (`encodePlanInput` / `decodePlanInput`) ensuring deterministic parameter order and defaults omission.
- `plan-hash.ts`: Produces a 16-hex character SHA-256 hash of canonical plan inputs for anonymous feedback linkage.
- `short-code.ts`: 6-character unambiguous short code generator using rejection sampling over byte range [0, 247] to eliminate modulo bias.
- `rate-limit.ts`: Sliding-window in-memory token bucket rate limiters for API endpoints (plan generation, feedback, short links, favourites).
- `respond.ts`: Uniform JSON success and error response formatter conforming to `{ error: { code, message, details? } }`.

#### `/src/i18n/` (Internationalization Layer)
- `config.ts`: Supported locale definitions (`'en'` and `'ta'`) and default locale settings.
- `t.ts`: Type-safe translator factory with dynamic `{param}` placeholder interpolation and fallback to English.
- `dictionaries/en.ts`: Complete English dictionary for all UI text, headings, buttons, explainer tables, and structured warnings.
- `dictionaries/ta.ts`: Complete Tamil dictionary maintaining 100% key parity with English and preserving language-neutral fixed facts byte-identically.

#### `/src/store/` (Data Store Layer — Ports & Adapters)
- `types.ts`: TypeScript interfaces for `FeedbackStore`, `ShortPlanStore`, `FavouriteStore`, `StoreRateLimiter`, and unified `DataStore`.
- `errors.ts`: Custom error classes: `StoreError`, `StoreUnavailable`, and `RateLimited`.
- `memory.ts`: In-memory store adapter (Mode B) used for local development, offline runs, and unit tests without external databases.
- `off.ts`: Graceful degradation adapter (Mode A) when database features are disabled; ensures core pages and planner never throw errors.
- `supabase.ts`: Supabase Postgres RPC client adapter (Mode C) utilizing 1500ms abort timeouts, safe error mapping, and anon/publishable credentials.
- `index.ts`: Store factory resolving active store mode (`auto`, `supabase`, `memory`, `off`) and generating salted anonymous visitor key hashes (`sha256(ip + salt + date)`).

#### `/src/frontend/` (Frontend Components & Dedicated Pages)
*All UI rendering code and React presentation modules are organized cleanly within this dedicated directory.*
- `components/ui/Primitives.tsx`: Accessible primitives: `Button` (touch target ≥ 44×44px), selectable `Chip`, `Card`, `Stepper` number counter, `SectionHeading`, and live `StatusPill`.
- `components/illustrations/ExhibitsSvg.tsx`: Hand-crafted inline SVG graphics for the building exterior, Light Lab prism, Build Bench gears, Sky Room observatory, Echo Tunnel acoustic waves, Garden Trail path, and Riverdale schematic map.
- `components/guide/Guide.tsx`: Animated stick-figure guide ("Pip") with 5 poses (`wave`, `walk`, `point`, `think`, `celebrate`), speech bubble, and automatic suppression in Quiet Mode.
- `components/planner/PlanComponents.tsx`: Visual timeline display, stop cards, calendar download buttons, native `<details>` "Why this plan?" explainer disclosure, and anonymous feedback widget.
- `components/planner/PlannerIsland.tsx`: Interactive visit planner form, segmented duration buttons, interest chips, party steppers, quiet toggle, debounced API caller with instant pure-engine fallback.
- `components/sections/HeroAndJourney.tsx`: Homepage Hero section with prominent key-facts strip and connected 3-stage visitor journey timeline.
- `components/sections/ExhibitsBentoSection.tsx`: Bento grid of 5 exhibit cards with duration chips, sensory badges ("Calm" / "Lively"), interest filters, and interactive favourite toggles.
- `components/sections/BestTimeAndVisit.tsx`: 6×7 crowd busy-ness heatmap table and accessible tabbed visitor practical information (Hours, Getting Here, Ticket Calculator, Accessibility, FAQ accordion).
- `components/sections/SocialProofAndModal.tsx`: Aggregate feedback percentage badge ("N% of visitors found their plan useful"), public quality strip, and focus-trapped exhibit quick-view modal dialog.
- `components/layout/HeaderAndFooter.tsx`: Translucent sticky header with logo, navigation links, preferences cluster (Theme, Quiet Mode, Language, Pip Guide), mobile drawer dialog, and rich footer.
- `pages/InfoPages.tsx`: Houses standalone view components:
  - `AccessibilityPage`: Detailed facilities, wheelchair dimensions, and sensory guidelines.
  - `PrivacyPage`: Plain-language privacy constitution (no cookies, zero trackers, salted rate-limit hashing).
  - `QualityPage`: Public test results, Lighthouse scores, axe-core scans, and reproduction instructions.
  - `OfflinePage`: Offline itinerary viewer rendering stored plans from `localStorage` (`ndc:plans:v1`).
  - `PlanDetailPage`: Shareable URL landing view supporting both direct parameters (`/plan?time=...`) and 6-char short codes (`/p/:code`).
  - `ExhibitDetailPage`: Dedicated full-page exhibit showcase (`/exhibits/:slug`) with bespoke SVG illustrations, sensory notes, tips, and direct-to-plan actions.

#### `/src/components/` & `/src/pages/` (Backward-Compatibility Forwarding Layer)
- Light re-export wrappers forwarding all exports to `src/frontend/components/` and `src/frontend/pages/` to ensure zero broken imports across any legacy references or external test runners.

---

### `/public` — Static & PWA Assets
- `manifest.json`: Web App Manifest defining standalone display, brand colors, and adaptive maskable SVG icons.
- `sw.template.js`: Hand-written Service Worker template with precaching for shell assets, cache-first static strategy, and network-first navigation strategy with 3-second timeout.
- `sw.js`: Compiled production service worker with stamped `__BUILD_ID__`.

---

### `/scripts` — Build, Verification & Quality Tooling
- `check-content.ts`: Validates all factual content against Zod schemas, verifying exhibit counts, durations, and busyness bounds.
- `check-i18n.ts`: Verifies complete key parity and parameter matching between English and Tamil dictionaries.
- `build-sw.ts`: Injects git commit SHA / build timestamp into `public/sw.js`.
- `collect-quality.ts`: Assembles test and audit metrics into `quality-report.generated.json`.
- `smoke-api.sh`: Bash script executing curl checks against every API route to ensure correct HTTP response codes.

---

### `/supabase` — Database Schema & Migrations
- `migrations/0001_tables.sql`: DDL creating `plan_feedback`, `short_plans`, `exhibit_favourites`, and `rate_limits` tables.
- `migrations/0002_rls_and_grants.sql`: Enables Row Level Security on all tables and executes blanket `REVOKE ALL` to establish deny-by-default.
- `migrations/0003_functions.sql`: Declares 8 `SECURITY DEFINER` RPC functions with pinned `search_path = ''` for secure anonymous visitor interactions (`take_token`, `submit_feedback`, `feedback_summary`, `create_short_plan`, `get_short_plan`, `favourite_adjust`, `favourite_counts`, `ping`).

---

### `/tests` — Automated Test Suite
- `unit/content-facts.test.ts`: Asserts §1.2 fixed facts (address, hours, pricing, exhibit durations, calm attributes) and schema validity.
- `unit/core-logic.test.ts`: Verifies status boundary conditions, timezone safety in IST, ticket calculation quotes, 0/1 knapsack optimality over greedy, determinism, ICS compliance, best arrival calculations, and short code rejection sampling.
- `unit/store-contract.test.ts`: Validates contract compliance for both Memory and Off store adapters, guaranteeing graceful degradation when the database is offline.

---

### `/docs` — System Architecture & Interview Documentation
- `DECISIONS.md`: Explains one key visual design decision (bento grid + exhibit color system) and one interaction decision (0/1 knapsack planner with instant updates and explainer), plus the Supabase architecture rationale.
- `DATA-MODEL.md`: ER diagram, schema constraints, RLS permissions, and complete failure degradation matrix.
- `OPERATIONS.md`: Production runbook for migrations, secret rotation, project pausing recovery, and database feature toggling.
- `i18n-review.md`: Complete audit table of Tamil strings and notice of machine-drafted status pending fluent human review.
