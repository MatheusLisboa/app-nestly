"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquare, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { createChecklistAction } from "@/features/checklists/actions/checklists-actions";
import {
  type CreateChecklistInput,
  createChecklistSchema,
} from "@/features/checklists/schemas/checklists";
import type { ChecklistView } from "@/features/checklists/services/checklists-service";
import { Badge, Button, EmptyState, Icon, Input, Progress, toast } from "@/features/shared";

interface ChecklistsHomeProps {
  checklists: ChecklistView[];
  canWrite: boolean;
}

export function ChecklistsHome({ checklists, canWrite }: ChecklistsHomeProps) {
  const t = useTranslations("checklists");
  const router = useRouter();

  const form = useForm<CreateChecklistInput>({
    resolver: zodResolver(createChecklistSchema),
    defaultValues: { title: "", description: "" },
  });

  async function onCreate(values: CreateChecklistInput) {
    const result = await createChecklistAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({ title: "", description: "" });
    toast.success(t("created"));
    router.push(`/checklists/${result.data.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {canWrite ? (
        <form
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:flex-row sm:items-center"
          onSubmit={form.handleSubmit(onCreate)}
        >
          <Input
            placeholder={t("createPlaceholder")}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            disabled={form.formState.isSubmitting}
            {...form.register("title")}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Icon icon={Plus} />
            )}
            {t("create")}
          </Button>
        </form>
      ) : null}

      {checklists.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <ul className="space-y-2">
          {checklists.map((checklist) => {
            const progress =
              checklist.itemCount === 0
                ? 0
                : Math.round((checklist.checkedCount / checklist.itemCount) * 100);

            return (
              <li key={checklist.id}>
                <Link
                  href={`/checklists/${checklist.id}`}
                  className="block rounded-2xl border border-border bg-card/60 p-4 shadow-xs transition-soft hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon icon={CheckSquare} size="sm" className="text-muted-foreground" />
                        <p className="truncate text-sm font-medium tracking-tight">
                          {checklist.title}
                        </p>
                      </div>
                      {checklist.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {checklist.description}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">
                      {t("progressLabel", {
                        done: checklist.checkedCount,
                        total: checklist.itemCount,
                      })}
                    </Badge>
                  </div>
                  {checklist.itemCount > 0 ? (
                    <Progress value={progress} className="mt-3 h-1.5" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
