import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().min(0).max(99999),
  unit: z.string().trim().min(1).max(20),
  minQuantity: z.coerce.number().min(0).max(99999),
  category: z.string().trim().max(60).optional(),
  locationId: z.string().uuid().optional(),
  notes: z.string().trim().max(240).optional(),
});

export const updateInventoryQuantitySchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().min(0).max(99999),
});

export const deleteInventoryItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const restockToShoppingSchema = z.object({
  itemId: z.string().uuid(),
});

export const createLocationSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
