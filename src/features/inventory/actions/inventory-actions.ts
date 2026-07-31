"use server";

import { revalidatePath } from "next/cache";
import {
  createInventoryItemSchema,
  deleteInventoryItemSchema,
  restockToShoppingSchema,
  updateInventoryQuantitySchema,
} from "@/features/inventory/schemas/inventory";
import {
  createInventoryItem,
  deleteInventoryItem,
  restockInventoryItemToShopping,
  updateInventoryQuantity,
} from "@/features/inventory/services/inventory-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createInventoryItemAction = createSafeAction({
  schema: createInventoryItemSchema,
  async handler(input) {
    const item = await createInventoryItem(input);
    revalidatePath("/inventory");
    return item;
  },
});

export const updateInventoryQuantityAction = createSafeAction({
  schema: updateInventoryQuantitySchema,
  async handler(input) {
    const item = await updateInventoryQuantity(input.itemId, input.quantity);
    revalidatePath("/inventory");
    return item;
  },
});

export const deleteInventoryItemAction = createSafeAction({
  schema: deleteInventoryItemSchema,
  async handler(input) {
    await deleteInventoryItem(input.itemId);
    revalidatePath("/inventory");
    return { ok: true as const };
  },
});

export const restockToShoppingAction = createSafeAction({
  schema: restockToShoppingSchema,
  async handler(input) {
    const shoppingItem = await restockInventoryItemToShopping(input.itemId);
    revalidatePath("/inventory");
    revalidatePath("/shopping");
    return shoppingItem;
  },
});
