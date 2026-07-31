"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Badge, Button, Checkbox, EmptyState, Icon, Input, toast } from "@/features/shared";
import {
  addShoppingItemAction,
  clearCheckedAction,
  deleteShoppingItemAction,
  toggleShoppingItemAction,
} from "@/features/shopping/actions/shopping-actions";
import {
  type AddShoppingItemInput,
  addShoppingItemSchema,
} from "@/features/shopping/schemas/shopping";
import type {
  ShoppingItemView,
  ShoppingListView,
} from "@/features/shopping/services/shopping-service";
import { cn } from "@/lib/utils";

interface ShoppingListViewProps {
  list: ShoppingListView;
  items: ShoppingItemView[];
  canWrite: boolean;
}

export function ShoppingListPanel({ list, items, canWrite }: ShoppingListViewProps) {
  const t = useTranslations("shopping");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unchecked = items.filter((item) => !item.checked);
  const checked = items.filter((item) => item.checked);

  const form = useForm<AddShoppingItemInput>({
    resolver: zodResolver(addShoppingItemSchema),
    defaultValues: {
      listId: list.id,
      name: "",
      quantity: 1,
      unit: "un",
    },
  });

  async function onAdd(values: AddShoppingItemInput) {
    const result = await addShoppingItemAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({ listId: list.id, name: "", quantity: 1, unit: "un" });
    router.refresh();
  }

  function onToggle(item: ShoppingItemView) {
    startTransition(async () => {
      const result = await toggleShoppingItemAction({
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

  function onDelete(itemId: string) {
    startTransition(async () => {
      const result = await deleteShoppingItemAction({ itemId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  function onClearChecked() {
    startTransition(async () => {
      const result = await clearCheckedAction({ listId: list.id });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("cleared", { count: result.data.count }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{list.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t("summary", { open: unchecked.length, done: checked.length })}
          </p>
        </div>
        {canWrite && checked.length > 0 ? (
          <Button variant="outline" size="sm" disabled={pending} onClick={onClearChecked}>
            {t("clearChecked")}
          </Button>
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
            {...form.register("name")}
          />
          <Input
            type="number"
            step="any"
            className="w-full sm:w-24"
            disabled={form.formState.isSubmitting}
            {...form.register("quantity")}
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
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="space-y-6">
          <ItemGroup
            title={t("toBuy")}
            items={unchecked}
            canWrite={canWrite}
            pending={pending}
            onToggle={onToggle}
            onDelete={onDelete}
          />
          {checked.length > 0 ? (
            <ItemGroup
              title={t("bought")}
              items={checked}
              canWrite={canWrite}
              pending={pending}
              onToggle={onToggle}
              onDelete={onDelete}
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
  items: ShoppingItemView[];
  canWrite: boolean;
  pending: boolean;
  onToggle: (item: ShoppingItemView) => void;
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
              aria-label={item.name}
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium tracking-tight",
                  item.checked && "text-muted-foreground line-through",
                )}
              >
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} {item.unit}
              </p>
            </div>
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
