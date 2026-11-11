# Design and Interaction Decisions — Northside Discovery Centre

*CSI VIT Chennai Technical Recruitment Project Challenge (2026–27)*  
*Problem A-W-01 "The Discovery Centre"*

---

## 1. Design Decision: Exhibit-Specific Accent System & Bento Visual Hierarchy
I chose a warm, contemporary museum aesthetic inspired by tactile science toys rather than a generic dark tech palette. Each of the five exhibits owns a dedicated accent color token (`--light-lab` amber, `--build-bench` coral, `--sky-room` indigo, `--echo-tunnel` teal, `--garden-trail` emerald) that flows consistently across its bento card, sensory tags, and generated visit timeline. Crucially, color is never the only visual cue: sensory badges explicitly pair icons with text ("🌿 Calm Zone" vs "⚡ Lively Gallery"), ensuring high accessibility under WCAG 2.2 AA in both light and dark themes. The 3-stage visitor journey (**Arriving** → **Exploring** → **Deciding**) uses clear, readable text first; the illustrated guide mascot ("Pip") is purely additive and automatically disabled under reduced motion or Quiet Mode.

---

## 2. Interaction Decision: 0/1 Knapsack Visit Planner with Explainable AI & Pure Fallback
Instead of a simple static questionnaire or naive greedy tag filter, I implemented the planner as an optimal **0/1 Knapsack problem solved via Dynamic Programming**. Activities are scored based on matched interests, family presence, and quiet preferences. When users adjust available time or interests, the schedule updates instantly in 150 milliseconds. To build visitor trust, the native `<details>` "Why this plan?" explainer surfaces the exact score breakdown for every exhibit, explains why unchosen stops were dropped (time limit vs better combinations), and proves where dynamic programming outperformed a greedy choice. If the backend API times out or the visitor is offline, the exact same pure engine executes transparently in the browser.

---

## 3. Architecture Rationale: Why Supabase is Optional, Server-Only, and RPC-Only
I restricted database usage strictly to anonymous, non-essential social features (feedback ratings, 6-character short plan links, favourite counts, and rate-limit buckets). The core website and planner rely exclusively on typed TypeScript content modules that can never suffer database downtime. The browser never connects directly to Supabase; all requests pass through server-side Express handlers using the publishable key. Direct table access is completely revoked via Row Level Security (deny-by-default), and mutations are restricted to parameterised `SECURITY DEFINER` functions with a pinned `search_path = ''`. This guarantees that if Supabase is unconfigured, paused, or down, the website degrades gracefully with zero layout shift or console errors.

---

## 4. CSP 'unsafe-inline' Trade-off & Security Stance
Our Content Security Policy restricts connections strictly to `'self'` (`connect-src 'self'`). We permit `'unsafe-inline'` for scripts and styles solely to allow the tiny, pre-paint theme and quiet mode initialization script in `<head>`, which eliminates visual theme flashing ("FOUC") on initial page loads. No third-party trackers, external fonts, or runtime CDN scripts are loaded anywhere in the app.

---

## 5. What I Would Improve Next & Known Limitations
- **Machine-Drafted Tamil**: While Tamil translations are 100% key-complete and retain language-neutral tokens (`INR 100`, `18 Garden Road, Riverdale`, `10:00`), they were machine-drafted and should be validated by a fluent human native speaker before production launch.
- **Busyness Model**: The current crowd heatmap is a deterministic fictional model based on typical museum footfall patterns (quieter on weekday mornings, peak on Sunday afternoon); integrating live sensor telemetry would be a natural next step.
- **In-Memory Serverless Limits**: On serverless platforms, in-memory rate limiting applies per instance; the database-backed token bucket provides durable multi-instance enforcement.

---

## 6. Design Decision: Observatory After Hours
The rebuilt interface is a night observatory rather than a daylight science-toy museum. Dark navy-black (`#05090C`) is the default field; brass lantern (`#F2B45C`) is the only light source that should feel warm. Display type is Fraunces with a single italic emphasis; UI type is Hanken Grotesk; Tamil uses Noto Serif/Sans. Exhibit accents map onto lantern, ember, dusk-rose, verdigris, and moss, and those tokens are the only colour the exhibit cards and timeline stars are allowed to wear. Light theme is a dawn inversion, not a generic white page. Quiet Visit Mode and `prefers-reduced-motion` collapse the sky to a still CSS chart.

---

## 7. Interaction Decision: Progressive Starfield and Planner Fallback
The WebGL starfield is lazy-loaded from `three` (`@types/three` is types-only), paused off-screen and in background tabs, and replaced by a CSS star chart when WebGL is missing, Save-Data is on, hardware concurrency is low, or motion must be reduced. It is never in the critical path for LCP. The visit planner still debounces 400 ms and calls `POST /api/plan`, but the identical pure engine runs in the browser immediately on failure or timeout so a visitor never waits more than 150 ms for a usable itinerary. Short links, calendar files, and saved plans (`ndc:plans:v1`, cap 5) remain optional layers on top of that local engine.
