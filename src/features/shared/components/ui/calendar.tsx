"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Icon } from "./icon";

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

export function Calendar({
  value,
  onChange,
  className,
  month: controlledMonth,
  onMonthChange,
}: CalendarProps) {
  const [uncontrolledMonth, setUncontrolledMonth] = useState(value ?? new Date());
  const month = controlledMonth ?? uncontrolledMonth;

  function setMonth(next: Date) {
    onMonthChange?.(next);
    if (!controlledMonth) setUncontrolledMonth(next);
  }

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const weekdays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 0 }) }).map((day) =>
      format(day, "EEEEEE", { locale: ptBR }),
    );
  }, []);

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xs",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mês anterior"
          onClick={() => setMonth(subMonths(month, 1))}
        >
          <Icon icon={ChevronLeft} />
        </Button>
        <p className="text-sm font-semibold capitalize tracking-tight">
          {format(month, "MMMM yyyy", { locale: ptBR })}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Próximo mês"
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <Icon icon={ChevronRight} />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdays.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const selected = value ? isSameDay(day, value) : false;
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onChange?.(day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-sm tracking-tight transition-soft",
                !inMonth && "text-muted-foreground/40",
                inMonth && "text-foreground hover:bg-muted",
                today && !selected && "ring-1 ring-primary/40",
                selected && "bg-primary text-primary-foreground shadow-xs hover:bg-primary",
              )}
              aria-pressed={selected}
              data-selected={selected || undefined}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
