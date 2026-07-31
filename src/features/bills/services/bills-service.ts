import type { BillRecurrence } from "@/features/bills/schemas/bills";
import { DomainError } from "@/lib/errors";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type BillDueStatus = "overdue" | "due" | "upcoming" | "paid";

export type BillView = {
  id: string;
  title: string;
  amount: string;
  currency: string;
  category: string | null;
  dueDate: string;
  recurrence: BillRecurrence;
  status: "pending" | "paid";
  dueStatus: BillDueStatus;
  notes: string | null;
  paidAt: string | null;
  updatedAt: string;
};

function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeDate(value: string): string {
  return value.slice(0, 10);
}

function computeDueStatus(
  dueDate: string,
  status: "pending" | "paid",
  recurrence: BillRecurrence,
  now = new Date(),
): BillDueStatus {
  const due = normalizeDate(dueDate);
  const today = todayIsoDate(now);

  if (status === "paid") {
    if (recurrence === "once") return "paid";
    // Recurring: due_date points to the *next* cycle after payment.
    if (due > today) return "paid";
  }

  if (due < today) return "overdue";
  if (due === today) return "due";
  return "upcoming";
}

function addRecurrence(dueDate: string, recurrence: BillRecurrence): string {
  const due = normalizeDate(dueDate);
  const parts = due.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const date = new Date(Date.UTC(y, m - 1, d));

  if (recurrence === "monthly") {
    date.setUTCMonth(date.getUTCMonth() + 1);
  } else if (recurrence === "yearly") {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
  }

  return date.toISOString().slice(0, 10);
}

function sortBills(a: BillView, b: BillView): number {
  const rank: Record<BillDueStatus, number> = {
    overdue: 0,
    due: 1,
    upcoming: 2,
    paid: 3,
  };
  const byStatus = rank[a.dueStatus] - rank[b.dueStatus];
  if (byStatus !== 0) return byStatus;
  return a.dueDate.localeCompare(b.dueDate);
}

function toView(row: {
  id: string;
  title: string;
  amount: string | number;
  currency: string;
  category: string | null;
  due_date: string;
  recurrence: string;
  status: string;
  notes: string | null;
  paid_at: string | null;
  updated_at: string;
}): BillView {
  const status = row.status as "pending" | "paid";
  const recurrence = row.recurrence as BillRecurrence;
  return {
    id: row.id,
    title: row.title,
    amount: String(row.amount),
    currency: row.currency,
    category: row.category,
    dueDate: normalizeDate(row.due_date),
    recurrence,
    status,
    dueStatus: computeDueStatus(row.due_date, status, recurrence),
    notes: row.notes,
    paidAt: row.paid_at,
    updatedAt: row.updated_at,
  };
}

export async function listBills(): Promise<BillView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("bills.read");

  const { data, error } = await supabase
    .from("bills")
    .select(
      "id, title, amount, currency, category, due_date, recurrence, status, notes, paid_at, updated_at",
    )
    .eq("workspace_id", workspace.id)
    .order("due_date", { ascending: true });

  if (error) {
    throw new DomainError("BILLS_LIST_FAILED", error.message);
  }

  return (data ?? []).map(toView).sort(sortBills);
}

export async function createBill(input: {
  title: string;
  amount: number;
  dueDate: string;
  category?: string;
  recurrence: BillRecurrence;
}): Promise<BillView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("bills.write");

  const { data, error } = await supabase
    .from("bills")
    .insert({
      workspace_id: workspace.id,
      title: input.title,
      amount: input.amount.toFixed(2),
      due_date: input.dueDate,
      category: input.category || null,
      recurrence: input.recurrence,
      status: "pending",
      created_by: user.id,
    })
    .select(
      "id, title, amount, currency, category, due_date, recurrence, status, notes, paid_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DomainError("BILL_CREATE_FAILED", error?.message ?? "Falha ao criar conta.");
  }

  return toView(data);
}

export async function markBillPaid(billId: string): Promise<BillView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("bills.write");
  const paidAt = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from("bills")
    .select(
      "id, title, amount, currency, category, due_date, recurrence, status, notes, paid_at, updated_at",
    )
    .eq("workspace_id", workspace.id)
    .eq("id", billId)
    .maybeSingle();

  if (fetchError || !existing) {
    throw new DomainError("BILL_NOT_FOUND", fetchError?.message ?? "Conta não encontrada.");
  }

  const recurrence = existing.recurrence as BillRecurrence;
  const currentDue = normalizeDate(existing.due_date);
  const nextDue = recurrence === "once" ? currentDue : addRecurrence(currentDue, recurrence);

  const { data, error } = await supabase
    .from("bills")
    .update({
      status: "paid",
      paid_at: paidAt,
      due_date: nextDue,
      updated_at: paidAt,
    })
    .eq("id", billId)
    .eq("workspace_id", workspace.id)
    .select(
      "id, title, amount, currency, category, due_date, recurrence, status, notes, paid_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DomainError("BILL_PAY_FAILED", error?.message ?? "Falha ao marcar como paga.");
  }

  return toView(data);
}

export async function deleteBill(billId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("bills.write");

  const { error } = await supabase
    .from("bills")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", billId);

  if (error) {
    throw new DomainError("BILL_DELETE_FAILED", error.message);
  }
}
