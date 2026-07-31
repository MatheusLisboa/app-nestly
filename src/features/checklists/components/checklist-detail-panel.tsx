"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  addChecklistItemAction,
  deleteChecklistAction,
  deleteChecklistItemAction,
  resetChecklistAction,
  toggleChecklistItemAction,
} from "@/features/checklists/actions/checklists-actions";
import {
  type AddChecklistItemInput,
  addChecklistItemSchema,
} from "@/features/checklists/schemas/checklists";
import type {
  ChecklistItemView,
  ChecklistView,
} from "@/features/checklists/services/checklists-service";
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Icon,
  Input,
  Progress,
  toast,
} from "@/features/shared";
import { cn } from "@/lib/utils";

interface ChecklistDetailPanelProps {
  checklist: ChecklistView;
  items: ChecklistItemView[];
  canWrite: boolean;
}

export function ChecklistDetailPanel({ checklist, items, canWrite }: ChecklistDetailPanelProps) {
  const t = useTranslations("checklists");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unchecked = items.filter((item) => !item.checked);
  const checked = items.filter((item) => item.checked);
  const progress = items.length === 0 ? 0 : Math.round((checked.length / items.length) * 100);

  const form = useForm<AddChecklistItemInput>({
    resolver: zodResolver(addChecklistItemSchema),
    defaultValues: {
      checklistId: checklist.id,
      title: "",
    },
  });

  async function onAdd(values: AddChecklistItemInput) {
    const result = await addChecklistItemAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({ checklistId: checklist.id, title: "" });
    router.refresh();
  }

  function onToggle(item: ChecklistItemView) {
    startTransition(async () => {
      const result = await toggleChecklistItemAction({
        itemId: item.id,
        checked: !item.checked,
      });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  function onDeleteItem(itemId: string) {
    startTransition(async () => {
      const result = await deleteChecklistItemAction({ itemId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  function onReset() {
    startTransition(async () => {
      const result = await resetChecklistAction({ checklistId: checklist.id });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("resetDone", { count: result.data.count }));
      router.refresh();
    });
  }

  function onDeleteChecklist() {
    if (!window.confirm(t("deleteConfirm"))) return;

    startTransition(async () => {
      const result = await deleteChecklistAction({ checklistId: checklist.id });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("deleted"));
      router.push("/checklists");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/checklists"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-soft hover:text-foreground"
        >
          <Icon icon={ArrowLeft} size="xs" />
          {t("back")}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{checklist.title}</h1>
            {checklist.description ? (
              <p className="text-sm text-muted-foreground">{checklist.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("summary", { open: unchecked.length, done: checked.length })}
              </p>
            )}
          </div>
          {canWrite ? (
            <div className="flex flex-wrap gap-2">
              {checked.length > 0 ? (
                <Button variant="outline" size="sm" disabled={pending} onClick={onReset}>
                  <Icon icon={RotateCcw} size="xs" />
                  {t("reset")}
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" disabled={pending} onClick={onDeleteChecklist}>
                <Icon icon={Trash2} size="xs" />
                {t("delete")}
              </Button>
            </div>
          ) : null}
        </div>

        {items.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("progressLabel", { done: checked.length, total: items.length })}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        ) : null}
      </div>

      {canWrite ? (
        <form
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:flex-row sm:items-center"
          onSubmit={form.handleSubmit(onAdd)}
        >
          <Input
            placeholder={t("addPlaceholder")}
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
            {t("add")}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title={t("itemsEmptyTitle")} description={t("itemsEmptyDescription")} />
      ) : (
        <div className="space-y-6">
          <ItemGroup
            title={t("open")}
            items={unchecked}
            canWrite={canWrite}
            pending={pending}
            onToggle={onToggle}
            onDelete={onDeleteItem}
          />
          {checked.length > 0 ? (
            <ItemGroup
              title={t("done")}
              items={checked}
              canWrite={canWrite}
              pending={pending}
              onToggle={onToggle}
              onDelete={onDeleteItem}
              muted
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ItemGroup({
  title,
  items,
  canWrite,
  pending,
  onToggle,
  onDelete,
  muted,
}: {
  title: string;
  items: ChecklistItemView[];
  canWrite: boolean;
  pending: boolean;
  onToggle: (item: ChecklistItemView) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h2>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition-soft",
              muted && "opacity-70",
            )}
          >
            <Checkbox
              checked={item.checked}
              disabled={!canWrite || pending}
              onCheckedChange={() => onToggle(item)}
              aria-label={item.title}
            />
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm font-medium tracking-tight",
                item.checked && "text-muted-foreground line-through",
              )}
            >
              {item.title}
            </p>
            {canWrite ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={() => onDelete(item.id)}
                aria-label="Remover"
              >
                <Icon icon={Trash2} size="xs" />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
