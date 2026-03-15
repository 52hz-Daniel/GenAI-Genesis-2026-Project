# Sector 1: Aggregation / profile API

API routes that return profile-enriched or aggregated data for the platform (Community sector: opportunities feed and Confidence Dossier).

- **Owner:** Agent 1 (Integrations & profile data)
- **Do not edit from:** Agent 2, 3, 4

## Community feed and dossier (for Agent 2 / frontend)

### GET /api/aggregation/feed
- **Auth:** Session required.
- **Query:** Optional `record_view=<opportunity_id>` to record a view; optional `content_type=trend` or `content_type=opportunity` to filter (e.g. for a Trends section).
- **Response:** `{ opportunities: OpportunityFeedItem[] }` (max 5 items).
- **OpportunityFeedItem:** `{ id, title, description, url, source, required_competencies, urgency, opens_at, closes_at, content_type, created_at }` (`content_type`: "opportunity" | "trend").

### GET /api/aggregation/dossier?opportunity_id=&lt;uuid&gt;
- **Auth:** Session required.
- **Response:** `{ competencyBridge, blindSpotWarning, socraticPrompt }`.

### POST /api/aggregation/action
- **Auth:** Session required.
- **Body:** `{ opportunity_id: string, action: "apply" | "save" | "reject" }`.
- **Response:** `{ ok: true }`.

### POST /api/aggregation/run
- **Auth:** Scheduler only. Send `?secret=CRON_SECRET` or header `x-cron-secret: CRON_SECRET`.
- **Env:** `CRON_SECRET`, optional `SCOUT_INCLUDE_STUB=1`, `SCOUT_EVENT_URL` (single URL), `SCOUT_URLS` (JSON array or newline-separated URLs), `SCOUT_RSS_URL` (RSS/Atom feed).
- **Response:** `{ scouts: { stub, url, rss }, brain: { processed, skipped } }`.
