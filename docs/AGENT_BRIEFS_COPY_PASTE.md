# Agent briefs — copy-paste into each Cursor Agent

Use **one** of the four blocks below per agent. Paste the whole block into the agent chat so it knows its sector and constraints. Full details are in [FOUR_AGENT_SECTORS.md](./FOUR_AGENT_SECTORS.md).

---

## Agent 1 — Copy this

```
I am Agent 1: Integrations & profile data.

Scope: Open cloud and auth systems to crowd information based on user profile and surface it on the platform.

I ONLY edit these paths:
- lib/auth.ts (add providers: Microsoft, Apple, etc.; do not remove Google)
- lib/db-users.ts (extend only; do not break getOrCreateUserByEmail / getUserByEmail)
- lib/integrations/ (new modules for external APIs)
- lib/aggregation/ (logic to aggregate data by user profile)
- app/api/integrations/ (routes for connecting external services)
- app/api/aggregation/ or app/api/profile/ (routes for profile-enriched data)
- docs/schema-memory.sql only if adding new tables/columns for profile or integrations

I must NOT edit: lib/coach-agent.ts, lib/prompts.ts, lib/openai.ts, lib/extract-insights.ts, lib/dynamic-prompt.ts, lib/query-user-history.ts, components/MockInterview/, components/LiveInterview/, app/interview/, app/live-interview/, app/api/openai/, app/api/context/, app/api/session/, app/api/extract-insights/, app/api/live/, components/design-system/, components/ui/ (except a small "connect account" component if needed).

Full ownership and tasks: see docs/FOUR_AGENT_SECTORS.md.
```

---

## Agent 2 — Copy this

```
I am Agent 2: UX, UI & design system.

Scope: Front-end design, UI, icons, brand alignment, consistent look and feel.

I ONLY edit these paths:
- app/layout.tsx, app/globals.css
- app/**/page.tsx for layout and styling only (no change to interview/tutor logic)
- components/Header.tsx, components/ThemeProvider.tsx, components/ui/, components/design-system/
- components/auth/, components/analytics/, components/ExperienceTranslator/, components/BadgeCard/, components/BadgeExport/
- public/, tailwind.config.*, postcss.config.*

I must NOT edit: components/MockInterview/, components/LiveInterview/, lib/coach-agent.ts, lib/prompts.ts, any API route implementation. I may import design-system into pages; I do not change tutor or live-interview behavior.

Full ownership and tasks: see docs/FOUR_AGENT_SECTORS.md.
```

---

## Agent 3 — Copy this

```
I am Agent 3: Standard tutor (voice-in, text-out).

Scope: Improve the current mock interview: voice input, text output, self-improvement, learning flow.

I ONLY edit these paths:
- lib/prompts.ts, lib/coach-agent.ts, lib/openai.ts, lib/extract-insights.ts, lib/dynamic-prompt.ts, lib/query-user-history.ts
- lib/db.ts, lib/db-insights.ts, lib/db-competencies.ts, lib/db-sessions.ts, lib/memory.ts, lib/profile.ts
- app/interview/page.tsx, components/MockInterview/MockInterview.tsx
- app/api/openai/, app/api/context/dynamic/, app/api/session/complete/, app/api/extract-insights/, app/api/session-notes/, app/api/jd-summarize/
- app/progress/page.tsx, app/api/progress/
- scripts/validate-hidden-system.ts, docs/VALIDATION_HIDDEN_SYSTEM.md

I must NOT edit: app/live-interview/, components/LiveInterview/, app/api/live/ (Sector 4); lib/auth.ts (Sector 1); app/layout.tsx, app/globals.css, components/design-system/, components/ui/ (Sector 2). I may import design-system and UI components.

Full ownership and tasks: see docs/FOUR_AGENT_SECTORS.md.
```

---

## Agent 4 — Copy this

```
I am Agent 4: Live 30‑minute voice interview.

Scope: New real-time voice conversation with the AI (~30 min). Cutting-edge, demo-ready; feasibility over cost for now.

I ONLY edit these paths:
- app/live-interview/page.tsx, components/LiveInterview/, app/api/live/, lib/live-*.ts (new files)

I may IMPORT (read-only) from: lib/coach-agent.ts, lib/prompts.ts, lib/dynamic-prompt.ts, lib/query-user-history.ts, lib/openai.ts, lib/db.ts, lib/db-users.ts. I must NOT modify those files.

I must NOT edit: components/MockInterview/, app/interview/, app/api/openai/, app/api/context/, app/api/session/, app/api/extract-insights/ (Sector 3); any Sector 1 or Sector 2 files.

Full ownership and tasks: see docs/FOUR_AGENT_SECTORS.md.
```
