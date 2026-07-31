import { z } from "zod";

export const cleaningFrequencies = ["daily", "weekly", "biweekly", "monthly"] as const;

export type CleaningFrequency = (typeof cleaningFrequencies)[number];

export const createCleaningTaskSchema = z.object({
  title: z.string().trim().min(1).max(80),
  area: z.string().trim().max(60).optional(),
  frequency: z.enum(cleaningFrequencies),
});

export const completeCleaningTaskSchema = z.object({
  taskId: z.string().uuid(),
});

export const deleteCleaningTaskSchema = z.object({
  taskId: z.string().uuid(),
});

export type CreateCleaningTaskInput = z.infer<typeof createCleaningTaskSchema>;

export const FREQUENCY_DAYS: Record<CleaningFrequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};
