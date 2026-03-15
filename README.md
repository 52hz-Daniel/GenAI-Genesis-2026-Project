# Aptitude AI MVP

**Aptitude AI** is an accessible, AI-powered career companion for university students. It addresses a critical gap: students graduate without the soft skills employers demand, while campus career centers are overwhelmed. The app meets students where they are with a friendly, judgment-free product that **remembers you**—so every session and every feature gets better over time.

- **Practice behavioral interviews** (text or optional voice) with an empathetic AI coach that can reference your past performance and re-test on weaknesses.
- **Translate** academic experiences into ATS-friendly, NACE-aligned resume bullets in seconds.
- **Live voice interview** powered by OpenAI Realtime for real-time conversation with the same coaching brain.
- **Opportunities feed** with deadlines and evidence-based **Confidence Dossiers**: why you’re ready (from *your* practice), where to watch out, and a Socratic prompt so *you* decide—no infinite link dump.
- **Progress & memory**: when using Postgres, completed interviews feed structured insights (competency, evidence, feedback) into a vector store so the coach and dossiers use your real history.

The app works without a database too: anonymous users get progress and badges via `localStorage`; with **Postgres + pgvector** you unlock memory, opportunities, and dossiers.

---

## Features

| Feature | Description |
|--------|--------------|
| **Experience Translator** | Paste what you did in class and get 3 ATS-friendly, NACE-aligned resume bullet options. |
| **Mock Interview** | Chat with an AI that asks behavioral questions and gives structured feedback (three-card: feedback, follow-up, optimized answer). Unlock a shareable badge when you finish. Optional voice input (Whisper). |
| **Live Voice Interview** | Real-time voice conversation via OpenAI Realtime (WebRTC); same coaching context and rapport. Fallback: Whisper + chat + TTS. |
| **Digital Badges** | View, copy, and share your badge (e.g. to LinkedIn) after completing a mock interview. |
| **Progress** | See your session history and insights; when DB is present, the coach uses vector search over past competencies with time decay. |
| **Opportunities** | Feed of opportunities with deadlines; apply / save / reject actions. “Anti-doomscroll” design. |
| **Confidence Dossier** | Per opportunity: “Why you’re ready” (from your evidence), “Watch out for” blind spots, and a Socratic prompt so you decide. Requires Postgres + memory. |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. API key (required)

1. Create a file named `.env.local` in the project root (same level as `package.json`).
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file. Restart the dev server if it is already running.
4. Do **not** commit `.env.local` to git (it is in `.gitignore`).

You can copy `.env.example` and replace the placeholder with your real key.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Optional: Postgres (memory, opportunities, dossier)

To enable long-term memory, opportunities feed, and Confidence Dossiers:

1. Create a Postgres database (e.g. [Neon](https://neon.tech)) with **pgvector** enabled.
2. Run the schema in your database:
   - Memory & core: `docs/schema-memory.sql`
   - Analytics (optional): `docs/schema-analytics.sql`
3. Add to `.env.local`:
   ```
   POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
   ```

When `POSTGRES_URL` is set, signed-in users get session storage, insight extraction, vector-backed coach history, opportunities, and dossiers. Without it, the app still works: progress and badges use `localStorage`.

### 5. Optional: Auth (Google, etc.)

For sign-in and per-user memory, configure NextAuth. See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) for environment variables and provider setup.

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Playwright E2E tests (start dev server in another terminal first) |
| `npm run validate:hidden` | Validate hidden system (e.g. coach tool, extraction) |

---

## Project structure

| Path | Purpose |
|------|--------|
| `app/` | Next.js 14 App Router: pages (home, translate, interview, live-interview, progress, badges, opportunities, profile, auth). API routes under `app/api/`. |
| `lib/` | Core logic: `coach-agent.ts`, `openai.ts`, `prompts.ts`, `dynamic-prompt.ts`, `extract-insights.ts`, `query-user-history.ts`, `db.ts` and `db-*.ts`, `live-*.ts`, `auth.ts`, `analytics.ts`, etc. |
| `lib/aggregation/` | Opportunities matching and Confidence Dossier generation. |
| `components/` | React UI: MockInterview, LiveInterview, ExperienceTranslator, BadgeCard, design system, auth, analytics consent. |
| `docs/` | Documentation and schemas. |

### Key documentation

- [docs/schema-memory.sql](docs/schema-memory.sql) — Postgres + pgvector schema (users, session_logs, session_insights, opportunities, etc.).
- [docs/schema-analytics.sql](docs/schema-analytics.sql) — Analytics events table.
- [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) — NextAuth and environment setup.
- [docs/INVESTOR_JUDGE_REPORT.md](docs/INVESTOR_JUDGE_REPORT.md) — Full product and technical overview for judges and investors.
- [docs/DEMO_VIDEO_SCRIPT_3MIN.md](docs/DEMO_VIDEO_SCRIPT_3MIN.md) — 3-minute demo script and screen-recording markers.
- [docs/PROJECT_STORY_AND_BUILT_WITH.md](docs/PROJECT_STORY_AND_BUILT_WITH.md) — “About the project” and “Built with” text for submission forms.

---

## Tech stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Auth:** NextAuth (Google; optional Azure AD, Apple).
- **Database:** Optional Postgres (Neon) with **pgvector** for semantic memory and vector search.
- **AI:** OpenAI — GPT-4o-mini (coach, resume bullets, insight extraction, dossier, JD summarization), **gpt-realtime** for live voice, Whisper + TTS for fallback, **text-embedding-3-small** for insights and retrieval.
- **Analytics:** PostHog (consent-gated); server-side batch events to `analytics_events` when DB is present.
- **Hosting:** Vercel (Node.js serverless). E2E: Playwright.

---

## Example inputs for judges (Translate)

For the **What did you do in class this week?** field, judges can paste this example:

```
In my marketing class we had to do a group project. Our team of four had to research a brand and present a campaign idea. I was responsible for the competitor analysis and I also helped put together the slides. We presented in front of the class and got feedback from the professor. It took about three weeks and we had to meet outside of class a few times to get it done.
```

This produces three professional resume bullet options.

**In the app:** On the Translate page, click **Quick demo for judges** and choose an example (e.g. “Marketing group project”) to fill the box in one click.

---

## Example inputs for judges (Mock interview)

After clicking **Start practice**, the AI asks three behavioral questions. Use these example answers (one per question) to complete the flow quickly:

**Question 1 (e.g. teamwork or difficult teammate):**
```
In a group project last semester one teammate kept missing deadlines. I set up a short weekly check in so we could align on tasks and I shared a simple shared doc with due dates. We talked about what was getting in the way and after that they turned things in on time. I learned that clear expectations and a low pressure conversation can fix a lot.
```

**Question 2 (e.g. tight deadline):**
```
We had a big assignment due in 48 hours and our group was behind. I suggested we split the work by strength and I took the part that needed the most research. I stayed up that night to get my section done so the next person could build on it. We turned it in on time and got a good grade. It showed me I work well under pressure when the team is counting on me.
```

**Question 3 (e.g. learning something new):**
```
I had to learn basic Excel for a class project and I had never used it before. I watched a few short tutorials and practiced with sample data. Within a couple of days I could do the formulas and charts we needed. I like learning by doing and asking for help when I get stuck.
```

In the app, the **Use example answer for this question** button fills the current answer; you can edit or send as is.

---

## Demo mode for judges

The app supports a **demo judge** mode (cookie-based “effective user”) so evaluators can try flows without signing in. Use the demo controls in the UI when available.
