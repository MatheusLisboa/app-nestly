"use server";

import { revalidatePath } from "next/cache";
import {
  addChecklistItemSchema,
  createChecklistSchema,
  deleteChecklistItemSchema,
  deleteChecklistSchema,
  resetChecklistSchema,
  toggleChecklistItemSchema,
} from "@/features/checklists/schemas/checklists";
import {
  addChecklistItem,
  createChecklist,
  deleteChecklist,
  deleteChecklistItem,
  resetChecklist,
  toggleChecklistItem,
} from "@/features/checklists/services/checklists-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createChecklistAction = createSafeAction({
  schema: createChecklistSchema,
  async handler(input) {
    const checklist = await createChecklist(input);
    revalidatePath("/checklists");
    return checklist;
  },
});

export const addChecklistItemAction = createSafeAction({
  schema: addChecklistItemSchema,
  async handler(input) {
    const item = await addChecklistItem(input);
    revalidatePath("/checklists");
    revalidatePath(`/checklists/${input.checklistId}`);
    return item;
  },
});

export const toggleChecklistItemAction = createSafeAction({
  schema: toggleChecklistItemSchema,
  async handler(input) {
    const item = await toggleChecklistItem(input.itemId, input.checked);
    revalidatePath("/checklists");
    revalidatePath(`/checklists/${item.checklistId}`);
    return item;
  },
});

export const deleteChecklistItemAction = createSafeAction({
  schema: deleteChecklistItemSchema,
  async handler(input) {
    await deleteChecklistItem(input.itemId);
    revalidatePath("/checklists");
    return { ok: true as const };
  },
});

export const resetChecklistAction = createSafeAction({
  schema: resetChecklistSchema,
  async handler(input) {
    const count = await resetChecklist(input.checklistId);
    revalidatePath("/checklists");
    revalidatePath(`/checklists/${input.checklistId}`);
    return { count };
  },
});

export const deleteChecklistAction = createSafeAction({
  schema: deleteChecklistSchema,
  async handler(input) {
    await deleteChecklist(input.checklistId);
    revalidatePath("/checklists");
    return { ok: true as const };
  },
});
