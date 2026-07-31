"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getPublicEnv } from "@/config/env";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { Label } from "@/features/shared/components/ui/label";
import { inviteMemberAction } from "@/features/workspace/actions/workspace-actions";
import { type InviteMemberInput, inviteMemberSchema } from "@/features/workspace/schemas/workspace";

interface InviteMemberFormProps {
  workspaceId: string;
}

export function InviteMemberForm({ workspaceId }: InviteMemberFormProps) {
  const t = useTranslations("workspace");
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      workspaceId,
      email: "",
      role: "member",
    },
  });

  async function onSubmit(values: InviteMemberInput) {
    setError(null);
    setInviteUrl(null);

    const result = await inviteMemberAction(values);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    const base = getPublicEnv().NEXT_PUBLIC_APP_URL;
    setInviteUrl(`${base}/invite/${result.data.token}`);
    form.reset({ workspaceId, email: "", role: "member" });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="invite-email">{t("inviteEmailLabel")}</Label>
        <Input
          id="invite-email"
          type="email"
          autoComplete="email"
          placeholder={t("inviteEmailPlaceholder")}
          disabled={form.formState.isSubmitting}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
        {t("invite")}
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {inviteUrl ? (
        <div
          className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
          role="status"
        >
          <p className="font-medium">{t("inviteCreated")}</p>
          <p className="mt-1 break-all text-muted-foreground">{inviteUrl}</p>
        </div>
      ) : null}
    </form>
  );
}
