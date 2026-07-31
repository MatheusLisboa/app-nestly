"use server";

import { revalidatePath } from "next/cache";
import {
  addBabyCareLogSchema,
  addBabyPrepItemSchema,
  applySuggestedPrepSchema,
  createBabySchema,
  deleteBabyCareLogSchema,
  deleteBabyPrepItemSchema,
  markBabyBornSchema,
  toggleBabyPrepItemSchema,
  updateBabyProfileSchema,
} from "@/features/baby/schemas/baby";
import {
  addBabyCareLog,
  addBabyPrepItem,
  applySuggestedPrepItems,
  createBaby,
  deleteBabyCareLog,
  deleteBabyPrepItem,
  markBabyBorn,
  toggleBabyPrepItem,
  updateBabyProfile,
} from "@/features/baby/services/baby-service";
import { createSafeAction } from "@/lib/actions/safe-action";

function revalidateBaby() {
  revalidatePath("/baby");
}

export const createBabyAction = createSafeAction({
  schema: createBabySchema,
  async handler(input) {
    const baby = await createBaby({
      name: input.name,
      status: input.status,
      dueDate: input.dueDate || undefined,
      birthDate: input.birthDate || undefined,
    });
    revalidateBaby();
    return baby;
  },
});

export const markBabyBornAction = createSafeAction({
  schema: markBabyBornSchema,
  async handler(input) {
    const baby = await markBabyBorn(input);
    revalidateBaby();
    return baby;
  },
});

export const updateBabyProfileAction = createSafeAction({
  schema: updateBabyProfileSchema,
  async handler(input) {
    const baby = await updateBabyProfile(input);
    revalidateBaby();
    return baby;
  },
});

export const addBabyCareLogAction = createSafeAction({
  schema: addBabyCareLogSchema,
  async handler(input) {
    const log = await addBabyCareLog(input);
    revalidateBaby();
    return log;
  },
});

export const deleteBabyCareLogAction = createSafeAction({
  schema: deleteBabyCareLogSchema,
  async handler(input) {
    await deleteBabyCareLog(input.logId);
    revalidateBaby();
    return { ok: true as const };
  },
});

export const addBabyPrepItemAction = createSafeAction({
  schema: addBabyPrepItemSchema,
  async handler(input) {
    const item = await addBabyPrepItem(input);
    revalidateBaby();
    return item;
  },
});

export const toggleBabyPrepItemAction = createSafeAction({
  schema: toggleBabyPrepItemSchema,
  async handler(input) {
    const item = await toggleBabyPrepItem(input.itemId, input.checked);
    revalidateBaby();
    return item;
  },
});

export const deleteBabyPrepItemAction = createSafeAction({
  schema: deleteBabyPrepItemSchema,
  async handler(input) {
    await deleteBabyPrepItem(input.itemId);
    revalidateBaby();
    return { ok: true as const };
  },
});

export const applySuggestedPrepAction = createSafeAction({
  schema: applySuggestedPrepSchema,
  async handler(input) {
    const result = await applySuggestedPrepItems(input);
    revalidateBaby();
    return result;
  },
});
