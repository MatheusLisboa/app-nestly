"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  createInventoryItemAction,
  deleteInventoryItemAction,
  restockToShoppingAction,
  updateInventoryQuantityAction,
} from "@/features/inventory/actions/inventory-actions";
import {
  type CreateInventoryItemInput,
  createInventoryItemSchema,
} from "@/features/inventory/schemas/inventory";
import type {
  InventoryItemView,
  InventoryLocationView,
} from "@/features/inventory/services/inventory-service";
import { Badge, Button, EmptyState, Icon, Input, Label, toast } from "@/features/shared";
import { cn } from "@/lib/utils";

interface InventoryPanelProps {
  items: InventoryItemView[];
  locations: InventoryLocationView[];
  canWrite: boolean;
}

export function InventoryPanel({ items, locations, canWrite }: InventoryPanelProps) {
  const t = useTranslations("inventory");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lowCount = items.filter((item) => item.isLow).length;

  const form = useForm<CreateInventoryItemInput>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "un",
      minQuantity: 1,
      locationId: locations[0]?.id,
    },
  });

  async function onCreate(values: CreateInventoryItemInput) {
    const result = await createInventoryItemAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({
      name: "",
      quantity: 1,
      unit: "un",
      minQuantity: 1,
      locationId: locations[0]?.id,
    });
    toast.success(t("created"));
    router.refresh();
  }

  function bumpQuantity(item: InventoryItemView, delta: number) {
    const next = Math.max(0, Number(item.quantity) + delta);
    startTransition(async () => {
      const result = await updateInventoryQuantityAction({
        itemId: item.id,
        quantity: next,
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
      const result = await deleteInventoryItemAction({ itemId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  function onRestock(itemId: string) {
    startTransition(async () => {
      const result = await restockToShoppingAction({ itemId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("addedToShopping"));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("summary", { total: items.length, low: lowCount })}
          </p>
        </div>
      </div>

      {canWrite ? (
        <form
          className="space-y-3 rounded-2xl border border-border bg-card/70 p-4 shadow-xs"
          onSubmit={form.handleSubmit(onCreate)}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="inv-name">{t("nameLabel")}</Label>
              <Input id="inv-name" placeholder={t("namePlaceholder")} {...form.register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-qty">{t("quantityLabel")}</Label>
              <Input id="inv-qty" type="number" step="any" {...form.register("quantity")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-min">{t("minLabel")}</Label>
              <Input id="inv-min" type="number" step="any" {...form.register("minQuantity")} />
            </div>
          </div>
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
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium tracking-tight">{item.name}</p>
                  {item.isLow ? <Badge variant="warning">{t("lowStock")}</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[item.locationName, `${item.quantity} ${item.unit}`].filter(Boolean).join(" · ")}
                </p>
              </div>

              {canWrite ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={pending}
                    onClick={() => bumpQuantity(item, -1)}
                    aria-label={t("decrease")}
                  >
                    <Icon icon={Minus} size="xs" />
                  </Button>
                  <span
                    className={cn(
                      "min-w-10 text-center text-sm font-medium tabular-nums",
                      item.isLow && "text-warning",
                    )}
                  >
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={pending}
                    onClick={() => bumpQuantity(item, 1)}
                    aria-label={t("increase")}
                  >
                    <Icon icon={Plus} size="xs" />
                  </Button>
                  {item.isLow ? (
                    <Button
                      type="button"
                      variant="soft"
                      size="sm"
                      disabled={pending}
                      onClick={() => onRestock(item.id)}
                    >
                      <Icon icon={ShoppingCart} size="xs" />
                      {t("restock")}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    onClick={() => onDelete(item.id)}
                    aria-label={t("delete")}
                  >
                    <Icon icon={Trash2} size="xs" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
