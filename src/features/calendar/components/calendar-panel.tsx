"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  createCalendarEventAction,
  deleteCalendarEventAction,
} from "@/features/calendar/actions/calendar-actions";
import {
  type CreateCalendarEventInput,
  createCalendarEventSchema,
} from "@/features/calendar/schemas/calendar";
import type { CalendarEventView } from "@/features/calendar/services/calendar-service";
import { Badge, Button, Calendar, EmptyState, Icon, Input, toast } from "@/features/shared";

interface CalendarPanelProps {
  events: CalendarEventView[];
  canWrite: boolean;
}

type EventGroup = {
  key: string;
  label: string;
  events: CalendarEventView[];
};

export function CalendarPanel({ events, canWrite }: CalendarPanelProps) {
  const t = useTranslations("calendar");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(() => new Date());

  const dayEvents = useMemo(
    () => events.filter((event) => isSameDay(parseISO(event.startsAt), selected)),
    [events, selected],
  );

  const upcomingGroups = useMemo(() => {
    const today = startOfDay(new Date());
    const upcoming = events
      .filter((event) => !isBefore(parseISO(event.startsAt), today))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    const groups = new Map<string, EventGroup>();
    for (const event of upcoming) {
      const key = format(parseISO(event.startsAt), "yyyy-MM-dd");
      const existing = groups.get(key);
      if (existing) {
        existing.events.push(event);
        continue;
      }
      groups.set(key, {
        key,
        label: format(parseISO(event.startsAt), "EEEE, d MMM", { locale: ptBR }),
        events: [event],
      });
    }
    return Array.from(groups.values());
  }, [events]);

  const form = useForm<CreateCalendarEventInput>({
    resolver: zodResolver(createCalendarEventSchema),
    defaultValues: {
      title: "",
      startsAt: `${format(selected, "yyyy-MM-dd")}T09:00`,
      allDay: false,
      location: "",
      notes: "",
    },
  });

  async function onCreate(values: CreateCalendarEventInput) {
    const result = await createCalendarEventAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({
      title: "",
      startsAt: `${format(selected, "yyyy-MM-dd")}T09:00`,
      allDay: false,
      location: "",
      notes: "",
    });
    toast.success(t("created"));
    router.refresh();
  }

  function onDelete(eventId: string) {
    startTransition(async () => {
      const result = await deleteCalendarEventAction({ eventId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  function onSelectDay(date: Date) {
    setSelected(date);
    form.setValue("startsAt", `${format(date, "yyyy-MM-dd")}T09:00`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("summary", { count: events.length })}</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t("upcomingTitle")}
          </h2>
          <Badge variant="secondary">
            {upcomingGroups.reduce((n, g) => n + g.events.length, 0)}
          </Badge>
        </div>

        {upcomingGroups.length === 0 ? (
          <EmptyState title={t("upcomingEmptyTitle")} description={t("upcomingEmptyDescription")} />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
            {upcomingGroups.map((group) => (
              <li key={group.key}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground transition-soft hover:bg-muted/40"
                  onClick={() => onSelectDay(parseISO(`${group.key}T12:00:00`))}
                >
                  {group.label}
                </button>
                <ul>
                  {group.events.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center gap-3 border-t border-border/70 px-4 py-3"
                    >
                      <Icon icon={CalendarDays} size="sm" className="text-muted-foreground" />
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => onSelectDay(parseISO(event.startsAt))}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium tracking-tight">
                            {event.title}
                          </p>
                          {event.allDay ? <Badge variant="secondary">{t("allDay")}</Badge> : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {[
                            event.allDay ? t("allDay") : format(parseISO(event.startsAt), "HH:mm"),
                            event.location,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </button>
                      {canWrite ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          onClick={() => onDelete(event.id)}
                          aria-label={t("delete")}
                        >
                          <Icon icon={Trash2} size="xs" />
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-3">
          <Calendar value={selected} onChange={onSelectDay} className="w-full" />
          <p className="text-xs text-muted-foreground">
            {t("selectedDay", {
              date: format(selected, "EEEE, d MMMM", { locale: ptBR }),
            })}
          </p>
        </div>

        <div className="space-y-4">
          {canWrite ? (
            <form
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs"
              onSubmit={form.handleSubmit(onCreate)}
            >
              <Input
                placeholder={t("titlePlaceholder")}
                disabled={form.formState.isSubmitting}
                {...form.register("title")}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  type="datetime-local"
                  disabled={form.formState.isSubmitting}
                  {...form.register("startsAt")}
                />
                <Input
                  placeholder={t("locationPlaceholder")}
                  disabled={form.formState.isSubmitting}
                  {...form.register("location")}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.watch("allDay")}
                  onChange={(event) => form.setValue("allDay", event.target.checked)}
                />
                {t("allDay")}
              </label>
              <Button type="submit" disabled={form.formState.isSubmitting} className="self-start">
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Icon icon={Plus} />
                )}
                {t("add")}
              </Button>
            </form>
          ) : null}

          <div className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {t("dayTitle")}
            </h2>
            {dayEvents.length === 0 ? (
              <EmptyState title={t("emptyDayTitle")} description={t("emptyDayDescription")} />
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
                {dayEvents.map((event) => (
                  <li key={event.id} className="flex items-center gap-3 px-4 py-3">
                    <Icon icon={CalendarDays} size="sm" className="text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium tracking-tight">{event.title}</p>
                        {event.allDay ? <Badge variant="secondary">{t("allDay")}</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {[
                          event.allDay ? t("allDay") : format(parseISO(event.startsAt), "HH:mm"),
                          event.location,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {canWrite ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        onClick={() => onDelete(event.id)}
                        aria-label={t("delete")}
                      >
                        <Icon icon={Trash2} size="xs" />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
