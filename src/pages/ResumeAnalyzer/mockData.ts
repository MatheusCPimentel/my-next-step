export const INITIAL_SUMMARY =
  "You are a senior frontend engineer with 5 years of experience in React and TypeScript. You have shipped production applications at scale, with a track record of quantified achievements. Your resume shows clear career progression but lacks soft skills and leadership context.";

export const ADJUSTED_SUMMARY =
  "You are a senior frontend engineer with 5 years of experience in React and TypeScript, with additional context in team collaboration and cross-functional projects. You have shipped production applications at scale with quantified impact.";

export const ANALYSIS_LOADING_MESSAGES = [
  "Reading your resume...",
  "Analyzing experience...",
  "Checking ATS compatibility...",
  "Preparing your feedback...",
];

export const MOCK_ANALYSIS = {
  summary:
    "Your resume is well-structured with clear sections. It highlights 5 years of experience in frontend development with strong emphasis on React and TypeScript projects.",
  strengths: [
    "Strong technical skills section with relevant, current technologies",
    "Quantified achievements in past roles (revenue, traffic, performance gains)",
    "Clear career progression across 3 increasingly senior positions",
    "Good use of action verbs in role descriptions",
  ],
  weaknesses: [
    "No professional summary at the top — recruiters skim that first",
    "Some role descriptions are too brief to convey impact",
    "Missing soft skills and leadership / mentoring context",
  ],
  attentionPoints: [
    "Education section is sparse — consider adding relevant coursework or honors",
    "No mention of side projects or open-source work",
    "Tooling list is broad — risks looking generalist instead of specialized",
  ],
  atsScore: 72,
  atsBadge: "Good",
  atsExplanation:
    "Your resume is readable by most ATS systems. Adding more role-specific keywords and avoiding multi-column layouts would push this score higher.",
  suggestions: [
    "Add a 2–3 sentence professional summary above your experience",
    "Expand on your role at Acme Corp with specific metrics (users, latency, $)",
    "Mention any open-source contributions, talks, or side projects",
    "Group skills by category (Languages / Frameworks / Tooling) for clarity",
  ],
};

export const MOCK_SKILLS = [
  { name: "React", level: 92 },
  { name: "TypeScript", level: 88 },
  { name: "Node.js", level: 65 },
  { name: "CSS / Tailwind", level: 80 },
  { name: "Testing", level: 55 },
  { name: "System design", level: 48 },
];

export const WHAT_WE_ANALYZE_ITEMS = [
  {
    title: "Upload your PDF",
    description:
      "We read your resume securely. Nothing is stored without your permission.",
  },
  {
    title: "AI scans every section",
    description:
      "Experience, skills, achievements, formatting and ATS compatibility are all checked.",
  },
  {
    title: "Get your feedback",
    description:
      "Strengths, weaknesses, and actionable suggestions to improve your resume.",
  },
  {
    title: "Save your profile",
    description: "Confirm your AI-generated profile to unlock Job Match.",
  },
];

export const WHAT_WE_ANALYZE_EXTRAS: Array<{
  label: string;
  color: "teal" | "coral" | "amber" | "purple";
}> = [
  { label: "Strengths & achievements", color: "teal" },
  { label: "Weaknesses & gaps", color: "coral" },
  { label: "Attention points", color: "amber" },
  { label: "ATS score & tips", color: "purple" },
];
