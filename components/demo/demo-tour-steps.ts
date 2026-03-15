export type DemoTourStep = {
  title: string;
  body: string;
  url?: string;
};

export const DEMO_TOUR_STEPS: DemoTourStep[] = [
  {
    title: "Welcome",
    body: "We'll show you Home, Translate, Learning, Live, Community, Progress, and Badges. Click Next to start. (Demo mode is now on so you have full access without signing in.)",
  },
  {
    title: "Home",
    body: "This is your home. From here you can jump to Live Interview, Learning, Community, and Translate.",
  },
  {
    title: "Translate",
    body: "Paste an experience and get ATS-friendly resume bullets in seconds. Try one of the examples or type your own.",
    url: "/translate",
  },
  {
    title: "Learning (intro)",
    body: "Practice behavioral questions with AI and get framework-based feedback. You can type or use voice. We'll run a quick 3-question demo with deliberately imperfect answers so you see how our coach pushes back.",
    url: "/interview",
  },
  {
    title: "Learning (3-Q demo)",
    body: "Click 'Run 3-Q demo' above to see three questions with AI-generated imperfect answers. The coach will push back on structure and impact. When the demo finishes, click Next to continue.",
    url: "/interview",
  },
  {
    title: "Voice in & out",
    body: "In Learning you can speak your answer (voice in) and hear the coach's reply (voice out). Toggle voice on in the interview to try it.",
  },
  {
    title: "Live interview",
    body: "Real-time voice conversation with the AI. Start a session when you're ready.",
    url: "/live-interview",
  },
  {
    title: "Community",
    body: "Opportunities and trends matched to your profile and progress.",
    url: "/opportunities",
  },
  {
    title: "Progress",
    body: "Sessions and insights from your practice. We remember your strengths and areas to improve.",
    url: "/progress",
  },
  {
    title: "Badges",
    body: "Earn badges when you complete mock interviews.",
    url: "/badges",
  },
  {
    title: "You're done",
    body: "You've seen the platform. Sign in to use it with your own data and save progress across devices.",
  },
];

export const DEMO_TOUR_STEP_INDEX_INTERVIEW_RUN = 4;
