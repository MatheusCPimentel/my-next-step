export interface Column {
  id: string;
  label: string;
  locked: boolean;
}

export type SkillVariant = "neutral" | "success" | "warning" | "danger";

export interface Skill {
  name: string;
  variant: SkillVariant;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
  niceToHaveSkills: Skill[];
  matchVerdict?: string;
  contractType?: string;
  salary?: string;
  benefits?: string;
  jobUrl?: string;
  notes?: string;
  columnId: string;
}

export type DragData =
  | { type: "column"; columnId: string }
  | { type: "card"; columnId: string };
