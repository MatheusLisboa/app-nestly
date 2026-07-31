import {
  type BabyCareType,
  type BabyMedicalType,
  type BabyPrepCategory,
  type BabyStatus,
  DEFAULT_PREP_ITEMS,
} from "@/features/baby/schemas/baby";
import { DomainError } from "@/lib/errors";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type BabyView = {
  id: string;
  name: string;
  status: BabyStatus;
  dueDate: string | null;
  birthDate: string | null;
  notes: string | null;
  daysUntilDue: number | null;
  ageDays: number | null;
  updatedAt: string;
};

export type BabyCareLogView = {
  id: string;
  babyId: string;
  type: BabyCareType;
  occurredAt: string;
  detail: string | null;
  notes: string | null;
  updatedAt: string;
};

export type BabyCareSummary = {
  lastFeedingAt: string | null;
  lastDiaperAt: string | null;
  lastSleepAt: string | null;
  todayCounts: Record<BabyCareType, number>;
};

export type BabyPrepItemView = {
  id: string;
  babyId: string;
  category: BabyPrepCategory;
  title: string;
  checked: boolean;
  notes: string | null;
  position: number;
};

export type BabyPrepProgress = Record<
  BabyPrepCategory,
  { total: number; done: number; items: BabyPrepItemView[] }
>;

export type BabyMedicalAppointmentView = {
  id: string;
  babyId: string;
  type: BabyMedicalType;
  title: string;
  scheduledAt: string;
  location: string | null;
  professional: string | null;
  notes: string | null;
  calendarEventId: string | null;
  isPast: boolean;
};

const MEDICAL_TYPE_LABEL: Record<BabyMedicalType, string> = {
  consultation: "Consulta",
  exam: "Exame",
  ultrasound: "Ultrassom",
  vaccine: "Vacina",
  other: "Médico",
};

function calendarTitle(type: BabyMedicalType, title: string) {
  return `${MEDICAL_TYPE_LABEL[type]}: ${title}`;
}

function calendarNotes(input: {
  professional?: string | null;
  notes?: string | null;
  babyName?: string;
}) {
  const parts = ["Nestly · Bebê"];
  if (input.babyName) parts.push(input.babyName);
  if (input.professional) parts.push(`Profissional: ${input.professional}`);
  if (input.notes) parts.push(input.notes);
  return parts.join(" · ");
}

function startOfLocalDayIso(now = new Date()): string {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start.toISOString();
}

function localDateIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso.slice(0, 10)}T12:00:00`);
  const to = new Date(`${toIso.slice(0, 10)}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

function mapBaby(row: {
  id: string;
  name: string;
  status: string;
  due_date: string | null;
  birth_date: string | null;
  notes: string | null;
  updated_at: string;
}): BabyView {
  const status = (row.status as BabyStatus) || (row.birth_date ? "born" : "expected");
  const today = localDateIso();
  const daysUntilDue =
    status === "expected" && row.due_date ? daysBetween(today, row.due_date) : null;
  const ageDays = status === "born" && row.birth_date ? daysBetween(row.birth_date, today) : null;

  return {
    id: row.id,
    name: row.name,
    status,
    dueDate: row.due_date,
    birthDate: row.birth_date,
    notes: row.notes,
    daysUntilDue,
    ageDays,
    updatedAt: row.updated_at,
  };
}

const babySelect = "id, name, status, due_date, birth_date, notes, updated_at";

export async function listBabies(): Promise<BabyView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.read");

  const { data, error } = await supabase
    .from("babies")
    .select(babySelect)
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new DomainError("BABIES_LIST_FAILED", error.message);
  }

  return (data ?? []).map(mapBaby);
}

export async function createBaby(input: {
  name: string;
  status: BabyStatus;
  dueDate?: string;
  birthDate?: string;
}): Promise<BabyView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const status = input.status;
  const birthDate = status === "born" ? input.birthDate || localDateIso() : input.birthDate || null;
  const dueDate = status === "expected" ? input.dueDate || null : input.dueDate || null;

  const { data, error } = await supabase
    .from("babies")
    .insert({
      workspace_id: workspace.id,
      name: input.name,
      status,
      due_date: dueDate || null,
      birth_date: birthDate || null,
      created_by: user.id,
    })
    .select(babySelect)
    .single();

  if (error || !data) {
    throw new DomainError("BABY_CREATE_FAILED", error?.message ?? "Falha ao criar perfil.");
  }

  return mapBaby(data);
}

export async function markBabyBorn(input: {
  babyId: string;
  birthDate: string;
  name?: string;
}): Promise<BabyView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.write");
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("babies")
    .update({
      status: "born",
      birth_date: input.birthDate,
      ...(input.name ? { name: input.name } : {}),
      updated_at: now,
    })
    .eq("workspace_id", workspace.id)
    .eq("id", input.babyId)
    .select(babySelect)
    .single();

  if (error || !data) {
    throw new DomainError("BABY_MARK_BORN_FAILED", error?.message ?? "Falha ao atualizar.");
  }

  return mapBaby(data);
}

export async function updateBabyProfile(input: {
  babyId: string;
  name: string;
  dueDate?: string;
  birthDate?: string;
  notes?: string;
}): Promise<BabyView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { data, error } = await supabase
    .from("babies")
    .update({
      name: input.name,
      due_date: input.dueDate || null,
      birth_date: input.birthDate || null,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspace.id)
    .eq("id", input.babyId)
    .select(babySelect)
    .single();

  if (error || !data) {
    throw new DomainError("BABY_UPDATE_FAILED", error?.message ?? "Falha ao salvar.");
  }

  return mapBaby(data);
}

export async function listBabyCareLogs(babyId: string): Promise<BabyCareLogView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.read");

  const { data, error } = await supabase
    .from("baby_care_logs")
    .select("id, baby_id, type, occurred_at, detail, notes, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("baby_id", babyId)
    .gte("occurred_at", startOfLocalDayIso())
    .order("occurred_at", { ascending: false });

  if (error) {
    throw new DomainError("BABY_LOGS_FAILED", error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    babyId: row.baby_id,
    type: row.type as BabyCareType,
    occurredAt: row.occurred_at,
    detail: row.detail,
    notes: row.notes,
    updatedAt: row.updated_at,
  }));
}

export async function getBabyCareSummary(babyId: string): Promise<BabyCareSummary> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.read");

  const { data, error } = await supabase
    .from("baby_care_logs")
    .select("type, occurred_at")
    .eq("workspace_id", workspace.id)
    .eq("baby_id", babyId)
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new DomainError("BABY_SUMMARY_FAILED", error.message);
  }

  const todayStart = startOfLocalDayIso();
  const todayCounts: Record<BabyCareType, number> = {
    feeding: 0,
    diaper: 0,
    sleep: 0,
    note: 0,
  };

  let lastFeedingAt: string | null = null;
  let lastDiaperAt: string | null = null;
  let lastSleepAt: string | null = null;

  for (const row of data ?? []) {
    const type = row.type as BabyCareType;
    if (row.occurred_at >= todayStart) {
      todayCounts[type] += 1;
    }
    if (type === "feeding" && !lastFeedingAt) lastFeedingAt = row.occurred_at;
    if (type === "diaper" && !lastDiaperAt) lastDiaperAt = row.occurred_at;
    if (type === "sleep" && !lastSleepAt) lastSleepAt = row.occurred_at;
  }

  return { lastFeedingAt, lastDiaperAt, lastSleepAt, todayCounts };
}

export async function addBabyCareLog(input: {
  babyId: string;
  type: BabyCareType;
  detail?: string;
  notes?: string;
}): Promise<BabyCareLogView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { data, error } = await supabase
    .from("baby_care_logs")
    .insert({
      workspace_id: workspace.id,
      baby_id: input.babyId,
      type: input.type,
      detail: input.detail || null,
      notes: input.notes || null,
      occurred_at: new Date().toISOString(),
      created_by: user.id,
    })
    .select("id, baby_id, type, occurred_at, detail, notes, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("BABY_LOG_CREATE_FAILED", error?.message ?? "Falha ao registrar.");
  }

  return {
    id: data.id,
    babyId: data.baby_id,
    type: data.type as BabyCareType,
    occurredAt: data.occurred_at,
    detail: data.detail,
    notes: data.notes,
    updatedAt: data.updated_at,
  };
}

export async function deleteBabyCareLog(logId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { error } = await supabase
    .from("baby_care_logs")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", logId);

  if (error) {
    throw new DomainError("BABY_LOG_DELETE_FAILED", error.message);
  }
}

export async function listBabyPrepItems(babyId: string): Promise<BabyPrepProgress> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.read");

  const { data, error } = await supabase
    .from("baby_prep_items")
    .select("id, baby_id, category, title, checked, notes, position")
    .eq("workspace_id", workspace.id)
    .eq("baby_id", babyId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new DomainError("BABY_PREP_LIST_FAILED", error.message);
  }

  const empty = (): BabyPrepProgress[BabyPrepCategory] => ({ total: 0, done: 0, items: [] });
  const progress: BabyPrepProgress = {
    enxoval: empty(),
    pharmacy: empty(),
    nursery: empty(),
    items: empty(),
  };

  for (const row of data ?? []) {
    const category = row.category as BabyPrepCategory;
    if (!progress[category]) continue;
    const item: BabyPrepItemView = {
      id: row.id,
      babyId: row.baby_id,
      category,
      title: row.title,
      checked: row.checked,
      notes: row.notes,
      position: row.position,
    };
    progress[category].items.push(item);
    progress[category].total += 1;
    if (item.checked) progress[category].done += 1;
  }

  return progress;
}

/** Adds suggested titles that are not already on the list (keeps checked items). */
export async function applySuggestedPrepItems(input: {
  babyId: string;
  category: BabyPrepCategory;
}): Promise<{ added: number }> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { data: existing, error } = await supabase
    .from("baby_prep_items")
    .select("title, position")
    .eq("workspace_id", workspace.id)
    .eq("baby_id", input.babyId)
    .eq("category", input.category);

  if (error) {
    throw new DomainError("BABY_PREP_LIST_FAILED", error.message);
  }

  const have = new Set((existing ?? []).map((row) => row.title.trim().toLowerCase()));
  const maxPos = (existing ?? []).reduce((max, row) => Math.max(max, row.position ?? 0), -1);
  const missing = DEFAULT_PREP_ITEMS[input.category].filter(
    (title) => !have.has(title.trim().toLowerCase()),
  );

  if (missing.length === 0) {
    return { added: 0 };
  }

  const rows = missing.map((title, index) => ({
    workspace_id: workspace.id,
    baby_id: input.babyId,
    category: input.category,
    title,
    position: maxPos + 1 + index,
    created_by: user.id,
  }));

  const { error: insertError } = await supabase.from("baby_prep_items").insert(rows);
  if (insertError) {
    throw new DomainError("BABY_PREP_CREATE_FAILED", insertError.message);
  }

  return { added: rows.length };
}

export async function addBabyPrepItem(input: {
  babyId: string;
  category: BabyPrepCategory;
  title: string;
}): Promise<BabyPrepItemView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { count } = await supabase
    .from("baby_prep_items")
    .select("id", { count: "exact", head: true })
    .eq("baby_id", input.babyId)
    .eq("category", input.category);

  const { data, error } = await supabase
    .from("baby_prep_items")
    .insert({
      workspace_id: workspace.id,
      baby_id: input.babyId,
      category: input.category,
      title: input.title,
      position: count ?? 0,
      created_by: user.id,
    })
    .select("id, baby_id, category, title, checked, notes, position")
    .single();

  if (error || !data) {
    throw new DomainError("BABY_PREP_CREATE_FAILED", error?.message ?? "Falha ao adicionar.");
  }

  return {
    id: data.id,
    babyId: data.baby_id,
    category: data.category as BabyPrepCategory,
    title: data.title,
    checked: data.checked,
    notes: data.notes,
    position: data.position,
  };
}

export async function toggleBabyPrepItem(
  itemId: string,
  checked: boolean,
): Promise<BabyPrepItemView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { data, error } = await supabase
    .from("baby_prep_items")
    .update({ checked, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspace.id)
    .eq("id", itemId)
    .select("id, baby_id, category, title, checked, notes, position")
    .single();

  if (error || !data) {
    throw new DomainError("BABY_PREP_UPDATE_FAILED", error?.message ?? "Falha ao atualizar.");
  }

  return {
    id: data.id,
    babyId: data.baby_id,
    category: data.category as BabyPrepCategory,
    title: data.title,
    checked: data.checked,
    notes: data.notes,
    position: data.position,
  };
}

export async function deleteBabyPrepItem(itemId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { error } = await supabase
    .from("baby_prep_items")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", itemId);

  if (error) {
    throw new DomainError("BABY_PREP_DELETE_FAILED", error.message);
  }
}

function mapMedicalAppointment(row: {
  id: string;
  baby_id: string;
  type: string;
  title: string;
  scheduled_at: string;
  location: string | null;
  professional: string | null;
  notes: string | null;
  calendar_event_id: string | null;
}): BabyMedicalAppointmentView {
  const scheduledAt = row.scheduled_at;
  return {
    id: row.id,
    babyId: row.baby_id,
    type: row.type as BabyMedicalType,
    title: row.title,
    scheduledAt,
    location: row.location,
    professional: row.professional,
    notes: row.notes,
    calendarEventId: row.calendar_event_id,
    isPast: new Date(scheduledAt).getTime() < Date.now(),
  };
}

export async function listBabyMedicalAppointments(
  babyId: string,
): Promise<BabyMedicalAppointmentView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.read");

  const { data, error } = await supabase
    .from("baby_medical_appointments")
    .select(
      "id, baby_id, type, title, scheduled_at, location, professional, notes, calendar_event_id",
    )
    .eq("workspace_id", workspace.id)
    .eq("baby_id", babyId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new DomainError("BABY_MEDICAL_LIST_FAILED", error.message);
  }

  return (data ?? []).map(mapMedicalAppointment);
}

export async function addBabyMedicalAppointment(input: {
  babyId: string;
  type: BabyMedicalType;
  title: string;
  scheduledAt: string;
  location?: string;
  professional?: string;
  notes?: string;
}): Promise<BabyMedicalAppointmentView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const scheduledAt = new Date(input.scheduledAt).toISOString();
  if (Number.isNaN(new Date(scheduledAt).getTime())) {
    throw new DomainError("VALIDATION_ERROR", "Data/hora inválida.");
  }

  const { data: baby } = await supabase
    .from("babies")
    .select("name")
    .eq("workspace_id", workspace.id)
    .eq("id", input.babyId)
    .maybeSingle();

  const endsAt = new Date(new Date(scheduledAt).getTime() + 60 * 60 * 1000).toISOString();

  const { data: event, error: eventError } = await supabase
    .from("calendar_events")
    .insert({
      workspace_id: workspace.id,
      title: calendarTitle(input.type, input.title),
      starts_at: scheduledAt,
      ends_at: endsAt,
      all_day: false,
      location: input.location || null,
      notes: calendarNotes({
        professional: input.professional,
        notes: input.notes,
        babyName: baby?.name,
      }),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (eventError || !event) {
    throw new DomainError(
      "BABY_MEDICAL_CALENDAR_FAILED",
      eventError?.message ?? "Falha ao criar na agenda.",
    );
  }

  const { data, error } = await supabase
    .from("baby_medical_appointments")
    .insert({
      workspace_id: workspace.id,
      baby_id: input.babyId,
      type: input.type,
      title: input.title,
      scheduled_at: scheduledAt,
      location: input.location || null,
      professional: input.professional || null,
      notes: input.notes || null,
      calendar_event_id: event.id,
      created_by: user.id,
    })
    .select(
      "id, baby_id, type, title, scheduled_at, location, professional, notes, calendar_event_id",
    )
    .single();

  if (error || !data) {
    await supabase.from("calendar_events").delete().eq("id", event.id);
    throw new DomainError(
      "BABY_MEDICAL_CREATE_FAILED",
      error?.message ?? "Falha ao criar consulta/exame.",
    );
  }

  return mapMedicalAppointment(data);
}

export async function deleteBabyMedicalAppointment(appointmentId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("baby.write");

  const { data: existing, error: fetchError } = await supabase
    .from("baby_medical_appointments")
    .select("id, calendar_event_id")
    .eq("workspace_id", workspace.id)
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchError) {
    throw new DomainError("BABY_MEDICAL_DELETE_FAILED", fetchError.message);
  }
  if (!existing) {
    throw new DomainError("BABY_MEDICAL_DELETE_FAILED", "Registro não encontrado.");
  }

  const { error } = await supabase
    .from("baby_medical_appointments")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", appointmentId);

  if (error) {
    throw new DomainError("BABY_MEDICAL_DELETE_FAILED", error.message);
  }

  if (existing.calendar_event_id) {
    await supabase
      .from("calendar_events")
      .delete()
      .eq("workspace_id", workspace.id)
      .eq("id", existing.calendar_event_id);
  }
}
