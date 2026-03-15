# Validation: Hidden System (Loop A + Loop B + Dynamic Context)

This document describes a **repeatable way to verify** that Loop B writes insights, Loop A reads them via dynamic context (callback), and time decay works—without running many full interviews manually.

---

## Prerequisites

- App running (e.g. `npm run dev` in `aptitude-ai-mvp`).
- Postgres with [schema-memory.sql](./schema-memory.sql) applied (tables: `users`, `session_logs`, `competencies`, `session_insights`; competencies seeded).
- `POSTGRES_URL` (or your Postgres connection env) set in the app environment.
- One test user signed in (e.g. Google). Note their `user_id` (UUID) from the `users` table for SQL checks.

---

## Simulated Progression Test (Three Sessions)

Follow this exact three-step sequence to validate the hidden system.

### Session 1 – Baseline failure (Loop B writes)

1. Start a new mock interview as the test user.
2. When the first behavioral question is asked, **answer by rambling**: several paragraphs, chronological story, no clear takeaway or conclusion first (e.g. "Well, so it started when I was in high school, and then we had this project, and my friend said..., and then later we..." without ever stating the main point).
3. Complete the full session (all 3 Q&As). End the interview so the app calls the completion API and the background worker runs extraction (Loop B).

**Verify in the database:**

```sql
-- Replace YOUR_USER_ID with the test user's UUID from the users table.
SELECT si.id, c.name AS competency_name, si.insight_type, si.score, si.evidence_quote, si.created_at
FROM session_insights si
LEFT JOIN competencies c ON c.id = si.competency_id
WHERE si.user_id = 'YOUR_USER_ID'
ORDER BY si.created_at DESC;
```

**Expected:** At least one row with `insight_type = 'weakness'` and `competency_name` related to **Communication** or **STAR Method Structuring** (or **Quantifying Impact** if you also gave a vague result). The `evidence_quote` or narrative should reflect rambling or missing conclusion.

---

### Session 2 – Callback test (Loop A reads)

1. Start a **new** mock interview with the same user (do not reuse the previous session).
2. Observe the AI’s opening or early message.

**Expected:** The coach’s behavior adapts: it should reference keeping answers concise, structuring (e.g. conclusion first), or the user’s known area to improve, based on the previous session. The dynamic context includes a **session focus** line (e.g. "This session focus: [target_weakness]. Goal: ask questions that test this; give feedback that addresses it.") so the coach does not ask random questions. This validates that dynamic context (session focus, target_weakness / past insight) is injected and the coach uses it.

---

### Session 3 – Decay test (old insights fade)

1. In the database, **backdate** the test user’s `session_insights` so they are treated as old:

```sql
-- Replace YOUR_USER_ID with the test user's UUID.
UPDATE session_insights
SET created_at = NOW() - INTERVAL '45 days'
WHERE user_id = 'YOUR_USER_ID';
```

2. Start a **third** mock interview with the same user.

**Expected:** The AI does **not** prominently mention the earlier rambling; behavior should resemble a fresh or less personalized session. This validates that the 30-day half-life decay in [lib/query-user-history.ts](../lib/query-user-history.ts) (and the use of recent insights in dynamic context) reduces the weight of old data.

---

## How to verify the backend directly

- **After Session 1:** Run the `SELECT` above on `session_insights` and confirm a new row with a weakness tied to Communication or STAR (or Quantifying Impact). No schema change is required.
- **Dynamic context API:** While signed in as the test user, call `GET /api/context/dynamic`. The response body should include a `context` string that (1) starts with or contains a **session focus** line (e.g. "Session focus (use it; do not ask random questions): This session focus: Communication..."), and (2) contains the user’s known weakness (e.g. "Communication" or "STAR Method Structuring") after Session 1. When the user has multiple weaknesses, the context may also include "Next time we can focus on: [second weakness]."

---

## Troubleshooting

If **Session 2 does not adapt** (coach doesn’t reference past weakness):

1. **Check dynamic context:** Call `GET /api/context/dynamic` (with the user’s session cookie). Ensure the response `context` is non-empty and includes the target weakness or related phrase.
2. **Check the interview request:** In the client (e.g. Network tab), confirm that the interview request body includes the dynamic context string (e.g. from `MockInterview.tsx`: dynamic context is prepended to the context sent to the interview API).
3. **Check the system prompt:** The interview API builds the system prompt with `getMockInterviewSystemPrompt(context)`. Ensure the prompt includes the elite coaching rules and the "Additional context to tailor questions and feedback" section so the model sees the weakness and profile.

If **Session 1 does not produce a weakness row:**

- Ensure the completion API and background extraction job ran (check that a `session_logs` row exists and that `session_insights` has at least one row for that session).
- The extraction prompt in [lib/extract-insights.ts](../lib/extract-insights.ts) is tuned to detect Pyramid/STAR/Result violations; if the transcript clearly contains rambling or unquantified success, at least one weakness should be extracted.

---

## Automated checks (optional)

A script validates that Loop B output is read by the context builder and that `queryUserHistory` returns seeded evidence.

**Run (from repo root `aptitude-ai-mvp`):**

```bash
npm run validate:hidden
```

Requires: `POSTGRES_URL` (or `DATABASE_URL`), schema [schema-memory.sql](./schema-memory.sql) applied. Optional: `OPENAI_API_KEY` for the `queryUserHistory` check (embedding); if unset, only the dynamic-context assertion runs.

The script: (1) Seeds a test user and a `session_insights` row with competency Communication and `insight_type = 'weakness'`. (2) Calls `getDynamicContextForUser` and `formatDynamicContext` and asserts the context string includes the **session focus** line and the target weakness. (3) If `OPENAI_API_KEY` is set: calls `queryUserHistory(userId, "Communication", 3)` and asserts the returned list includes the seeded evidence.

**Manual / future tests:**

1. **Context API (covered by script above):** Seed a test user and a `session_insights` row with a known `competency_id` (e.g. Communication) and `insight_type = 'weakness'`. Call `GET /api/context/dynamic` with that user’s session —covered by script above.

2. **query_user_history:** Covered by script when `OPENAI_API_KEY` is set. Optionally test decay by seeding an old `created_at` and asserting that item ranks lower or is excluded.

3. **Extraction:** Run `extractSessionInsights` on a fixed transcript that contains rambling and no quantified result; assert the returned array includes at least one weakness mapped to Communication, STAR Method Structuring, or Quantifying Impact. 
These can be implemented as Node scripts (using the app’s DB and env) or as Jest/Playwright tests. Document the commands or test paths here or in a sibling file (e.g. `VALIDATION_HIDDEN_SYSTEM.md (this file)`) so evaluators can run "automated validation" if they prefer.
