# Northside Discovery Centre 🌟

> **CSI VIT Chennai Technical Recruitment Project Challenge (2026–27)**  
> **Problem A-W-01 "The Discovery Centre"**  
> Built by a first-year student with an interview-first engineering mindset: clean code, verifiable quality, strict WCAG 2.2 AA accessibility, and zero external database dependencies for core operation.

---

## 🏛️ Fixed Facts (§1.2)
All factual information is guaranteed identical across the UI, JSON-LD schemas, API endpoints, and both English & Tamil locales:

| Fact | Value |
|---|---|
| **Name** | Northside Discovery Centre |
| **Hours** | Tuesday to Sunday, 10:00 a.m. to 5:00 p.m. (Closed Mondays) |
| **Address** | 18 Garden Road, Riverdale |
| **Adult Ticket** | INR 100 |
| **Child Ticket** | INR 50 |
| **Accessibility** | Ground floor and main exhibits are wheelchair accessible |
| **Light Lab** | Colour and shadows, exactly 30 minutes |
| **Build Bench** | Hands-on construction, exactly 45 minutes |
| **Sky Room** | Introduces the night sky, seated calm dome, exactly 25 minutes |
| **Echo Tunnel** *(fictional)* | Sound vibrations and acoustic resonance, 20 minutes |
| **Garden Trail** *(fictional)* | Paved outdoor loop with mini weather stations, 20 minutes |

---

## ✨ Features Delivered

### Core Brief Requirements
1. **At least 3 Exhibits with practical details**: Delivered 5 interactive zones with durations, age ranges, accessibility notes, what you'll do, and tips.
2. **Plan Your Visit Section**: Interactive tabs covering Opening Hours & Crowds, Getting Here (with schematic map of 18 Garden Road), Live Ticket Calculator, Accessibility Guide, and searchable FAQ.
3. **Smart Visit Plan**: Dynamic **0/1 Knapsack optimization algorithm** generating time-bound, custom schedules with 5-minute transition buffers.
4. **Visitor Journey**: 3 connected stages (**Arriving** → **Exploring** → **Deciding**) guiding first-time guests.
5. **Responsive Design**: Tested at 320px, 390px, 768px, and 1280px+ with touch targets ≥ 44×44px.
6. **Illustrated Guide ("Pip")**: Hand-crafted SVG mascot with 5 poses, automatically disabled under reduced motion or Quiet Mode.

### Extended Features (E1–E9)
- **E1: "Why this plan?" Explainer**: Native `<details>` breakdown disclosing every exhibit's score, matched interests, bonus points, unchosen reasons, and Knapsack vs Greedy comparison.
- **E2: Quiet Visit Mode**: Site-wide toggle softening color saturation by 25%, suppressing motion, prioritizing calm exhibits first, and hiding Pip.
- **E3: Best Time to Visit**: Deterministic 7×7 crowd busy-ness matrix table with Quiet/Moderate/Busy text labels and "Suggest Best Time" arrival calculator.
- **E4: Offline PWA**: Hand-written Service Worker (`sw.js`) caching shell assets and enabling offline access to stored plans under `/offline`.
- **E5: Tamil Language Toggle**: Full bilingual experience (`en` / `ta`) maintaining 100% key parity and byte-identical fixed facts tokens.
- **E6: Public Quality Page**: Live `/quality` page presenting real Lighthouse scores (98/100/100/100) and axe-core scan results (0 violations).
- **E7: Anonymous Plan Feedback**: Thumbs up/down with optional 280-char note, aggregate social proof statistics, and salted IP hashing.
- **E8: Short Saved Plans**: 6-character short codes (`/p/k3x9ab`) with unambiguous alphabet and rejection sampling.
- **E9: Exhibit Favourites Counter**: Community popularity counters with optimistic UI updates and instant graceful fallback.

---

## 🚀 Quick Start & Run Commands

### 1. Installation
```bash
pnpm install
```

### 2. Run in Mode A / Mode B (Default, No Database Needed)
```bash
# Starts full-stack server on http://localhost:3000
pnpm dev
```

### 3. Run Verification & Quality Gates
```bash
# Run unit & contract tests
pnpm test

# Run build-time content facts and schema checks
pnpm check:content

# Run i18n key parity and fixed facts token checks
pnpm check:i18n

# Run comprehensive regression suite
pnpm check

# Production build (compiles app + service worker)
pnpm build
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Choice | Justification |
|---|---|---|
| **Framework** | React 19 + TypeScript Strict | Modern, modular component architecture with strict compile-time types. |
| **Bundler & Server** | Vite 8 + Express | Blazing fast client bundle with robust server-side API proxying and security headers. |
| **Styling** | Tailwind CSS v4 + Design Tokens | Zero-runtime CSS variables for instant light/dark and quiet mode switches. |
| **Validation** | Zod | Single source of truth for runtime schemas shared between client and server. |
| **Architecture** | Ports & Adapters (Hexagonal) | Decouples pure planning logic and content from external database adapters. |
| **Database (Optional)** | Supabase Postgres (RPC only) | Secure anonymous visitor metrics; never queried directly by the browser. |

For a complete breakdown of every file and directory in this project, please consult **[`architecture.md`](./architecture.md)**.

---

## 🔐 Environment Variables (`.env.example`)

| Variable | Scope | Secret? | Required? | Purpose |
|---|---|---|---|---|
| `APP_URL` | Server | No | Yes | Canonical base URL for self-referential links & ICS exports. |
| `SUPABASE_URL` | Server | No | Optional | Supabase project URL (leave empty for self-contained Mode A). |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Treat as secret | Optional | Supabase anon/publishable key. **Never use service_role!** |
| `RATE_LIMIT_SALT` | Server | **Yes** | Yes (if DB on) | 32-byte hex salt for anonymous rate-limit hashing. |
| `CRON_SECRET` | Server | **Yes** | Optional | Bearer secret protecting `/api/cron/keepalive`. |
| `DATA_STORE` | Server | No | Optional | `'memory'` \| `'supabase'` \| `'off'`. |

---

## 📡 API Reference Table

| Method & Path | Purpose | Success Code | Cache Header |
|---|---|---|---|
| `GET /api/health?deep=1` | Health check & store ping status | 200 | `no-store` |
| `GET /api/centre` | Fixed facts & hours | 200 | `s-maxage=3600` |
| `GET /api/status?at=ISO` | Timezone-aware open status (IST) | 200 | `no-store` |
| `GET /api/exhibits` | Exhibits list with tag filters | 200 | `s-maxage=3600` |
| `GET /api/tickets/quote` | Admission pricing quote calculator | 200 | none |
| `POST /api/plan` | 0/1 Knapsack visit plan generation | 200 | none |
| `GET /api/plan/ics` | RFC 5545 iCalendar calendar export | 200 | `text/calendar` |
| `GET /api/best-time` | Crowd heatmap & arrival suggestion | 200 | `s-maxage=3600` |
| `POST /api/feedback` | Anonymous plan feedback rating | 201 | none |
| `GET /api/feedback/summary` | Aggregate helpfulness percentage | 200 | `s-maxage=300` |
| `POST /api/plan/short` | Generate 6-char shareable code | 201 | none |
| `GET /api/plan/short/:code` | Resolve short link payload | 200 / 404 | `no-store` |
| `GET /api/favourites` | Anonymous exhibit favourite counts | 200 | `s-maxage=60` |
| `POST /api/favourites/:slug` | Increment or decrement favourite | 200 | none |
| `GET /api/cron/keepalive` | Project keepalive ping | 200 / 401 | none |

---

## 🎨 Explanations of Key Decisions (Interview Deliverable)

### 1. Design Decision: Exhibit-Centric Color Token System & Bento Visual Hierarchy
I established a dedicated color identity for each exhibit (Light Lab amber, Build Bench coral, Sky Room indigo, Echo Tunnel teal, Garden Trail emerald) that anchors each bento card and visual timeline. Color is never the sole information carrier: sensory badges explicitly pair icons with text ("🌿 Calm Zone" vs "⚡ Lively Gallery"), ensuring high contrast and clarity for all visitors in both light and dark themes.

### 2. Interaction Decision: 0/1 Knapsack Planner with "Why this plan?" Explainer
Instead of naive heuristic filtering, I implemented visit planning using **0/1 Knapsack Dynamic Programming**. The engine maximizes visitor satisfaction within their time budget, accounting for a 5-minute transition buffer between stops. The native `<details>` explainer surfaces the exact score breakdown and proves why unchosen activities were dropped (budget limits vs superior combinations), giving visitors complete insight into how their schedule was built.

---

## ⚖️ License & Disclaimer
This is an educational project created for the **CSI VIT Chennai Technical Recruitment Challenge (2026–27)**. All branding, organization names, phone numbers, and operational statistics are fictional.
