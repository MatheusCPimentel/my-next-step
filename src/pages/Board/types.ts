export interface Column {
  id: string;
  label: string;
  locked: boolean;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  tags: string[];
  columnId: string;
}

export type DragData =
  | { type: "column"; columnId: string }
  | { type: "card"; columnId: string };
