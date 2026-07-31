"use server";

import { revalidatePath } from "next/cache";
import {
  addShoppingItemSchema,
  clearCheckedSchema,
  createShoppingListSchema,
  deleteShoppingItemSchema,
  toggleShoppingItemSchema,
} from "@/features/shopping/schemas/shopping";
import {
  addShoppingItem,
  clearCheckedItems,
  deleteShoppingItem,
  ensureDefaultShoppingList,
  toggleShoppingItem,
} from "@/features/shopping/services/shopping-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const ensureShoppingListAction = createSafeAction({
  schema: createShoppingListSchema,
  async handler() {
    const list = await ensureDefaultShoppingList();
    revalidatePath("/shopping");
    return list;
  },
});

export const addShoppingItemAction = createSafeAction({
  schema: addShoppingItemSchema,
  async handler(input) {
    const item = await addShoppingItem(input);
    revalidatePath("/shopping");
    return item;
  },
});

export const toggleShoppingItemAction = createSafeAction({
  schema: toggleShoppingItemSchema,
  async handler(input) {
    const item = await toggleShoppingItem(input.itemId, input.checked);
    revalidatePath("/shopping");
    return item;
  },
});

export const deleteShoppingItemAction = createSafeAction({
  schema: deleteShoppingItemSchema,
  async handler(input) {
    await deleteShoppingItem(input.itemId);
    revalidatePath("/shopping");
    return { ok: true as const };
  },
});

export const clearCheckedAction = createSafeAction({
  schema: clearCheckedSchema,
  async handler(input) {
    const count = await clearCheckedItems(input.listId);
    revalidatePath("/shopping");
    return { count };
  },
});
