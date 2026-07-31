"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  createBillAction,
  deleteBillAction,
  markBillPaidAction,
} from "@/features/bills/actions/bills-actions";
import { type CreateBillInput, createBillSchema } from "@/features/bills/schemas/bills";
import type { BillDueStatus, BillView } from "@/features/bills/services/bills-service";
import { Badge, Button, EmptyState, Icon, Input, toast } from "@/features/shared";
import { cn } from "@/lib/utils";

interface BillsPanelProps {
  bills: BillView[];
  canWrite: boolean;
}

function formatMoney(amount: string, currency: string) {
  const value = Number(amount);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(isoDate: string) {
  const parts = isoDate.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
}

export function BillsPanel({ bills, canWrite }: BillsPanelProps) {
  const t = useTranslations("bills");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const attention = bills.filter(
    (bill) => bill.dueStatus === "overdue" || bill.dueStatus === "due",
  );
  const upcoming = bills.filter((bill) => bill.dueStatus === "upcoming");
  const paid = bills.filter((bill) => bill.dueStatus === "paid");

  const form = useForm<CreateBillInput>({
    resolver: zodResolver(createBillSchema),
    defaultValues: {
      title: "",
      amount: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      category: "",
      recurrence: "monthly",
    },
  });

  async function onCreate(values: CreateBillInput) {
    const result = await createBillAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({
      title: "",
      amount: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      category: "",
      recurrence: "monthly",
    });
    toast.success(t("created"));
    router.refresh();
  }

  function onPay(billId: string) {
    startTransition(async () => {
      const result = await markBillPaidAction({ billId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("paid"));
      router.refresh();
    });
  }

  function onDelete(billId: string) {
    startTransition(async () => {
      const result = await deleteBillAction({ billId });
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
          {t("summary", { overdue: attention.length, total: bills.length })}
        </p>
      </div>

      {canWrite ? (
        <form
          className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,9rem)_8rem_auto]"
          onSubmit={form.handleSubmit(onCreate)}
        >
          <Input
            placeholder={t("titlePlaceholder")}
            className="min-w-0"
            disabled={form.formState.isSubmitting}
            {...form.register("title")}
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder={t("amountPlaceholder")}
            className="min-w-0"
            disabled={form.formState.isSubmitting}
            {...form.register("amount")}
          />
          <Input
            type="date"
            className="min-w-0"
            disabled={form.formState.isSubmitting}
            {...form.register("dueDate")}
          />
          <select
            className="h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm"
            disabled={form.formState.isSubmitting}
            {...form.register("recurrence")}
          >
            <option value="monthly">{t("recurrence.monthly")}</option>
            <option value="yearly">{t("recurrence.yearly")}</option>
            <option value="once">{t("recurrence.once")}</option>
          </select>
          <Button type="submit" disabled={form.formState.isSubmitting} className="sm:w-auto">
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Icon icon={Plus} />
            )}
            {t("add")}
          </Button>
        </form>
      ) : null}

      {bills.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="space-y-6">
          <BillGroup
            title={t("needsAttention")}
            bills={attention}
            canWrite={canWrite}
            pending={pending}
            onPay={onPay}
            onDelete={onDelete}
          />
          <BillGroup
            title={t("upcoming")}
            bills={upcoming}
            canWrite={canWrite}
            pending={pending}
            onPay={onPay}
            onDelete={onDelete}
          />
          <BillGroup
            title={t("paidSection")}
            bills={paid}
            canWrite={canWrite}
            pending={pending}
            onPay={onPay}
            onDelete={onDelete}
            muted
          />
        </div>
      )}
    </div>
  );
}

function BillGroup({
  title,
  bills,
  canWrite,
  pending,
  onPay,
  onDelete,
  muted,
}: {
  title: string;
  bills: BillView[];
  canWrite: boolean;
  pending: boolean;
  onPay: (id: string) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  const t = useTranslations("bills");
  if (bills.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </h2>
        <Badge variant="secondary">{bills.length}</Badge>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
        {bills.map((bill) => (
          <li
            key={bill.id}
            className={cn(
              "flex flex-col gap-3 px-4 py-3 transition-soft sm:flex-row sm:items-center",
              muted && "opacity-75",
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Icon icon={Wallet} size="sm" className="mt-0.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium tracking-tight">{bill.title}</p>
                  <StatusBadge status={bill.dueStatus} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[
                    formatMoney(bill.amount, bill.currency),
                    bill.dueStatus === "paid" && bill.recurrence !== "once"
                      ? t("nextDue", { date: formatDate(bill.dueDate) })
                      : t("dueOn", { date: formatDate(bill.dueDate) }),
                    t(`recurrence.${bill.recurrence}`),
                    bill.category,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {canWrite ? (
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                {bill.dueStatus === "paid" ? null : (
                  <Button type="button" size="sm" disabled={pending} onClick={() => onPay(bill.id)}>
                    {t("markPaid")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => onDelete(bill.id)}
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

function StatusBadge({ status }: { status: BillDueStatus }) {
  const t = useTranslations("bills");
  if (status === "overdue") return <Badge variant="destructive">{t("status.overdue")}</Badge>;
  if (status === "due") return <Badge variant="warning">{t("status.due")}</Badge>;
  if (status === "paid") return <Badge variant="success">{t("status.paid")}</Badge>;
  return <Badge variant="outline">{t("status.upcoming")}</Badge>;
}
