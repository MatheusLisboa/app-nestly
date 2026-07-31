import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres")
    .max(80, "Nome muito longo"),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.string().email("Informe um e-mail válido").trim().toLowerCase(),
  role: z.enum(["admin", "member", "viewer"]),
});

export const switchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type SwitchWorkspaceInput = z.infer<typeof switchWorkspaceSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
