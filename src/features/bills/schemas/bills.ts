import { z } from "zod";

export const billRecurrences = ["once", "monthly", "yearly"] as const;
export type BillRecurrence = (typeof billRecurrences)[number];

export const createBillSchema = z.object({
  title: z.string().trim().min(1).max(80),
  amount: z.coerce.number().min(0).max(1_000_000),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().trim().max(60).optional(),
  recurrence: z.enum(billRecurrences),
});

export const markBillPaidSchema = z.object({
  billId: z.string().uuid(),
});

export const deleteBillSchema = z.object({
  billId: z.string().uuid(),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;
