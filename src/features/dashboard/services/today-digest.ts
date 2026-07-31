import { listBabies } from "@/features/baby/services/baby-service";
import { listBills } from "@/features/bills/services/bills-service";
import { listCalendarEvents } from "@/features/calendar/services/calendar-service";
import { listCleaningTasks } from "@/features/cleaning/services/cleaning-service";
import {
  getActiveShoppingList,
  listShoppingItems,
} from "@/features/shopping/services/shopping-service";
import { formatDateTimePtBr } from "@/lib/utils/datetime";

export type TodayDigestItem = {
  id: string;
  href: string;
  title: string;
  meta?: string;
  tone: "urgent" | "today" | "soon" | "neutral";
};

export type TodayDigest = {
  shoppingOpen: number;
  shoppingPreview: TodayDigestItem[];
  billsAttention: TodayDigestItem[];
  cleaningAttention: TodayDigestItem[];
  upcomingEvents: TodayDigestItem[];
  baby: {
    name: string;
    status: "expected" | "born";
    headline: string;
    href: string;
  } | null;
  hasAnything: boolean;
};

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/**
 * Aggregates “what matters today” across modules for the home dashboard.
 * Failures in one module do not block the rest.
 *
 * Consultas/exames already sync into calendar_events — only the Agenda section
 * is shown so the same appointment is not listed twice.
 */
export async function getTodayDigest(): Promise<TodayDigest> {
  const now = Date.now();
  const weekAhead = addDaysIso(7);

  const [bills, cleaning, events, babies, shoppingList] = await Promise.all([
    safe(() => listBills(), []),
    safe(() => listCleaningTasks(), []),
    safe(
      () =>
        listCalendarEvents({
          from: new Date(now - 60 * 60 * 1000).toISOString(),
          to: weekAhead,
        }),
      [],
    ),
    safe(() => listBabies(), []),
    safe(() => getActiveShoppingList(), null),
  ]);

  const shoppingItems = shoppingList
    ? await safe(() => listShoppingItems(shoppingList.id), [])
    : [];

  const openShopping = shoppingItems.filter((item) => !item.checked);
  const shoppingPreview: TodayDigestItem[] = openShopping.slice(0, 6).map((item) => ({
    id: item.id,
    href: "/shopping",
    title: item.name,
    meta: item.quantity !== "1" || item.unit !== "un" ? `${item.quantity} ${item.unit}` : undefined,
    tone: "neutral",
  }));

  const billsAttention: TodayDigestItem[] = bills
    .filter((bill) => bill.dueStatus === "overdue" || bill.dueStatus === "due")
    .slice(0, 6)
    .map((bill) => ({
      id: bill.id,
      href: "/bills",
      title: bill.title,
      meta: `${bill.dueStatus === "overdue" ? "Atrasada" : "Vence hoje"} · ${formatShortDate(bill.dueDate)}`,
      tone: bill.dueStatus === "overdue" ? "urgent" : "today",
    }));

  // Also surface bills due in the next 7 days (not already listed).
  const upcomingBillIds = new Set(billsAttention.map((b) => b.id));
  for (const bill of bills) {
    if (billsAttention.length >= 8) break;
    if (upcomingBillIds.has(bill.id)) continue;
    if (bill.dueStatus !== "upcoming") continue;
    const due = new Date(`${bill.dueDate}T12:00:00`).getTime();
    if (due - now > 7 * 24 * 60 * 60 * 1000) continue;
    billsAttention.push({
      id: bill.id,
      href: "/bills",
      title: bill.title,
      meta: `Vence ${formatShortDate(bill.dueDate)}`,
      tone: "soon",
    });
    upcomingBillIds.add(bill.id);
  }

  const cleaningAttention: TodayDigestItem[] = cleaning
    .filter(
      (task) =>
        task.dueStatus === "overdue" || task.dueStatus === "due" || task.dueStatus === "never",
    )
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      href: "/cleaning",
      title: task.title,
      meta:
        task.dueStatus === "never"
          ? "Ainda não limpo"
          : task.dueStatus === "overdue"
            ? `${task.daysOverdue}d atrasado`
            : "Para hoje",
      tone: task.dueStatus === "overdue" ? "urgent" : task.dueStatus === "due" ? "today" : "soon",
    }));

  const upcomingEvents: TodayDigestItem[] = events
    .filter((event) => new Date(event.startsAt).getTime() >= now - 30 * 60 * 1000)
    .slice(0, 6)
    .map((event) => ({
      id: event.id,
      href: "/calendar",
      title: event.title,
      meta: formatDateTimePtBr(event.startsAt),
      tone: "soon",
    }));

  const baby = babies[0] ?? null;
  let babyCard: TodayDigest["baby"] = null;

  if (baby) {
    babyCard = {
      name: baby.name,
      status: baby.status,
      href: "/baby",
      headline:
        baby.status === "expected"
          ? baby.daysUntilDue != null
            ? baby.daysUntilDue <= 0
              ? "Previsão é hoje"
              : `Faltam ${baby.daysUntilDue} dia${baby.daysUntilDue === 1 ? "" : "s"}`
            : "Gestação em andamento"
          : baby.ageDays != null
            ? baby.ageDays === 0
              ? "Nasceu hoje"
              : `${baby.ageDays} dia${baby.ageDays === 1 ? "" : "s"} de vida`
            : "Acompanhando o bebê",
    };
  }

  const hasAnything =
    shoppingPreview.length > 0 ||
    billsAttention.length > 0 ||
    cleaningAttention.length > 0 ||
    upcomingEvents.length > 0 ||
    babyCard != null;

  return {
    shoppingOpen: openShopping.length,
    shoppingPreview,
    billsAttention,
    cleaningAttention,
    upcomingEvents,
    baby: babyCard,
    hasAnything,
  };
}
