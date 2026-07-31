"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  completeCleaningTaskAction,
  createCleaningTaskAction,
  deleteCleaningTaskAction,
} from "@/features/cleaning/actions/cleaning-actions";
import {
  type CreateCleaningTaskInput,
  createCleaningTaskSchema,
} from "@/features/cleaning/schemas/cleaning";
import type {
  CleaningDueStatus,
  CleaningTaskView,
} from "@/features/cleaning/services/cleaning-service";
import { Badge, Button, EmptyState, Icon, Input, toast } from "@/features/shared";
import { cn } from "@/lib/utils";

interface CleaningPanelProps {
  tasks: CleaningTaskView[];
  canWrite: boolean;
}

export function CleaningPanel({ tasks, canWrite }: CleaningPanelProps) {
  const t = useTranslations("cleaning");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const overdue = tasks.filter(
    (task) => task.dueStatus === "overdue" || task.dueStatus === "never",
  );
  const due = tasks.filter((task) => task.dueStatus === "due");
  const ok = tasks.filter((task) => task.dueStatus === "ok");

  const form = useForm<CreateCleaningTaskInput>({
    resolver: zodResolver(createCleaningTaskSchema),
    defaultValues: {
      title: "",
      area: "",
      frequency: "weekly",
    },
  });

  async function onCreate(values: CreateCleaningTaskInput) {
    const result = await createCleaningTaskAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({ title: "", area: "", frequency: "weekly" });
    toast.success(t("created"));
    router.refresh();
  }

  function onComplete(taskId: string) {
    startTransition(async () => {
      const result = await completeCleaningTaskAction({ taskId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("completed"));
      router.refresh();
    });
  }

  function onDelete(taskId: string) {
    startTransition(async () => {
      const result = await deleteCleaningTaskAction({ taskId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("summary", { overdue: overdue.length, total: tasks.length })}
        </p>
      </div>

      {canWrite ? (
        <form
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:flex-row sm:items-center"
          onSubmit={form.handleSubmit(onCreate)}
        >
          <Input
            placeholder={t("titlePlaceholder")}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            disabled={form.formState.isSubmitting}
            {...form.register("title")}
          />
          <Input
            placeholder={t("areaPlaceholder")}
            className="w-full sm:w-36"
            disabled={form.formState.isSubmitting}
            {...form.register("area")}
          />
          <select
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm sm:w-36"
            disabled={form.formState.isSubmitting}
            {...form.register("frequency")}
          >
            <option value="daily">{t("frequency.daily")}</option>
            <option value="weekly">{t("frequency.weekly")}</option>
            <option value="biweekly">{t("frequency.biweekly")}</option>
            <option value="monthly">{t("frequency.monthly")}</option>
          </select>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Icon icon={Plus} />
            )}
            {t("add")}
          </Button>
        </form>
      ) : null}

      {tasks.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="space-y-6">
          <TaskGroup
            title={t("needsAttention")}
            tasks={[...overdue, ...due]}
            canWrite={canWrite}
            pending={pending}
            onComplete={onComplete}
            onDelete={onDelete}
          />
          <TaskGroup
            title={t("upToDate")}
            tasks={ok}
            canWrite={canWrite}
            pending={pending}
            onComplete={onComplete}
            onDelete={onDelete}
            muted
          />
        </div>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  canWrite,
  pending,
  onComplete,
  onDelete,
  muted,
}: {
  title: string;
  tasks: CleaningTaskView[];
  canWrite: boolean;
  pending: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  const t = useTranslations("cleaning");
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h2>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={cn(
              "flex flex-col gap-3 px-4 py-3 transition-soft sm:flex-row sm:items-center",
              muted && "opacity-80",
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Icon icon={Sparkles} size="sm" className="mt-0.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium tracking-tight">{task.title}</p>
                  <StatusBadge status={task.dueStatus} daysOverdue={task.daysOverdue} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    task.area,
                    t(`frequency.${task.frequency}`),
                    task.lastCleanedAt
                      ? t("lastCleaned", {
                          date: new Date(task.lastCleanedAt).toLocaleDateString("pt-BR"),
                        })
                      : t("neverCleaned"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {canWrite ? (
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                {task.dueStatus === "ok" ? null : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => onComplete(task.id)}
                  >
                    {t("markClean")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => onDelete(task.id)}
                  aria-label={t("delete")}
                >
                  <Icon icon={Trash2} size="xs" />
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusBadge({ status, daysOverdue }: { status: CleaningDueStatus; daysOverdue: number }) {
  const t = useTranslations("cleaning");

  if (status === "overdue") {
    return <Badge variant="destructive">{t("status.overdue", { days: daysOverdue })}</Badge>;
  }
  if (status === "never") {
    return <Badge variant="destructive">{t("status.never")}</Badge>;
  }
  if (status === "due") {
    return <Badge variant="secondary">{t("status.due")}</Badge>;
  }
  return <Badge variant="outline">{t("status.ok")}</Badge>;
}
