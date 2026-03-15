# Hackathon Submission: About the Project & Built With

Use the sections below for the **About the project** and **Built with** form fields.

---

## About the project

**What inspired you**

We were inspired by a clear gap: students leave university without the soft skills employers expect—behavioral storytelling, STAR structure, quantifying impact—while career centers are stretched thin. First-gen and anxious achievers often have the least access to personalized coaching. We wanted to build an AI career companion that meets students where they are: judgment-free, accessible, and designed so that **every session makes the next one better**. Our mission aligns with equal opportunity and with UN Sustainable Development Goal 4 (Quality Education) and SDG 8 (Decent Work and Economic Growth).

**What you learned**

We learned that treating “interview prep” as a one-off chat is a dead end. The real leverage is a **continuous learning system**: after each mock interview we extract NACE-aligned competencies (e.g. Pyramid, MECE, STAR, Quantifying Impact), embed evidence in a vector store, and let the coach agent query that history with time decay so it can say “last time you struggled with numbers—let’s practice that again.” We also learned that matching students to opportunities works better when we show *why* they’re ready (and where to watch out) using *their* evidence—Confidence Dossiers—instead of dumping links. Users decide; we inform.

**How you built your project**

We built a full-stack web app: **Next.js 14** (App Router), **React 18**, **TypeScript**, and **Tailwind** on the front end; **Postgres (Neon)** with **pgvector** for episodic and semantic memory. After each completed mock interview we run an extraction pipeline (GPT-4o-mini) to get structured insights and embeddings; these feed into a coach agent with a `query_user_history` tool so replies are personalized. We added **OpenAI Realtime** (WebRTC) for live voice interviews using the same context, with a Whisper + TTS fallback. Resume translation turns academic experiences into ATS-friendly bullets. An aggregation pipeline (staging → Central Brain) produces opportunities; we rank by user-vector similarity and generate per-opportunity dossiers. Auth is **NextAuth** (Google; optional Azure AD, Apple). We use **PostHog** for consent-gated analytics and store batch events in our DB when present. Graceful degradation: without Postgres, progress and notes still work from localStorage.

**Challenges you faced**

- **Unifying identity across routes:** Supporting both signed-in users and hackathon judges (no login) required a single notion of “effective user” (session or demo cookie) and wiring it through every protected API so Live Interview, Progress, and Community work the same in demo mode.
- **Realtime + context:** Keeping the live voice interviewer in sync with the user’s profile, practice history, and rapport required careful design of the Realtime instructions and server-side context assembly (dynamic context, gathered context, memory).
- **Making “why you’re ready” evidence-based:** Building Confidence Dossiers that cite the user’s own strengths and weaknesses from `session_insights` (instead of generic advice) meant tying the dossier LLM call to retrieved evidence and structuring prompts so the model stays grounded.

When querying user history we apply a time-decay so recent insights matter more than old ones—e.g. weighting by something like \( w(t) = e^{-\lambda t} \) where \( t \) is time since the insight, so the coach prioritizes recent gaps and wins.

---

## Built with

**What languages, frameworks, platforms, cloud services, databases, APIs, or other technologies did you use?**

A. TypeScript and JavaScript, B. Next.js 14 (App Router), C. React 18, D. Tailwind CSS, E. Postgres (Neon serverless), F. pgvector for vector embeddings and similarity search, G. NextAuth (Google; optional Azure AD and Apple), H. OpenAI API (gpt-4o-mini for coach, resume, extraction, and dossiers; gpt-realtime for live voice; Whisper for transcription; TTS for speech; text-embedding-3-small for embeddings), I. WebRTC for real-time voice, J. PostHog for analytics, K. Vercel for hosting and deployment, L. Playwright for end-to-end tests, M. ESLint for linting, N. Node.js and npm.
