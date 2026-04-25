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
    createdAt: "2026-04-22T09:00:00.000Z",
    updatedAt: "2026-04-22T09:00:00.000Z",
    stageHistory: [{ stage: "Applied", date: "2026-04-22T09:00:00.000Z" }],
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
    createdAt: "2026-04-15T14:30:00.000Z",
    updatedAt: "2026-04-15T14:30:00.000Z",
    stageHistory: [{ stage: "Applied", date: "2026-04-15T14:30:00.000Z" }],
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
    createdAt: "2026-04-08T11:15:00.000Z",
    updatedAt: "2026-04-08T11:15:00.000Z",
    stageHistory: [{ stage: "Applied", date: "2026-04-08T11:15:00.000Z" }],
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
    createdAt: "2026-03-28T10:00:00.000Z",
    updatedAt: "2026-04-12T16:45:00.000Z",
    stageHistory: [
      { stage: "Applied", date: "2026-03-28T10:00:00.000Z" },
      { stage: "HR Interview", date: "2026-04-12T16:45:00.000Z" },
    ],
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
    createdAt: "2026-03-20T08:30:00.000Z",
    updatedAt: "2026-04-05T13:00:00.000Z",
    stageHistory: [
      { stage: "Applied", date: "2026-03-20T08:30:00.000Z" },
      { stage: "HR Interview", date: "2026-04-05T13:00:00.000Z" },
    ],
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
    createdAt: "2026-03-05T12:00:00.000Z",
    updatedAt: "2026-04-18T15:30:00.000Z",
    stageHistory: [
      { stage: "Applied", date: "2026-03-05T12:00:00.000Z" },
      { stage: "HR Interview", date: "2026-03-15T10:00:00.000Z" },
      { stage: "Technical Interview", date: "2026-04-18T15:30:00.000Z" },
    ],
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
    createdAt: "2026-02-28T11:00:00.000Z",
    updatedAt: "2026-04-21T17:00:00.000Z",
    stageHistory: [
      { stage: "Applied", date: "2026-02-28T11:00:00.000Z" },
      { stage: "HR Interview", date: "2026-03-10T14:00:00.000Z" },
      { stage: "Technical Interview", date: "2026-03-25T16:00:00.000Z" },
      { stage: "Offer", date: "2026-04-21T17:00:00.000Z" },
    ],
  },
];
