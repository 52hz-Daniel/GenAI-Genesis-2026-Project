# Aptitude AI: Project Story & Built With

Use the sections below for hackathon submission fields (e.g. "About the project" and "Built with").

---

## About the project

**What inspired you**

Students are graduating without the soft skills employers demand, while career centers are overwhelmed. First-generation and anxious achievers often have the least access to personalized coaching. We were inspired to build a **career companion that remembers you**—not a one-off chatbot, but a continuous learning system. We wanted to align with **UN Sustainable Development Goal 4 (Quality Education)** and **SDG 8 (Decent Work and Economic Growth)** by democratizing career preparation and reducing anxiety and imposter syndrome.

**What you learned**

We learned how to design a **memory-augmented AI product**. Retrieval uses a time-decay so recent evidence weighs more—e.g. relevance can be combined with something like \( w(t) = e^{-\lambda (t_{\text{now}} - t)} \) so older insights contribute less: episodic storage (session logs), semantic extraction (NACE-aligned competencies, STAR, Pyramid, quantifying impact), and vector search with time decay so the coach can say things like “last time you struggled with numbers—let’s practice that again.” We learned to integrate **OpenAI Realtime** for live voice with the same coaching brain, and to build an “anti-doomscroll” opportunities feed with evidence-based **Confidence Dossiers**—why you’re ready (from *your* practice), where to watch out, and a Socratic prompt so *you* decide. We also learned to degrade gracefully when Postgres is unset (localStorage progress, no dossier/feed) so the app still delivers value.

**How you built your project**

We built a **Next.js 14 (App Router)** mobile-first web app with **React 18** and **TypeScript**, styled with **Tailwind CSS**. We use **NextAuth** (Google; optional Azure AD, Apple) for identity and **Postgres on Neon** with **pgvector** for long-term memory. After each mock interview we run **GPT-4o-mini** to extract structured insights (competency, score, evidence, feedback), generate embeddings with **text-embedding-3-small**, and store them in `session_insights`. A **coach agent** uses a `query_user_history(competency_name)` tool—vector search with time decay—so replies reference and re-test on prior weaknesses. **Dynamic context** (days since active, target weakness, recent spark, warm-up and profile) is injected into mock interview, live interview, and dossier. **Live voice** is powered by **OpenAI Realtime** (WebRTC); we have a fallback path with **Whisper** + chat + TTS. The **resume translator** turns academic experiences into ATS-friendly, NACE-aligned bullets. The **opportunities feed** uses a Central Brain–style pipeline: ranked opportunities with deadlines, apply/save/reject actions, and **Confidence Dossier** generation (LLM bridges user evidence to the role and produces blind-spot warnings and a Socratic prompt). Analytics are **consent-gated** with **PostHog** and server-side batch events to `analytics_events` when the DB is present. We support a **demo judge** mode (cookie-based effective user) for hackathon demos.

**Challenges you faced**

- **Memory and retrieval:** Designing a schema and time-decay formula so the coach gets relevant, recent evidence without overwhelming the context window.
- **Realtime voice:** Integrating OpenAI Realtime (WebRTC) and keeping the same coaching instructions and rapport; handling fallback when Realtime isn’t available.
- **Graceful degradation:** Making the app work without Postgres (localStorage for progress and badges, no dossier/feed) so judges and users without a DB still get a great experience.
- **Product clarity:** Keeping “session focus,” three-card feedback, and the dossier (why you’re ready / watch out / your decision) clear and actionable instead of generic.
- **Scope:** Balancing mock interview, live voice, resume translation, opportunities feed, and dossier in one coherent product without feature creep.

---

## Built with

**Comma-separated list (natural language, A, B, C, …):**

A, Next.js 14 (App Router), B, React 18, C, TypeScript, D, Tailwind CSS, E, NextAuth (Google; optional Azure AD and Apple), F, Postgres on Neon with pgvector for vector storage, G, OpenAI API (GPT-4o-mini for coach and extraction, gpt-realtime for live voice, text-embedding-3-small for embeddings, Whisper and TTS for fallback), H, Vercel (Node.js serverless), I, PostHog for consent-gated analytics, J, Playwright for E2E tests, K, ESLint and TypeScript for code quality.

**Plain comma-separated (copy-paste for form fields):**

Next.js 14, React 18, TypeScript, Tailwind CSS, NextAuth, Postgres (Neon), pgvector, OpenAI (GPT-4o-mini, Realtime, Whisper, TTS, text-embedding-3-small), Vercel, PostHog, Playwright.
