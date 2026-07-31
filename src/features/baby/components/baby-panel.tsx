"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Baby,
  Backpack,
  Loader2,
  Moon,
  Pill,
  Plus,
  Shirt,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  addBabyCareLogAction,
  addBabyMedicalAppointmentAction,
  addBabyPrepItemAction,
  applySuggestedPrepAction,
  createBabyAction,
  deleteBabyCareLogAction,
  deleteBabyMedicalAppointmentAction,
  deleteBabyPrepItemAction,
  markBabyBornAction,
  toggleBabyPrepItemAction,
} from "@/features/baby/actions/baby-actions";
import {
  addBabyCareLogSchema,
  addBabyMedicalAppointmentSchema,
  addBabyPrepItemSchema,
  type BabyCareType,
  type BabyMedicalType,
  type BabyPrepCategory,
  babyMedicalTypes,
  babyPrepCategories,
  type CreateBabyInput,
  createBabySchema,
} from "@/features/baby/schemas/baby";
import type {
  BabyCareLogView,
  BabyCareSummary,
  BabyMedicalAppointmentView,
  BabyPrepItemView,
  BabyPrepProgress,
  BabyView,
} from "@/features/baby/services/baby-service";
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Icon,
  Input,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@/features/shared";

const logFormSchema = addBabyCareLogSchema.omit({ babyId: true });
type LogFormInput = { type: BabyCareType; detail?: string; notes?: string };

interface BabyPanelProps {
  baby: BabyView | null;
  logs: BabyCareLogView[];
  summary: BabyCareSummary | null;
  prep: BabyPrepProgress | null;
  appointments: BabyMedicalAppointmentView[];
  canWrite: boolean;
}

function relativeTime(iso: string | null) {
  if (!iso) return null;
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR });
}

function formatDate(iso: string) {
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function defaultMedicalScheduledLocal() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BabyPanel({ baby, logs, summary, prep, appointments, canWrite }: BabyPanelProps) {
  const t = useTranslations("baby");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const createForm = useForm<CreateBabyInput>({
    resolver: zodResolver(createBabySchema),
    defaultValues: {
      name: "",
      status: "expected",
      dueDate: "",
      birthDate: "",
    },
  });

  const statusWatch = createForm.watch("status");

  async function onCreateBaby(values: CreateBabyInput) {
    const result = await createBabyAction(values);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(t("babyCreated"));
    router.refresh();
  }

  if (!baby) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {canWrite ? (
          <form
            className="space-y-3 rounded-2xl border border-border bg-card/70 p-4 shadow-xs"
            onSubmit={createForm.handleSubmit(onCreateBaby)}
          >
            <Input
              placeholder={t("namePlaceholder")}
              disabled={createForm.formState.isSubmitting}
              {...createForm.register("name")}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={statusWatch === "expected" ? "default" : "outline"}
                size="sm"
                onClick={() => createForm.setValue("status", "expected")}
              >
                {t("status.expected")}
              </Button>
              <Button
                type="button"
                variant={statusWatch === "born" ? "default" : "outline"}
                size="sm"
                onClick={() => createForm.setValue("status", "born")}
              >
                {t("status.born")}
              </Button>
            </div>
            {statusWatch === "expected" ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("dueDateLabel")}</p>
                <Input type="date" {...createForm.register("dueDate")} />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("birthDateLabel")}</p>
                <Input type="date" {...createForm.register("birthDate")} />
              </div>
            )}
            <Button type="submit" disabled={createForm.formState.isSubmitting}>
              {createForm.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Icon icon={Plus} />
              )}
              {t("createBaby")}
            </Button>
          </form>
        ) : (
          <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
        )}
      </div>
    );
  }

  return (
    <BabyReadyPanel
      baby={baby}
      logs={logs}
      summary={summary}
      prep={prep}
      appointments={appointments}
      canWrite={canWrite}
      pending={pending}
      startTransition={startTransition}
    />
  );
}

function BabyReadyPanel({
  baby,
  logs,
  summary,
  prep,
  appointments,
  canWrite,
  pending,
  startTransition,
}: {
  baby: BabyView;
  logs: BabyCareLogView[];
  summary: BabyCareSummary | null;
  prep: BabyPrepProgress | null;
  appointments: BabyMedicalAppointmentView[];
  canWrite: boolean;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const t = useTranslations("baby");
  const router = useRouter();
  const defaultTab = baby.status === "born" ? "care" : "medical";
  const storageKey = `nestly:baby-tab:${baby.id}`;
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) setTab(stored);
    } catch {
      // ignore
    }
  }, [storageKey]);

  function onTabChange(next: string) {
    setTab(next);
    try {
      sessionStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }
  }

  const nextAppointment = appointments.find((item) => !item.isPast) ?? null;

  return (
    <div className="space-y-6">
      <header className="space-y-3 rounded-2xl border border-border bg-card/70 p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{baby.name}</h1>
              <Badge variant={baby.status === "born" ? "success" : "accent"}>
                {t(`status.${baby.status}`)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {baby.status === "expected"
                ? baby.dueDate
                  ? t("dueIn", {
                      date: formatDate(baby.dueDate),
                      days: baby.daysUntilDue ?? 0,
                    })
                  : t("dueMissing")
                : baby.birthDate
                  ? t("ageLabel", {
                      date: formatDate(baby.birthDate),
                      days: baby.ageDays ?? 0,
                    })
                  : t("subtitle")}
            </p>
            {nextAppointment ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-primary">
                <Icon icon={Stethoscope} size="sm" />
                {t("medicalNext", {
                  title: nextAppointment.title,
                  when: formatDateTime(nextAppointment.scheduledAt),
                })}
              </p>
            ) : null}
          </div>
          {canWrite && baby.status === "expected" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => {
                const birthDate = new Date().toISOString().slice(0, 10);
                startTransition(async () => {
                  const result = await markBabyBornAction({
                    babyId: baby.id,
                    birthDate,
                  });
                  if (!result.ok) {
                    toast.error(result.error.message);
                    return;
                  }
                  toast.success(t("markedBorn"));
                  router.refresh();
                });
              }}
            >
              {t("markBorn")}
            </Button>
          ) : null}
        </div>

        {prep ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {babyPrepCategories.map((category) => {
              const block = prep[category];
              const pct = block.total === 0 ? 0 : Math.round((block.done / block.total) * 100);
              return (
                <div key={category} className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{t(`prep.${category}`)}</span>
                    <span className="text-muted-foreground">
                      {block.done}/{block.total}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </div>
              );
            })}
          </div>
        ) : null}
      </header>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {baby.status === "born" ? <TabsTrigger value="care">{t("tabs.care")}</TabsTrigger> : null}
          <TabsTrigger value="medical">{t("tabs.medical")}</TabsTrigger>
          {babyPrepCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {t(`tabs.${category}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {baby.status === "born" ? (
          <TabsContent value="care">
            <CareTab
              baby={baby}
              logs={logs}
              summary={summary}
              canWrite={canWrite}
              pending={pending}
              startTransition={startTransition}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="medical">
          <MedicalTab
            babyId={baby.id}
            appointments={appointments}
            canWrite={canWrite}
            pending={pending}
            startTransition={startTransition}
          />
        </TabsContent>

        {prep
          ? babyPrepCategories.map((category) => (
              <TabsContent key={category} value={category}>
                <PrepTab
                  babyId={baby.id}
                  category={category}
                  items={prep[category].items}
                  canWrite={canWrite}
                  pending={pending}
                  startTransition={startTransition}
                />
              </TabsContent>
            ))
          : null}
      </Tabs>
    </div>
  );
}

function MedicalTab({
  babyId,
  appointments,
  canWrite,
  pending,
  startTransition,
}: {
  babyId: string;
  appointments: BabyMedicalAppointmentView[];
  canWrite: boolean;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const t = useTranslations("baby");
  const router = useRouter();

  const form = useForm<{
    type: BabyMedicalType;
    title: string;
    scheduledAt: string;
    location?: string;
    professional?: string;
    notes?: string;
  }>({
    resolver: zodResolver(addBabyMedicalAppointmentSchema.omit({ babyId: true })),
    defaultValues: {
      type: "consultation",
      title: "",
      scheduledAt: defaultMedicalScheduledLocal(),
      location: "",
      professional: "",
      notes: "",
    },
  });

  async function onAdd(values: {
    type: BabyMedicalType;
    title: string;
    scheduledAt: string;
    location?: string;
    professional?: string;
    notes?: string;
  }) {
    const result = await addBabyMedicalAppointmentAction({
      babyId,
      type: values.type,
      title: values.title,
      scheduledAt: values.scheduledAt,
      location: values.location || undefined,
      professional: values.professional || undefined,
      notes: values.notes || undefined,
    });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(t("medicalAdded"));
    form.reset({
      type: "consultation",
      title: "",
      scheduledAt: defaultMedicalScheduledLocal(),
      location: "",
      professional: "",
      notes: "",
    });
    router.refresh();
  }

  function onDelete(appointmentId: string) {
    startTransition(async () => {
      const result = await deleteBabyMedicalAppointmentAction({ appointmentId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("medicalRemoved"));
      router.refresh();
    });
  }

  const upcoming = appointments.filter((item) => !item.isPast);
  const past = appointments.filter((item) => item.isPast).reverse();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("medicalHint")}</p>

      {canWrite ? (
        <form
          className="space-y-3 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:p-4"
          onSubmit={form.handleSubmit(onAdd)}
        >
          <div className="flex flex-wrap gap-2">
            {babyMedicalTypes.map((type) => (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={form.watch("type") === type ? "default" : "outline"}
                onClick={() => form.setValue("type", type)}
              >
                {t(`medicalTypes.${type}`)}
              </Button>
            ))}
          </div>
          <Input placeholder={t("medicalTitlePlaceholder")} {...form.register("title")} />
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("medicalWhenLabel")}</p>
              <Input type="datetime-local" {...form.register("scheduledAt")} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("medicalLocationLabel")}</p>
              <Input placeholder={t("medicalLocationPlaceholder")} {...form.register("location")} />
            </div>
          </div>
          <Input
            placeholder={t("medicalProfessionalPlaceholder")}
            {...form.register("professional")}
          />
          <Input placeholder={t("medicalNotesPlaceholder")} {...form.register("notes")} />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Icon icon={Plus} />
            )}
            {t("medicalAdd")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("medicalCalendarNote")}</p>
        </form>
      ) : null}

      {appointments.length === 0 ? (
        <EmptyState title={t("medicalEmptyTitle")} description={t("medicalEmptyDescription")} />
      ) : (
        <div className="space-y-4">
          <MedicalGroup
            title={t("medicalUpcoming")}
            items={upcoming}
            canWrite={canWrite}
            pending={pending}
            onDelete={onDelete}
          />
          <MedicalGroup
            title={t("medicalPast")}
            items={past}
            canWrite={canWrite}
            pending={pending}
            onDelete={onDelete}
            muted
          />
        </div>
      )}
    </div>
  );
}

function MedicalGroup({
  title,
  items,
  canWrite,
  pending,
  onDelete,
  muted,
}: {
  title: string;
  items: BabyMedicalAppointmentView[];
  canWrite: boolean;
  pending: boolean;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  const t = useTranslations("baby");
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
            className={`flex items-start gap-3 px-4 py-3 ${muted ? "opacity-70" : ""}`}
          >
            <Icon icon={Stethoscope} size="sm" className="mt-0.5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{t(`medicalTypes.${item.type}`)}</Badge>
                <p className="text-sm font-semibold tracking-tight">{item.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(item.scheduledAt)}
                {item.location ? ` · ${item.location}` : ""}
                {item.professional ? ` · ${item.professional}` : ""}
              </p>
              {item.notes ? (
                <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>
              ) : null}
            </div>
            {canWrite ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                aria-label={t("delete")}
                onClick={() => onDelete(item.id)}
              >
                <Icon icon={Trash2} size="sm" />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CareTab({
  baby,
  logs,
  summary,
  canWrite,
  pending,
  startTransition,
}: {
  baby: BabyView;
  logs: BabyCareLogView[];
  summary: BabyCareSummary | null;
  canWrite: boolean;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const t = useTranslations("baby");
  const router = useRouter();

  const logForm = useForm<LogFormInput>({
    resolver: zodResolver(logFormSchema),
    defaultValues: { type: "feeding", detail: "", notes: "" },
  });

  async function onQuickLog(type: BabyCareType, detail?: string) {
    startTransition(async () => {
      const result = await addBabyCareLogAction({ babyId: baby.id, type, detail });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      toast.success(t("logged"));
      router.refresh();
    });
  }

  async function onAddLog(values: LogFormInput) {
    const result = await addBabyCareLogAction({ ...values, babyId: baby.id });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    logForm.reset({ type: "feeding", detail: "", notes: "" });
    toast.success(t("logged"));
    router.refresh();
  }

  function onDelete(logId: string) {
    startTransition(async () => {
      const result = await deleteBabyCareLogAction({ logId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {summary ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <SummaryCard
            label={t("lastFeeding")}
            value={relativeTime(summary.lastFeedingAt) ?? t("never")}
            count={summary.todayCounts.feeding}
            countLabel={t("todayCount")}
          />
          <SummaryCard
            label={t("lastDiaper")}
            value={relativeTime(summary.lastDiaperAt) ?? t("never")}
            count={summary.todayCounts.diaper}
            countLabel={t("todayCount")}
          />
          <SummaryCard
            label={t("lastSleep")}
            value={relativeTime(summary.lastSleepAt) ?? t("never")}
            count={summary.todayCounts.sleep}
            countLabel={t("todayCount")}
          />
        </div>
      ) : null}

      {canWrite ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={pending} onClick={() => onQuickLog("feeding")}>
            {t("quick.feeding")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onQuickLog("diaper", "wet")}
          >
            {t("quick.diaperWet")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onQuickLog("diaper", "dirty")}
          >
            {t("quick.diaperDirty")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onQuickLog("sleep")}
          >
            <Icon icon={Moon} size="xs" />
            {t("quick.sleep")}
          </Button>
        </div>
      ) : null}

      {canWrite ? (
        <form
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:flex-row sm:items-center"
          onSubmit={logForm.handleSubmit(onAddLog)}
        >
          <select
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm sm:w-40"
            {...logForm.register("type")}
          >
            <option value="feeding">{t("types.feeding")}</option>
            <option value="diaper">{t("types.diaper")}</option>
            <option value="sleep">{t("types.sleep")}</option>
            <option value="note">{t("types.note")}</option>
          </select>
          <Input
            placeholder={t("detailPlaceholder")}
            className="flex-1"
            {...logForm.register("detail")}
          />
          <Button type="submit" disabled={logForm.formState.isSubmitting}>
            {logForm.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Icon icon={Plus} />
            )}
            {t("add")}
          </Button>
        </form>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t("todayTitle")}
          </h2>
          <Badge variant="secondary">{logs.length}</Badge>
        </div>
        {logs.length === 0 ? (
          <EmptyState title={t("emptyLogsTitle")} description={t("emptyLogsDescription")} />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center gap-3 px-4 py-3">
                <Icon icon={Baby} size="sm" className="text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium tracking-tight">{t(`types.${log.type}`)}</p>
                    {log.detail ? <Badge variant="secondary">{log.detail}</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[
                      new Date(log.occurredAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      relativeTime(log.occurredAt),
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
                    onClick={() => onDelete(log.id)}
                    aria-label={t("delete")}
                  >
                    <Icon icon={Trash2} size="xs" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PrepTab({
  babyId,
  category,
  items,
  canWrite,
  pending,
  startTransition,
}: {
  babyId: string;
  category: BabyPrepCategory;
  items: BabyPrepItemView[];
  canWrite: boolean;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const t = useTranslations("baby");
  const router = useRouter();
  const icon =
    category === "enxoval"
      ? Shirt
      : category === "pharmacy"
        ? Pill
        : category === "items"
          ? Backpack
          : Baby;

  const form = useForm<{ title: string }>({
    resolver: zodResolver(addBabyPrepItemSchema.omit({ babyId: true, category: true })),
    defaultValues: { title: "" },
  });

  async function onAdd(values: { title: string }) {
    const result = await addBabyPrepItemAction({
      babyId,
      category,
      title: values.title,
    });
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    form.reset({ title: "" });
    router.refresh();
  }

  function onApplySuggestions() {
    startTransition(async () => {
      const result = await applySuggestedPrepAction({ babyId, category });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      if (result.data.added === 0) {
        toast.message(t("prepSuggestNone"));
      } else {
        toast.success(t("prepSuggestAdded", { count: result.data.added }));
      }
      router.refresh();
    });
  }

  function onToggle(item: BabyPrepItemView) {
    startTransition(async () => {
      const result = await toggleBabyPrepItemAction({
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
      const result = await deleteBabyPrepItemAction({ itemId });
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  const open = items.filter((item) => !item.checked);
  const done = items.filter((item) => item.checked);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-muted-foreground">{t(`prepHint.${category}`)}</p>
        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={pending}
            onClick={onApplySuggestions}
          >
            <Icon icon={Sparkles} size="sm" />
            {t("prepSuggest")}
          </Button>
        ) : null}
      </div>

      {canWrite ? (
        <form
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-3 shadow-xs sm:flex-row sm:items-center"
          onSubmit={form.handleSubmit(onAdd)}
        >
          <Input
            placeholder={t("prepAddPlaceholder")}
            className="flex-1"
            {...form.register("title")}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Icon icon={Plus} />
            )}
            {t("prepAdd")}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title={t("prepEmptyTitle")} description={t("prepEmptyDescription")} />
      ) : (
        <div className="space-y-4">
          <PrepGroup
            title={t("prepOpen")}
            items={open}
            icon={icon}
            canWrite={canWrite}
            pending={pending}
            onToggle={onToggle}
            onDelete={onDelete}
          />
          <PrepGroup
            title={t("prepDone")}
            items={done}
            icon={icon}
            canWrite={canWrite}
            pending={pending}
            onToggle={onToggle}
            onDelete={onDelete}
            muted
          />
        </div>
      )}
    </div>
  );
}

function PrepGroup({
  title,
  items,
  icon: Glyph,
  canWrite,
  pending,
  onToggle,
  onDelete,
  muted,
}: {
  title: string;
  items: BabyPrepItemView[];
  icon: typeof Shirt;
  canWrite: boolean;
  pending: boolean;
  onToggle: (item: BabyPrepItemView) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  const t = useTranslations("baby");
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
            className={`flex items-center gap-3 px-4 py-3 ${muted ? "opacity-70" : ""}`}
          >
            <Checkbox
              checked={item.checked}
              disabled={!canWrite || pending}
              onCheckedChange={() => onToggle(item)}
              aria-label={item.title}
            />
            <Icon icon={Glyph} size="sm" className="text-muted-foreground" />
            <p
              className={`min-w-0 flex-1 text-sm font-medium tracking-tight ${
                item.checked ? "text-muted-foreground line-through" : ""
              }`}
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
                aria-label={t("delete")}
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

function SummaryCard({
  label,
  value,
  count,
  countLabel,
}: {
  label: string;
  value: string;
  count: number;
  countLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-xs">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {countLabel}: {count}
      </p>
    </div>
  );
}
