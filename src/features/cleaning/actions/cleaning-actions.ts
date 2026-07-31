"use server";

import { revalidatePath } from "next/cache";
import {
  completeCleaningTaskSchema,
  createCleaningTaskSchema,
  deleteCleaningTaskSchema,
} from "@/features/cleaning/schemas/cleaning";
import {
  completeCleaningTask,
  createCleaningTask,
  deleteCleaningTask,
} from "@/features/cleaning/services/cleaning-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createCleaningTaskAction = createSafeAction({
  schema: createCleaningTaskSchema,
  async handler(input) {
    const task = await createCleaningTask(input);
    revalidatePath("/cleaning");
    return task;
  },
});

export const completeCleaningTaskAction = createSafeAction({
  schema: completeCleaningTaskSchema,
  async handler(input) {
    const task = await completeCleaningTask(input.taskId);
    revalidatePath("/cleaning");
    return task;
  },
});

export const deleteCleaningTaskAction = createSafeAction({
  schema: deleteCleaningTaskSchema,
  async handler(input) {
    await deleteCleaningTask(input.taskId);
    revalidatePath("/cleaning");
    return { ok: true as const };
  },
});
