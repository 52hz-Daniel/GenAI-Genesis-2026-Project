# Four-Agent Sector Plan: Parallel Development

This document defines **four sectors** so four Cursor Agents can work on the same repo **simultaneously without editing the same files**. Each agent gets a clear scope, file ownership, and instructions.

---

## Sector Overview

| Sector | Name | Goal | Primary deliverables |
|--------|------|------|------------------------|
| **1** | **Integrations & profile data** | Open cloud + auth systems to crowd/aggregate information by user profile and surface it on the platform | New auth providers (e.g. Microsoft, Apple), integrations (e.g. LinkedIn/calendar), aggregation APIs, profile enrichment |
| **2** | **UX, UI & design system** | Front-end design, UI, icons, brand alignment, consistent look and feel | Design tokens, shared components, icons, styling for all pages, layout/nav |
| **3** | **Standard tutor (voice-in, text-out)** | Improve the current mock interview: voice input, text output, self-improvement, learning flow | Better voice UX, tutor prompts, session flow, progress display, standard learning features |
| **4** | **Live 30‑min voice interview** | New cutting-edge flow: real-time voice conversation with the AI for ~30 minutes | Live voice ↔ AI pipeline, new route and UI, demo-ready experience (cost-agnostic for now) |

---

## File and Directory Ownership

**Rule:** Each sector **only edits files in its owned paths**. Do not modify another sector’s files. You may **import** from shared or other sectors (read-only usage).

### Sector 1 — Integrations & profile data

| Path | Purpose |
|------|--------|
| `lib/auth.ts` | Add new providers (Microsoft, Apple, etc.). Do not remove Google. |
| `lib/db-users.ts` | Extend with profile fields or new helpers if needed. Do not break existing `getOrCreateUserByEmail` / `getUserByEmail`. |
| `lib/integrations/` | **New.** External APIs (e.g. OAuth, LinkedIn, calendar). All integration logic here. |
| `lib/aggregation/` | **New.** Logic to aggregate/crowd data by user profile and build a unified context. |
| `app/api/integrations/` | **New.** API routes for connecting external services (e.g. connect LinkedIn, fetch calendar). |
| `app/api/aggregation/` or `app/api/profile/` | **New.** Routes that return aggregated/profile-enriched data for the platform. |
| `docs/schema-memory.sql` | Only if adding new tables/columns for profile or integrations. Coordinate: do not remove existing tables. |

**Do not touch:** `lib/coach-agent.ts`, `lib/prompts.ts`, `lib/openai.ts`, `lib/extract-insights.ts`, `lib/dynamic-prompt.ts`, `lib/query-user-history.ts`, any `components/` except a small “Connect account” type component in a dedicated file under `components/integrations/` if needed.

---

### Sector 2 — UX, UI & design system

| Path | Purpose |
|------|--------|
| `app/layout.tsx` | Global layout, fonts, shell. Styling and structure only; do not remove SessionProvider / ThemeProvider. |
| `app/globals.css` | Global styles, CSS variables (design tokens). |
| `app/**/page.tsx` | **Layout and styling only** for all pages (home, interview, progress, badges, translate, profile, auth). Do not change routing or core behavior of interview/tutor logic. |
| `components/Header.tsx` | Nav and header UI. |
| `components/ThemeProvider.tsx`, `components/ui/ThemeToggle.tsx` | Theming. |
| `components/ui/` | All shared UI primitives (Button, Link, Toast, Skeleton, etc.). Expand with design-system components. |
| `components/design-system/` | **New.** Design tokens (colors, spacing, typography), icon set, brand constants. Single source of truth for look and feel. |
| `components/auth/` | Sign-in UI and SessionProvider only (no auth logic changes). |
| `components/analytics/` | Consent banner and analytics UI. |
| `components/ExperienceTranslator/`, `components/BadgeCard/`, `components/BadgeExport/` | Styling and presentation only. |
| `public/` | Icons, images, brand assets. |
| `tailwind.config.*`, `postcss.config.*` | Theming and design tokens integration. |

**Do not touch:** `components/MockInterview/` (Sector 3), `components/LiveInterview/` (Sector 4), `lib/coach-agent.ts`, `lib/prompts.ts`, any API route logic. You may **use** design tokens and shared components inside MockInterview/LiveInterview by importing; do not move or rewrite their behavior.

---

### Sector 3 — Standard tutor (voice-in, text-out)

| Path | Purpose |
|------|--------|
| `lib/prompts.ts` | Interview system prompt, elite coaching rules, message building. |
| `lib/coach-agent.ts` | Tutor agent with `query_user_history` tool and reply flow. |
| `lib/openai.ts` | OpenAI client and interview/resume completion calls used by the tutor. |
| `lib/extract-insights.ts` | Loop B: extract insights from transcripts (strengths, weaknesses, framework violations). |
| `lib/dynamic-prompt.ts` | Build dynamic context (days since active, target_weakness, recent_spark). |
| `lib/query-user-history.ts` | Vector + SQL retrieval of past insights for the coach. |
| `lib/db.ts`, `lib/db-insights.ts`, `lib/db-competencies.ts`, `lib/db-sessions.ts` | DB access for sessions and insights. Do not change schema; use existing tables. |
| `lib/memory.ts`, `lib/profile.ts` | Client-side memory and profile helpers used by the tutor flow. |
| `app/interview/page.tsx` | Interview page (routing and which component it renders). |
| `components/MockInterview/MockInterview.tsx` | **Full ownership.** Voice input, text output, message list, session completion, context wiring. Improve UX and self-improvement flow here. |
| `app/api/openai/route.ts` | Interview and resume API; used by MockInterview. |
| `app/api/context/dynamic/route.ts` | Dynamic context for the tutor. |
| `app/api/session/complete/route.ts` | Session completion and Loop B trigger. |
| `app/api/extract-insights/route.ts` | Background extraction (Loop B). |
| `app/api/session-notes/route.ts` | Session notes used by current flow. |
| `app/api/jd-summarize/route.ts` | JD summarization for context. |
| `app/progress/page.tsx` | Progress page logic and data (session history, insights). |
| `app/api/progress/route.ts` | Progress API. |
| `scripts/validate-hidden-system.ts` | Validation script for hidden system (can extend for tutor-related checks). |
| `docs/VALIDATION_HIDDEN_SYSTEM.md` | Validation doc (tutor/memory). |

**Do not touch:** `app/live-interview/`, `components/LiveInterview/`, `app/api/live/` (Sector 4). Do not change `lib/auth.ts` (Sector 1). Do not change design tokens or global layout (Sector 2); you may consume them.

---

### Sector 4 — Live 30‑min voice interview

| Path | Purpose |
|------|--------|
| `app/live-interview/page.tsx` | **New.** Page for the live voice interview (e.g. 30‑minute real-time session). |
| `components/LiveInterview/` | **New.** All UI for live interview: voice activity, real-time transcript, controls. |
| `app/api/live/` | **New.** API routes for live session: e.g. streaming, WebSocket, or long-lived connection for voice ↔ AI. |
| `lib/live-*.ts` | **New.** Any lib specific to live flow: e.g. real-time voice pipeline, streaming to model, state. |

**Allowed:** Import and **call** (read-only) from `lib/coach-agent.ts`, `lib/prompts.ts`, `lib/dynamic-prompt.ts`, `lib/query-user-history.ts` to reuse coaching logic and context. Do **not** edit those files.

**Do not touch:** `components/MockInterview/`, `app/interview/page.tsx`, `app/api/openai/route.ts` (Sector 3). Do not touch Sector 1 or Sector 2 files.

---

## Shared / Contract Files

- **`lib/db.ts`** — Used by S1, S3, S4. Only S3 or S1 may add new helpers if needed; do not remove or break `getSql()`.
- **`lib/db-users.ts`** — Used by S1, S3. S1 may extend (new profile fields); S3 uses existing API. S1 must not break `getOrCreateUserByEmail` / `getUserByEmail`.
- **`app/api/auth/[...nextauth]/route.ts`** — S1 owns auth provider config (in `lib/auth.ts`); this route stays as-is unless S1 adds provider config that requires it.
- **Root `app/layout.tsx`** — S2 owns layout and styling; S1/S3/S4 do not change layout structure.

---

## Agent 1 — Integrations & profile data

**Objective:** Use open cloud and auth systems to crowd information based on user profile and expose it on the platform.

**You own:**  
`lib/auth.ts`, `lib/db-users.ts` (extend only), `lib/integrations/`, `lib/aggregation/`, `app/api/integrations/`, `app/api/aggregation/` or `app/api/profile/`, and any new schema changes for profile/integrations (in `docs/schema-memory.sql` or a new migration).

**Do not edit:**  
Any file under `lib/coach-agent.ts`, `lib/prompts.ts`, `lib/openai.ts`, `lib/extract-insights.ts`, `lib/dynamic-prompt.ts`, `lib/query-user-history.ts`, `components/MockInterview/`, `components/LiveInterview/`, `app/interview/`, `app/live-interview/`, `app/api/openai/`, `app/api/context/`, `app/api/session/`, `app/api/extract-insights/`, `app/api/live/`, or design-system / `components/ui/` (beyond a small “connect account” component if needed).

**Tasks (examples):**  
- Add Microsoft and Apple (or email magic link) to NextAuth in `lib/auth.ts`.  
- Create `lib/integrations/` with modules for external data (e.g. LinkedIn, calendar) if required.  
- Create `lib/aggregation/` to build a unified “profile context” or “crowd” view from user profile + integrations.  
- Expose `app/api/integrations/` and `app/api/aggregation/` (or `app/api/profile/`) so the rest of the app can consume profile-enriched data.  
- Extend `users` or add tables only for profile/integrations; do not remove or break existing memory tables.

---

## Agent 2 — UX, UI & design system

**Objective:** Improve user experience, front-end design, and UI; align style with icons, brand, and design.

**You own:**  
`app/layout.tsx`, `app/globals.css`, all `app/**/page.tsx` for **layout and styling only**, `components/Header.tsx`, `components/ThemeProvider.tsx`, `components/ui/`, `components/design-system/`, `components/auth/` (UI only), `components/analytics/`, `components/ExperienceTranslator/`, `components/BadgeCard/`, `components/BadgeExport/`, `public/`, `tailwind.config.*`, `postcss.config.*`.

**Do not edit:**  
`components/MockInterview/`, `components/LiveInterview/`, `lib/coach-agent.ts`, `lib/prompts.ts`, any API route implementation, or `lib/` except for adding a small design-token or theme helper in a new file under `lib/` if necessary (prefer `components/design-system/`).

**Tasks (examples):**  
- Define design tokens (colors, spacing, typography) in `components/design-system/` and use them in Tailwind and globals.  
- Align icons and brand assets in `public/` and document in the design system.  
- Add or refine shared components in `components/ui/` (buttons, cards, inputs) and use them across pages.  
- Improve layout and styling of all pages (home, interview, progress, badges, translate, profile, auth) without changing routing or tutor/live logic.  
- Ensure a single, consistent look and feel across the app.

---

## Agent 3 — Standard tutor (voice-in, text-out)

**Objective:** Improve the current approach: voice input and text output; standard learning and self-improvement.

**You own:**  
`lib/prompts.ts`, `lib/coach-agent.ts`, `lib/openai.ts`, `lib/extract-insights.ts`, `lib/dynamic-prompt.ts`, `lib/query-user-history.ts`, `lib/db.ts`, `lib/db-insights.ts`, `lib/db-competencies.ts`, `lib/db-sessions.ts`, `lib/memory.ts`, `lib/profile.ts`, `app/interview/page.tsx`, `components/MockInterview/MockInterview.tsx`, `app/api/openai/route.ts`, `app/api/context/dynamic/route.ts`, `app/api/session/complete/route.ts`, `app/api/extract-insights/route.ts`, `app/api/session-notes/route.ts`, `app/api/jd-summarize/route.ts`, `app/progress/page.tsx`, `app/api/progress/route.ts`, `scripts/validate-hidden-system.ts`, `docs/VALIDATION_HIDDEN_SYSTEM.md`.

**Do not edit:**  
`app/live-interview/`, `components/LiveInterview/`, `app/api/live/` (Sector 4); `lib/auth.ts` (Sector 1); `app/layout.tsx`, `app/globals.css`, `components/design-system/`, `components/ui/` (Sector 2). You may **import** design-system or UI components.

**Tasks (examples):**  
- Improve voice input UX (e.g. feedback, clarity, accessibility) and text output presentation in `MockInterview`.  
- Refine tutor prompts and elite frameworks in `lib/prompts.ts` and `lib/dynamic-prompt.ts`.  
- Improve session flow (start, in-session, completion) and how progress/insights are shown.  
- Strengthen self-improvement messaging and “what we learned” / “focus next time” in the UI.  
- Keep and extend validation (e.g. `validate:hidden`, validation doc) for the standard tutor and hidden system.

---

## Agent 4 — Live 30‑min voice interview

**Objective:** Implement a new, live ~30‑minute voice interview: real-time communication between user and AI. Cutting-edge, demo-ready; feasibility and impact over cost for now.

**You own:**  
`app/live-interview/page.tsx`, `components/LiveInterview/`, `app/api/live/`, and any new `lib/live-*.ts` modules.

**You may import (read-only):**  
`lib/coach-agent.ts`, `lib/prompts.ts`, `lib/dynamic-prompt.ts`, `lib/query-user-history.ts`, `lib/openai.ts`, `lib/db.ts`, `lib/db-users.ts` — to reuse coaching logic, context, and DB. Do **not** modify these files.

**Do not edit:**  
`components/MockInterview/`, `app/interview/`, `app/api/openai/route.ts`, `app/api/context/`, `app/api/session/`, `app/api/extract-insights/` (Sector 3); any Sector 1 or Sector 2 files.

**Tasks (examples):**  
- Implement real-time voice capture and playback (e.g. WebSocket or streaming) in `app/api/live/` and `lib/live-*.ts`.  
- Build the live interview UI in `components/LiveInterview/` (activity, transcript, controls).  
- Wire the live flow to the same coaching logic (prompts, dynamic context, tools) via imports, so the AI behaves like the tutor but in a live voice conversation.  
- Target a ~30‑minute session, stable and impressive for demos and investors.

---

## Coordination Summary

- **S1** and **S3** both use `lib/db-users.ts` and `lib/db.ts`: S1 extends profile/integrations; S3 does not change those extensions.  
- **S2** owns global layout and design; **S3** and **S4** use design-system and UI by import only.  
- **S3** and **S4** both use coach/prompts/context: S4 **imports** from S3’s libs and does not edit them.  
- No two sectors should be editing the **same file** at the same time. If a change is needed in a shared file, do it in a single sector (and document in this file) or sequence the work (one agent first, then the other).

Use this document as the single source of truth for “who owns what” when running four agents in parallel.
