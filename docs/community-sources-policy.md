# Community sector: sourcing policy

**We only ingest from allowed sources.** No scraping or monitoring of LinkedIn, X/Twitter, Reddit, or any login-walled or ToS-prohibited platform.

## Allowed source types

| Type | Description | How we use it |
|------|-------------|----------------|
| **stub** | Sample/curated data for dev and cold start | `SCOUT_INCLUDE_STUB=1` |
| **event_url** | Single public URL (career/event page) | `SCOUT_EVENT_URL` |
| **urls** | Multiple public URLs (career/event pages) | `SCOUT_URLS` (JSON array or newline-separated) |
| **rss** | Public RSS feeds (blogs, newsletters, job feeds) | `SCOUT_RSS_URL`; RSS scout |
| **api** | Public job/event APIs that permit programmatic access | Future: dedicated API scouts |
| **curated** | Manual or CSV ingest; curated deadline calendar | Future: admin or batch import |

All URL-based scouts **fetch only** (no login). We respect robots.txt. Browser automation (e.g. OpenClaw) is used **only** for a curated list of **public** URLs we are allowed to fetch, never for social platforms.

## What we do not use

- LinkedIn, X/Twitter, Reddit, or other ToS-restricted or login-required social platforms.
- Any source that requires authentication or violates the provider's terms of service.
