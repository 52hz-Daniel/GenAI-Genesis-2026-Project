# Aptitude AI: Investor & Judge Report

*Comprehensive introduction for investors and hackathon judges. Use this as the source document; the 3-minute demo script is distilled from it with focus and time limits.*

---

## Executive Summary

**Aptitude AI** is an accessible, AI-powered career companion for university students. It addresses a critical gap: students graduate without the soft skills employers demand, while campus career centers are overwhelmed. We meet students where they are with a friendly, judgment-free product that delivers **practice behavioral interviews**, **resume translation** (academic experiences into professional bullets), **personalized memory across sessions**, and a **community feed** with evidence-based "Confidence Dossiers" so students see why they're ready—and where to improve—before they apply.

**Mission:** Democratize career preparation and empower every student to step into the workforce with confidence. We aim to reduce anxiety and imposter syndrome and to align with **equal opportunity**—directly supporting **UN Sustainable Development Goal 4 (Quality Education)** and **SDG 8 (Decent Work and Economic Growth)**. We augment human ability instead of chasing addiction; our design is thoughtful, bold, and built for real impact.

---

## 1. Innovation and Originality

- **Framing:** We don't treat "interview prep" as a one-off chat. We frame it as a **continuous learning system**: every session feeds structured insights (strengths, weaknesses, competency evidence) into memory; the next session and the rest of the product (live voice, opportunities feed) use that memory so the experience gets better over time.
- **AI use:** (1) **Coach agent** with a `query_user_history` tool—vector search over past insights with time decay so the coach can reference and re-test on prior weaknesses. (2) **Post-session extraction** of NACE-aligned competencies (Pyramid, MECE, STAR, Quantifying Impact) with embeddings for retrieval. (3) **Confidence Dossier** per opportunity: LLM generates "why you're ready" from *their* evidence, "watch out for" blind spots, and a Socratic prompt so *they* decide. (4) **Live voice** via OpenAI Realtime (WebRTC) with the same coaching context and rapport. No generic chatbot; a tutor that remembers and adapts.
- **Originality:** Role-specific practice (optional JD summarization), proactive warm-up context stored in `user_gathered_context`, and an "anti-doomscroll" opportunities feed (deadlines, apply/save/reject, no infinite link dump). We use public/curated sources and a Central Brain–style pipeline—sustainable and respectful of boundaries.

---

## 2. Technical Complexity and Execution

**Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind. Postgres (Neon) with **pgvector** for semantic memory. NextAuth (Google; optional Azure AD, Apple). OpenAI: gpt-4o-mini (coach, resume, extraction, dossier, JD summarization), **gpt-realtime** for live voice, Whisper + TTS for non-Realtime path, **text-embedding-3-small** (1536-d) for insights and retrieval. Analytics: PostHog (consent-gated), plus server-side batch events to `analytics_events` when DB is present.

**Core systems (actually built):**

- **Episodic + semantic memory:** Completed mock interviews → `session_logs`. After completion, `extractSessionInsights()` (GPT-4o-mini) parses transcript into structured insights (competency, score, type, evidence, feedback); embeddings are generated and stored in `session_insights`. Vector index (ivfflat) + time-decay formula in `queryUserHistory()` so the coach agent can retrieve and cite past evidence.
- **Coach agent:** [lib/coach-agent.ts](../lib/coach-agent.ts) — `getInterviewReplyWithAgent()` with optional tool `query_user_history(competency_name)`. Up to three tool rounds; history formatted and injected so the model can challenge or deepen based on real past performance.
- **Dynamic context:** [lib/dynamic-prompt.ts](../lib/dynamic-prompt.ts) — `getDynamicContextForUser()`: days since active, target weakness, recent spark; plus `user_gathered_context` (warm-up) and profile (localStorage). Used by mock interview, live interview, and dossier.
- **Live voice:** [app/api/live/route.ts](../app/api/live/route.ts) — POST creates OpenAI Realtime session (ephemeral client secret); client connects via WebRTC. Instructions from `getLiveInterviewerInstructionsForRealtime()` with rapport context, dynamic context, profile, and memory. Fallback: Whisper + chat + TTS via `/api/live/turn`.
- **Resume translator:** [lib/openai.ts](../lib/openai.ts) + [lib/prompts.ts](../lib/prompts.ts) — `getResumeBullets()` with system/user prompts; NACE-aligned, ATS-friendly bullets.
- **Opportunities and dossier:** [lib/aggregation/matching.ts](../lib/aggregation/matching.ts) — `getRankedOpportunitiesForUser()`; [lib/aggregation/dossier.ts](../lib/aggregation/dossier.ts) — `buildConfidenceDossier()`: loads opportunity + user evidence (strengths/weakness from `session_insights`), calls OpenAI to produce competencyBridge, blindSpotWarning, socraticPrompt. Feed supports deadlines (opens_at, closes_at) and actions (apply/save/reject) for ranking and anti-doomscroll.
- **Auth and identity:** NextAuth sign-in → `getOrCreateUserByEmail()`; `users` table. Demo judge: cookie-based "effective user" for hackathon demos (`getEffectiveUser()`).
- **Badges:** Unlock on mock-interview completion (localStorage); BadgeCard + BadgeExport for shareable credentials.

**Schema (high level):** [docs/schema-memory.sql](schema-memory.sql) — users, session_logs, competencies, session_insights (with embedding), opportunity_staging, opportunities, user_opportunity_actions, user_gathered_context. Analytics: [docs/schema-analytics.sql](schema-analytics.sql) — analytics_events.

**Execution quality:** End-to-end flows are wired: sign-in, mock interview with voice (Whisper) and completion → extract-insights → progress and dossier use that data; live interview uses same context; translate and opportunities work with real APIs. When Postgres is unset, the app degrades gracefully (e.g. progress from localStorage, no dossier/feed from DB).

---

## 3. Product Experience and Design

- **Clarity:** First win in under 60 seconds (translate or one interview question). Clear session focus ("This session: focusing on [weakness]"). Feedback in structured cards (feedback, follow-up, optimized answer) and session notes post-interview.
- **Flow:** Seamless adoption: optional profile and warm-up → mock or live interview → completion → badge unlock; progress shows sessions and insights; opportunities show feed + "See why you're ready" → dossier → I'll apply / Save / Not for me.
- **Design:** Design system and shared UI; theme support; consent banner for analytics; demo mode and judge demo buttons for evaluators. Mobile-first, accessible patterns.
- **Value communication:** One-liner: "We don't dump links. We use your practice history to show you why you're ready, where you'll struggle, and help you decide—so you don't miss deadlines and act with confidence."

---

## 4. Impact and Practical Value

- **Societal:** Reduces barriers to personalized career coaching. First-gen and anxious achievers get judgment-free practice and verifiable digital credentials. Aligns with **SDG 4 (inclusive quality education)** and **SDG 8 (productive employment and decent work)**—equal opportunity and employability for the next generation.
- **Award alignment:** **Best AI for Community Impact** — we build a supportive, evidence-based path from anxiety to readiness and help students see their worth. **Best Education AI Hack** — we reimagine learning with AI: personalized, accessible, and engaging (memory, role-specific practice, Socratic dossiers).
- **Business:** B2C free tier for adoption; retention via personalization and deadline awareness. B2B potential: universities get a scalable tool for placement and career readiness; we use curated/public sources so the model is sustainable and compliant. Feasible (real pipeline, DB, Realtime), Desirable (students get "we remember you and help you decide"), Viable (clear path to retention and institutional contracts).

---

## 5. Feasible, Desirable, Viable (for Judges)

- **Feasible:** Hidden feedback loop (extract → embed → query); proactive context (warm-up, profile) stored and reused; one Brain-style aggregation with dossier generation; Realtime + fallback voice. All implemented and working.
- **Desirable:** Session focus visible; three-card feedback; practice tailored to goals and background; opportunities with deadlines and evidence-based dossiers; Socratic prompts so the user decides.
- **Viable:** Same data drives retention, cross-feature value, and institutional appeal; no scraping of LinkedIn/X; public APIs and curated sources; consent and minimal PII.

---

## 6. Financial and Roadmap (for Context; Re-estimate as Needed)

Marketing strategy, pricing, launch, customer acquisition, burn rate, and financial modeling are not encoded in the codebase with current figures. For the **demo script**, we avoid specific numbers unless you re-run a model. If you want to cite numbers in the video, a small **Python script** (e.g. using assumptions for CAC, conversion, and institutional deal size) can be added later to produce updated estimates; the 3-min script leaves room for a line like "scalable and sustainable economics" so you can drop in one or two headline numbers after re-estimation. Roadmap-wise: the refined roadmap (voice, JD, profile, memory, analytics) is largely implemented; next steps could be more integrations, more schools, and premium/enterprise tiers.

---

## 7. Citations

If any code was adapted from other public repositories, add a short "Adapted from [repo]" in the script or report where you reference that functionality. The codebase reviewed uses standard patterns and library usage; no direct copy-paste from another project was identified during the report preparation.
