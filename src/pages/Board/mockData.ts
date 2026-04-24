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
    tags: ["React", "TypeScript"],
    columnId: "applied",
  },
  {
    id: "2",
    company: "Linear",
    title: "Product Engineer",
    tags: ["React", "Electron"],
    columnId: "applied",
  },
  {
    id: "3",
    company: "Vercel",
    title: "Software Engineer",
    tags: ["Next.js", "Go"],
    columnId: "applied",
  },
  {
    id: "4",
    company: "GitHub",
    title: "Senior Software Engineer",
    tags: ["Ruby", "React"],
    columnId: "hr_interview",
  },
  {
    id: "5",
    company: "Notion",
    title: "Frontend Engineer",
    tags: ["React", "TypeScript"],
    columnId: "hr_interview",
  },
  {
    id: "6",
    company: "Figma",
    title: "Software Engineer",
    tags: ["TypeScript", "WebGL"],
    columnId: "technical_interview",
  },
  {
    id: "7",
    company: "Anthropic",
    title: "Frontend Engineer",
    tags: ["React", "Python"],
    columnId: "offer",
  },
];
