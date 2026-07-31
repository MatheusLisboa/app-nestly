"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { Label } from "@/features/shared/components/ui/label";
import { createWorkspaceAction } from "@/features/workspace/actions/workspace-actions";
import {
  type CreateWorkspaceInput,
  createWorkspaceSchema,
} from "@/features/workspace/schemas/workspace";

export function CreateWorkspaceForm() {
  const t = useTranslations("workspace");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateWorkspaceInput) {
    setError(null);
    const result = await createWorkspaceAction(values);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="workspace-name">{t("nameLabel")}</Label>
        <Input
          id="workspace-name"
          placeholder={t("namePlaceholder")}
          autoComplete="organization"
          disabled={form.formState.isSubmitting}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive" role="alert">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
        {t("create")}
      </Button>
    </form>
  );
}
