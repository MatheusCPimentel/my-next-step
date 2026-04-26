import type { Skill } from "@/pages/Board/types";

export const MOCK_RESULT = {
  fitScore: 78,
  environmentScore: 65,
  opportunityScore: 72,
  opportunityDescription:
    "Solid fit with a healthy environment — worth a real application.",
  jobOverview:
    "Senior Frontend Engineer role focused on building scalable web products. Stack is React, TypeScript, and Node.js. Team is fully remote with async-first culture.",
  environmentSignals: [
    { type: "positive", text: "Remote-first, async culture, small team" },
    { type: "positive", text: "Low meeting culture" },
    { type: "warning", text: "Fast-paced environment mentioned twice" },
    { type: "warning", text: "On-call rotation implied" },
  ] as Array<{ type: "positive" | "warning" | "negative"; text: string }>,
  requiredSkills: [
    { name: "React", variant: "success" },
    { name: "TypeScript", variant: "success" },
    { name: "Node.js", variant: "warning" },
    { name: "GraphQL", variant: "danger" },
    { name: "AWS", variant: "danger" },
  ] satisfies Skill[],
  niceToHaveSkills: [
    { name: "Next.js", variant: "success" },
    { name: "Tailwind CSS", variant: "success" },
    { name: "Docker", variant: "warning" },
  ] satisfies Skill[],
  contractType: "Full-time",
  workType: "Remote",
  salary: "USD 120k-150k / year",
  benefits:
    "Health insurance, 401k matching, home office stipend, unlimited PTO",
  finalVerdict:
    "Good fit overall. You cover the core stack well (React + TypeScript), but Node.js is a gap and AWS/GraphQL are missing entirely. The environment looks healthy. Worth applying — address the backend gaps in your cover letter.",
};

export const LOADING_MESSAGES = [
  "Reading job description...",
  "Identifying required skills...",
  "Calculating fit score...",
  "Assessing environment...",
  "Preparing your results...",
];

export const PITCH_TEXT =
  "I am a strong fit for this role because of my deep experience with React and TypeScript, having shipped production applications used by thousands of users. While I am still growing my Node.js and AWS skills, I am a fast learner and have worked in similar full-stack environments before.";
