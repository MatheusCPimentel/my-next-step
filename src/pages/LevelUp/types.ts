export type WeakPointCategory = {
  id: string;
  name: string;
  color: "coral" | "purple" | "teal" | "amber" | "blue";
};

export type WeakPoint = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  sourceJob: string;
  mastered: boolean;
};
