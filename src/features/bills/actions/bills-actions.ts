"use server";

import { revalidatePath } from "next/cache";
import {
  createBillSchema,
  deleteBillSchema,
  markBillPaidSchema,
} from "@/features/bills/schemas/bills";
import { createBill, deleteBill, markBillPaid } from "@/features/bills/services/bills-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createBillAction = createSafeAction({
  schema: createBillSchema,
  async handler(input) {
    const bill = await createBill(input);
    revalidatePath("/bills");
    return bill;
  },
});

export const markBillPaidAction = createSafeAction({
  schema: markBillPaidSchema,
  async handler(input) {
    const bill = await markBillPaid(input.billId);
    revalidatePath("/bills");
    return bill;
  },
});

export const deleteBillAction = createSafeAction({
  schema: deleteBillSchema,
  async handler(input) {
    await deleteBill(input.billId);
    revalidatePath("/bills");
    return { ok: true as const };
  },
});
