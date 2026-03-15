# Agent 2 Requests to Other Agents

Agent 2 (UX, UI & design system) needs the following from other agents to complete the experience. Do not edit Agent 2–owned files; implement only in your sector.

---

## Request to Agent 3 (Standard tutor)

### User background at a point

**What:** Expose or add one optional step that asks for user background (e.g. major, year, target role, first-gen) at a defined moment, and persist it to the existing profile store ([lib/profile.ts](../lib/profile.ts)) so UI and analytics can use it.

**Why:** To personalize the landing or analytics segments (e.g. cohort), and so the profile page and coach have data without requiring users to open Profile first.

**Where (pick one or agree with product):**
- Optional modal or inline prompt on **first visit** (e.g. “Tell us a bit about you so we can tailor practice”).
- Or a short step **after the first completed mock interview** (“Quick profile: major, year, goal?”).
- Persist via existing `setProfile()` from [lib/profile.ts](../lib/profile.ts).

**Constraint:** Do not change tutor prompts or coach behavior unless you agree. This is only about when/where profile is collected; Agent 2 will consume profile for display and optional analytics (e.g. `logEvent` with cohort props).

**Implemented by Agent 3:** A short pre-interview questionnaire is shown in the interview flow ([components/MockInterview/MockInterview.tsx](../components/MockInterview/MockInterview.tsx)) when the user has no minimal profile (target role or improve area). Data is persisted via `setProfile()`. Agent 2 can apply layout and styling to the questionnaire and to the three-section feedback UI (Feedback | Follow-up questions | Optimized answer) in MockInterview using design tokens and shared components only; do not change the fields or submit behavior.

---

## Request to Agent 1 (Integrations & profile data)

### Community / opportunities surface

**What:** If the roadmap or marketing calls for a “community” or “opportunities” block on the landing (or a dedicated section), provide an API or data shape that returns a list of items to display.

**Suggested shape (adapt as needed):**
- `title`, `description`, `link` (URL), optional `image` or `source_display`.
- Example: from aggregation/feed or integrations, so we show “Recommended for you” or “Opportunities” cards.

**Agent 2 will:** Build the UI (cards, layout, links) that consumes this API. Agent 1 owns the API and data; Agent 2 does not edit `lib/integrations/` or `lib/aggregation/`.

### Profile enrichment

If Agent 1 adds cloud profile fields (beyond what’s in [lib/profile.ts](../lib/profile.ts)), Agent 2 will use them for:
- Display (e.g. profile page, header)
- Optional analytics (e.g. identify in PostHog, segment by cohort).

No change to Agent 1’s APIs beyond what they already expose.

---

## Agent 4 (Live interview)

No feature request. Agent 2 ensures the design system and global layout (Header, tokens) are consistent so the live-interview page feels part of the same product. Agent 4 continues to own [app/live-interview/](../app/live-interview/) and [components/LiveInterview/](../components/LiveInterview/); Agent 2 does not edit those.

---

## Summary

| Agent | Request |
|-------|--------|
| **3** | Optional profile collection step (first visit or post–first interview); persist to [lib/profile.ts](../lib/profile.ts). |
| **1** | If needed: API/data shape for opportunities or community block; Agent 2 builds the UI. |
| **4** | None; use shared design system only. |
