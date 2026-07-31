import { z } from "zod";

export const createShoppingListSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
});

export const addShoppingItemSchema = z.object({
  listId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().positive().max(9999),
  unit: z.string().trim().min(1).max(20),
  notes: z.string().trim().max(240).optional(),
  inventoryItemId: z.string().uuid().optional(),
});

export const toggleShoppingItemSchema = z.object({
  itemId: z.string().uuid(),
  checked: z.boolean(),
});

export const deleteShoppingItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const clearCheckedSchema = z.object({
  listId: z.string().uuid(),
});

export type AddShoppingItemInput = z.infer<typeof addShoppingItemSchema>;
export type ToggleShoppingItemInput = z.infer<typeof toggleShoppingItemSchema>;
