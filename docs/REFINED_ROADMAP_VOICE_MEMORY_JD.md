# Refined Roadmap: Voice, JD, Profile, Memory, Coaching, Analytics

This document refines the Voice/Coaching/Analytics plan with: (1) Whisper for user voice (no real-time STT); (2) no animated avatar; (3) JD-based interview customization; (4) login and user profile; (5) OpenClaw-style long-term memory with auto-constructed notes and re-test on weaknesses.

---

## Part 1: Voice for the Mock Interview (No Avatar)

### 1.1 User voice input: Whisper, not real-time STT

In a mock interview the user speaks their **full answer** without being interrupted (like a real interview). The flow is: **user taps "Speak" → speaks → taps "Done" (or silence detection) → one audio clip is sent for transcription.** The interviewer (AI) does not interrupt, so **real-time streaming STT (e.g. Deepgram) is unnecessary.**

| Approach               | Fit for this flow          | Cost           | Accuracy        |
| ---------------------- | -------------------------- | -------------- | --------------- |
| **OpenAI Whisper API** | **Ideal:** record → send once | ~$0.006/min    | 3–5% WER (clean) |
| **Deepgram streaming** | Overkill; adds complexity  | ~$0.0043–0.0065/min | 3–4% WER   |
| **Web Speech API**     | Free fallback; browser-dependent | Free       | Variable        |

**Recommendation:** Use **Whisper** as the primary user voice input. Flow: (1) Client records audio (MediaRecorder). (2) On "Done" or end-of-speech, send the audio blob to a backend route that calls Whisper API. (3) Return transcript and inject into the chat as the user's message. Optionally offer **Web Speech API** as a free fallback. **Do not implement Deepgram** for this use case.

### 1.2 AI voice output

Use **OpenAI TTS** for the interviewer voice. After each assistant message, send text to TTS and play the audio. Add a "Voice on" / "Listen" toggle so the interview can be fully voice-based (user speaks via Whisper, AI speaks via TTS).

### 1.3 Animated avatar

**Out of scope.** No avatar (e.g. D-ID) in this plan; voice-only is sufficient. Revisit only if there is clear user demand later.

---

## Part 2: JD-Based Interview Customization

**Goal:** Let the user submit a **job description (JD)** for the role they are interviewing for; the AI tutor customizes questions and feedback for that specific role so practice feels accurate and realistic.

**Flow:**
- Optional step before or at the start of the mock interview: "Paste the job description for the role you're preparing for (optional)."
- Backend (or LLM) **parses/summarizes the JD:** extract role title, company/industry, key requirements, required skills, and preferred experience. Optionally use a search API or LLM to add brief company/industry context.
- **Inject into the system prompt:** e.g. "The user is preparing for: [Role] at [Company/industry]. Key requirements: [bullets]. Tailor your behavioral questions and feedback to this role; reference relevant competencies and terminology where natural."
- Store JD (or a compact summary) per session or per user so it can be reused and so notes/memory can reference "preparation for X role."

**Implementation:** One new field (textarea) and an API or serverless function that takes raw JD text and returns a structured summary (role, requirements, skills). Use GPT-4o-mini with a small prompt to extract structure; optionally add search (e.g. Serper, Tavily) later for company-specific color. This differentiates Aptitude AI by making practice **role-specific**.

---

## Part 3: Login and User Profile (Later)

**Goal:** Persistent identity and profile so the AI can **memorize** the user and give better, consistent feedback across sessions.

**Scope:**
- **Auth:** Email/password or OAuth (e.g. Google). Store user id and session.
- **Profile:** Major, year (e.g. sophomore/junior), first-gen yes/no, career goals, "no internship yet," preferred industry. Editable in profile/settings.
- **Usage:** At the start of every mock interview (and optionally translate) session, load the user's profile and **inject into the system prompt**. The existing "context injection" idea becomes **persistent** and tied to identity.
- Enables **long-term memory** to be scoped per user and improves relevance of feedback.

Implement **after** analytics and coaching improvements.

---

## Part 4: Auto-Constructed Notes and Long-Term Memory (OpenClaw-Style)

**Goal:** Automatically build **session notes** that integrate what the user said and what the AI taught/suggested; store them in a **long-lasting memory** so the tutor is not a "new tutor every time" and can **re-test the user on previous weaknesses**. This is the main differentiator from one-off interview tools.

### 4.1 How OpenClaw achieves long-term memory (to copy)

- **Plain Markdown as source of truth:** All memory is stored in Markdown files in the agent workspace. For a web app, the equivalent is **Markdown text in a DB** (e.g. `user_id`, `type`, `content`, `created_at`).
- **Two layers:**
  - **Daily/session logs:** Append-only, chronological (e.g. `memory/YYYY-MM-DD.md` or one record per session). Capture what happened: decisions, lessons, interactions.
  - **Long-term MEMORY.md:** Curated, durable facts and preferences (e.g. "User struggles with quantifying impact"; "Strong at teamwork examples"). Updated less frequently; survives across sessions.
- **Retrieval:** **Hybrid search:** **vector similarity** (semantic) + **BM25** (keyword), combined with **Reciprocal Rank Fusion (RRF)**; optional **temporal decay** (e.g. 30-day half-life). At session start, run a query and **inject the top snippets into the system prompt**.
- **Tools:** `memory_get` (targeted read) and `memory_search` (semantic recall). In our stack: an API that takes a user id and query and returns relevant markdown snippets; indexing when notes are written (e.g. embed with OpenAI embeddings, store in Vercel Postgres with pgvector).
- **Automatic memory flush:** Before the session ends, prompt the model to write durable takeaways to the long-term layer.

### 4.2 Application to Aptitude AI

- **After each interview:** Auto-generate a **session note** in Markdown:
  - **What the user said:** Short summary of each answer (1–2 lines per question).
  - **What the AI taught/suggested:** Key feedback points and reflection questions.
  - **Strengths:** 1–3 bullets.
  - **Areas to improve:** 1–3 bullets (e.g. "Add more concrete results"; "Structure with STAR more explicitly").
- **Storage:** Append to a **session log** (e.g. one row per interview: `session_notes` table with markdown `content`). Optionally extract **durable facts** and merge into a **user-level long-term memory** (e.g. "Recurring weakness: quantifying impact").
- **Efficient storage:** Store notes as **markdown text** in DB (`user_memories` with `user_id`, `type` = 'session_log' | 'long_term', `content`, `session_id`, `created_at`). Structure mirrors OpenClaw (session log vs curated MEMORY).
- **At next session start:** Run **memory_search** (hybrid: vector + keyword over user's notes), retrieve relevant snippets (last session summary, recurring weaknesses, recent progress), and **inject into the system prompt** so the AI can:
  - Reference past feedback ("Last time we worked on adding numbers to your examples").
  - **Re-test or focus on previous weaknesses** ("Let's do a question that gives you a chance to practice quantifying impact").
  - Avoid repeating the same generic advice.
- **User-facing:** A "My progress" or "Session notes" view where the user can read the auto-generated notes (and optionally export as markdown). Optionally "Review and re-test" that starts an interview focused on past weaknesses.

### 4.3 Implementation building blocks

- **Write path:** Post-interview, call an LLM to summarize the conversation into the structured session note (template: user summary, AI feedback, strengths, areas to improve). Save to DB as markdown; optionally extract and update long-term memory bullets.
- **Indexing:** When saving a note, generate embeddings (e.g. OpenAI `text-embedding-3-small`) and store in a vector store (e.g. Vercel Postgres with pgvector, or Supabase). Add full-text search on `content` if the DB supports it.
- **Read path:** On "Start interview" (when user has history), run a retrieval query (e.g. "last session summary, weaknesses, progress") using hybrid search; pass top-k snippets into the system prompt.
- **Re-test on weaknesses:** In the system prompt, add a line like "Areas to work on from previous sessions: [retrieved weaknesses]. Where possible, ask a question that lets the user practice one of these."

This gives you a **footprint** for each user, **learning material** (the notes), and a **tutor that improves with the user over time**, similar to OpenClaw's long-term memory but adapted to a web app and interview-coaching domain.

---

## Part 5: Improving AI Coaching (Unchanged)

- **Context injection:** Optional user context (major, year, first-gen, etc.) in system prompt; with login, this becomes **persistent profile**.
- **Structured feedback:** Affirm one strength + one reflection question (GROW-aligned).
- **Session-level adaptation:** After first answer, append a short "coaching note" for the next turn.
- **Competency tagging:** Map questions/feedback to NACE competencies and name them in feedback.

---

## Part 6: Analytics on User Behavior (Unchanged)

- **Legal:** Consent banner; minimize PII; document in privacy note; opt-out.
- **Efficient:** Batch events; requestIdleCallback (or setTimeout) to flush; sendBeacon on unload; never block core flow.
- **Persistence:** Extend `/api/events` to persist to DB (e.g. Vercel Postgres or Supabase). Optionally forward to PostHog later for funnels and session replay.

---

## Suggested implementation order (refined)

1. **Analytics:** Consent + batching + persistence for `/api/events`.
2. **Coaching:** Optional context + structured feedback (Affirm + one reflection) in `lib/prompts.ts`.
3. **Voice (user):** **Whisper** (record full answer → send once → transcript); optional Web Speech fallback. No Deepgram.
4. **Voice (AI):** OpenAI TTS; "Voice on" toggle for fully voice-based interview. **No avatar.**
5. **JD-based interview:** Optional JD input; parse/summarize; inject into system prompt for role-specific questions and feedback.
6. **Login + profile:** Auth and profile (major, year, context); inject profile into every conversation.
7. **Long-term memory (OpenClaw-style):** Auto-generated session notes (markdown); store in DB; hybrid search (vector + keyword); retrieve at session start; inject into prompt; re-test on previous weaknesses; optional "My progress" / export.

This order keeps voice simple (Whisper + TTS, no avatar), adds JD customization and profile for relevance, then adds the differentiator: persistent memory and continuous improvement.
