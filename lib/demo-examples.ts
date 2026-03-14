/**
 * Example prompts for judges and demos. Used by Translate and Mock Interview
 * so evaluators can try the tool quickly without typing from scratch.
 */

export const TRANSLATE_EXAMPLES: { label: string; text: string }[] = [
  {
    label: "Marketing group project",
    text: `In my marketing class we had to do a group project. Our team of four had to research a brand and present a campaign idea. I was responsible for the competitor analysis and I also helped put together the slides. We presented in front of the class and got feedback from the professor. It took about three weeks and we had to meet outside of class a few times to get it done.`,
  },
  {
    label: "Part time job experience",
    text: `I work at a campus coffee shop part time. I take orders, handle the register, and sometimes help with opening and closing. When we get busy I have to prioritize and stay calm. I also trained two new baristas last semester.`,
  },
  {
    label: "Class presentation",
    text: `For my communications class I had to give a five minute presentation on a topic I chose. I picked social media and mental health. I had to research, write a script, and use slides. I was nervous but I practiced a lot and got good feedback from the professor.`,
  },
];

/**
 * Example answers for the three behavioral interview questions.
 * Use in order: answer 1 for the first question (e.g. teamwork/difficult person),
 * answer 2 for the second (e.g. deadline), answer 3 for the third (e.g. learning something new).
 */
export const INTERVIEW_ANSWER_EXAMPLES: [string, string, string] = [
  `In a group project last semester one teammate kept missing deadlines. I set up a short weekly check in so we could align on tasks and I shared a simple shared doc with due dates. We talked about what was getting in the way and after that they turned things in on time. I learned that clear expectations and a low pressure conversation can fix a lot.`,
  `We had a big assignment due in 48 hours and our group was behind. I suggested we split the work by strength and I took the part that needed the most research. I stayed up that night to get my section done so the next person could build on it. We turned it in on time and got a good grade. It showed me I work well under pressure when the team is counting on me.`,
  `I had to learn basic Excel for a class project and I had never used it before. I watched a few short tutorials and practiced with sample data. Within a couple of days I could do the formulas and charts we needed. I like learning by doing and asking for help when I get stuck.`,
];
