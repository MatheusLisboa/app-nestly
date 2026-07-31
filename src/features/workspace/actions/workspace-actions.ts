"use server";

import { revalidatePath } from "next/cache";
import {
  acceptInviteSchema,
  createWorkspaceSchema,
  inviteMemberSchema,
  switchWorkspaceSchema,
} from "@/features/workspace/schemas/workspace";
import {
  acceptInvitation,
  createWorkspace,
  inviteMember,
  switchWorkspace,
} from "@/features/workspace/services/workspace-service";
import { createSafeAction } from "@/lib/actions/safe-action";

export const createWorkspaceAction = createSafeAction({
  schema: createWorkspaceSchema,
  async handler(input) {
    const workspace = await createWorkspace(input.name);
    revalidatePath("/", "layout");
    return workspace;
  },
});

export const switchWorkspaceAction = createSafeAction({
  schema: switchWorkspaceSchema,
  async handler(input) {
    const workspace = await switchWorkspace(input.workspaceId);
    revalidatePath("/", "layout");
    return workspace;
  },
});

export const inviteMemberAction = createSafeAction({
  schema: inviteMemberSchema,
  async handler(input) {
    const invite = await inviteMember({
      workspaceId: input.workspaceId,
      email: input.email,
      role: input.role,
    });
    revalidatePath("/settings");
    return invite;
  },
});

export const acceptInviteAction = createSafeAction({
  schema: acceptInviteSchema,
  async handler(input) {
    const workspace = await acceptInvitation(input.token);
    revalidatePath("/", "layout");
    return workspace;
  },
});
