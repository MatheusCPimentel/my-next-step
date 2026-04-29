import { z } from "zod";

export const jobMatchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(8000, "Description must be under 8000 characters"),
  additionalContext: z
    .string()
    .max(1000, "Additional context must be under 1000 characters")
    .optional(),
});

export type FormValues = z.infer<typeof jobMatchSchema>;
