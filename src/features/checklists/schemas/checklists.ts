import { z } from "zod";

export const createChecklistSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional(),
});

export const addChecklistItemSchema = z.object({
  checklistId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
});

export const toggleChecklistItemSchema = z.object({
  itemId: z.string().uuid(),
  checked: z.boolean(),
});

export const deleteChecklistItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const resetChecklistSchema = z.object({
  checklistId: z.string().uuid(),
});

export const deleteChecklistSchema = z.object({
  checklistId: z.string().uuid(),
});

export type CreateChecklistInput = z.infer<typeof createChecklistSchema>;
export type AddChecklistItemInput = z.infer<typeof addChecklistItemSchema>;
