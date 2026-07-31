import type { z } from "zod";
import { type ActionResult, DomainError, fail, ok } from "@/lib/errors";

/**
 * Typed Server Action wrapper: parse input with Zod, map DomainError-like failures.
 */
export function createSafeAction<TInput, TOutput>(options: {
  schema: z.ZodType<TInput>;
  handler: (input: TInput) => Promise<TOutput>;
}) {
  return async (raw: unknown): Promise<ActionResult<TOutput>> => {
    const parsed = options.schema.safeParse(raw);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input");
    }

    try {
      const data = await options.handler(parsed.data);
      return ok(data);
    } catch (error) {
      if (error instanceof DomainError) {
        return fail(error.code, error.message);
      }
      if (error instanceof Error) {
        return fail("ACTION_ERROR", error.message);
      }
      return fail("ACTION_ERROR", "Unexpected error");
    }
  };
}
