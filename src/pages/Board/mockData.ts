import type { Column, Job } from "@/pages/Board/types";

export const newColumnId = () => Math.random().toString(36).slice(2, 10);

export const INITIAL_COLUMNS: Column[] = [
  { id: "applied", label: "Applied", locked: true },
  { id: "hr_interview", label: "HR Interview", locked: false },
  { id: "technical_interview", label: "Technical Interview", locked: false },
  { id: "offer", label: "Offer", locked: true },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: "1",
    company: "Stripe",
    title: "Senior Frontend Engineer",
    description: "Build payments UI for Stripe's dashboard at scale.",
    requiredSkills: [
      { name: "React", variant: "neutral" },
      { name: "TypeScript", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "applied",
  },
  {
    id: "2",
    company: "Linear",
    title: "Product Engineer",
    description: "Ship product features end-to-end across web and desktop.",
    requiredSkills: [
      { name: "React", variant: "neutral" },
      { name: "Electron", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "applied",
  },
  {
    id: "3",
    company: "Vercel",
    title: "Software Engineer",
    description: "Work on the Vercel platform with Next.js and Go services.",
    requiredSkills: [
      { name: "Next.js", variant: "neutral" },
      { name: "Go", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "applied",
  },
  {
    id: "4",
    company: "GitHub",
    title: "Senior Software Engineer",
    description: "Build developer-facing features on github.com.",
    requiredSkills: [
      { name: "Ruby", variant: "neutral" },
      { name: "React", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "hr_interview",
  },
  {
    id: "5",
    company: "Notion",
    title: "Frontend Engineer",
    description: "Improve the editor experience for Notion users.",
    requiredSkills: [
      { name: "React", variant: "neutral" },
      { name: "TypeScript", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "hr_interview",
  },
  {
    id: "6",
    company: "Figma",
    title: "Software Engineer",
    description: "Work on Figma's rendering and design tooling.",
    requiredSkills: [
      { name: "TypeScript", variant: "neutral" },
      { name: "WebGL", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "technical_interview",
  },
  {
    id: "7",
    company: "Anthropic",
    title: "Frontend Engineer",
    description: "Build product surfaces for Anthropic's Claude apps.",
    requiredSkills: [
      { name: "React", variant: "neutral" },
      { name: "Python", variant: "neutral" },
    ],
    niceToHaveSkills: [],
    columnId: "offer",
  },
];
