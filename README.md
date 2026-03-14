# Aptitude AI MVP

A mobile-first web app that helps university students translate academic experiences into resume bullets and practice behavioral interviews with supportive AI.

## Where to add your API key

1. Open the project folder: `aptitude-ai-mvp`
2. Create a file named `.env.local` in that folder (same level as `package.json`)
3. Add one line with your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
4. Save the file. Restart the dev server (`npm run dev`) if it is already running.
5. Do not commit `.env.local` to git (it is already in `.gitignore`)

You can copy `.env.example` and then replace the placeholder with your real key.

## Example input for judges (Translate an experience)

For the **What did you do in class this week?** field, judges can paste this example to see the full flow:

```
In my marketing class we had to do a group project. Our team of four had to research a brand and present a campaign idea. I was responsible for the competitor analysis and I also helped put together the slides. We presented in front of the class and got feedback from the professor. It took about three weeks and we had to meet outside of class a few times to get it done.
```

This will produce three professional resume bullet options that the judges can copy.

**In the app:** On the Translate page, judges can click **Quick demo for judges** and choose an example (e.g. "Marketing group project") to fill the box in one click. Same style is available on the Mock Interview page: after each question, a **Use example answer for this question** button appears so they can fill and send without typing.

## Example inputs for judges (Mock interview)

After clicking **Start practice**, the AI will ask three behavioral questions. Judges can use these example answers (one per question) to quickly complete the flow:

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

In the app, the **Use example answer for this question** button fills the current answer for them; they can edit it or click Send as is.

## Features

- **Experience Translator**: Paste what you did in class and get 3 ATS friendly resume bullet options (NACE aligned).
- **Mock Interview**: Chat with an empathetic AI that asks behavioral questions and gives gentle feedback; unlock a badge when you finish.
- **Digital Badges**: View, copy, and share your badge (e.g. to LinkedIn).

## Setup

1. Install dependencies: `npm install`
2. Add your OpenAI API key in `.env.local` (see "Where to add your API key" above).
3. Run dev server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test:e2e`: Run Playwright E2E tests (start dev server first, or set `CI=1` to skip webServer)

## Tech

- Next.js 14 (App Router), React, TypeScript, Tailwind CSS.
- OpenAI API (gpt-4o-mini) for resume bullets and interview chat.
- No database; badge unlock state is stored in `localStorage`.
