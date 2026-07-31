import { type CleaningFrequency, FREQUENCY_DAYS } from "@/features/cleaning/schemas/cleaning";
import { DomainError } from "@/lib/errors";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type CleaningDueStatus = "overdue" | "due" | "ok" | "never";

export type CleaningTaskView = {
  id: string;
  title: string;
  area: string | null;
  frequency: CleaningFrequency;
  notes: string | null;
  lastCleanedAt: string | null;
  lastCleanedBy: string | null;
  dueStatus: CleaningDueStatus;
  daysOverdue: number;
  nextDueAt: string | null;
  updatedAt: string;
};

function computeDue(
  lastCleanedAt: string | null,
  frequency: CleaningFrequency,
  now = new Date(),
): Pick<CleaningTaskView, "dueStatus" | "daysOverdue" | "nextDueAt"> {
  if (!lastCleanedAt) {
    return { dueStatus: "never", daysOverdue: 0, nextDueAt: null };
  }

  const intervalMs = FREQUENCY_DAYS[frequency] * 24 * 60 * 60 * 1000;
  const last = new Date(lastCleanedAt);
  const nextDue = new Date(last.getTime() + intervalMs);
  const diffMs = now.getTime() - nextDue.getTime();
  const daysOverdue = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  if (diffMs >= 0) {
    return {
      dueStatus: "overdue",
      daysOverdue: Math.max(daysOverdue, 1),
      nextDueAt: nextDue.toISOString(),
    };
  }

  const hoursUntil = -diffMs / (60 * 60 * 1000);
  if (hoursUntil <= 24) {
    return { dueStatus: "due", daysOverdue: 0, nextDueAt: nextDue.toISOString() };
  }

  return { dueStatus: "ok", daysOverdue: 0, nextDueAt: nextDue.toISOString() };
}

function sortTasks(a: CleaningTaskView, b: CleaningTaskView): number {
  const rank: Record<CleaningDueStatus, number> = {
    overdue: 0,
    never: 1,
    due: 2,
    ok: 3,
  };
  const byStatus = rank[a.dueStatus] - rank[b.dueStatus];
  if (byStatus !== 0) return byStatus;
  if (a.dueStatus === "overdue") return b.daysOverdue - a.daysOverdue;
  return a.title.localeCompare(b.title, "pt-BR");
}

export async function listCleaningTasks(): Promise<CleaningTaskView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("cleaning.read");

  const { data, error } = await supabase
    .from("cleaning_tasks")
    .select("id, title, area, frequency, notes, last_cleaned_at, last_cleaned_by, updated_at")
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new DomainError("CLEANING_LIST_FAILED", error.message);
  }

  const now = new Date();
  return (data ?? [])
    .map((row) => {
      const frequency = row.frequency as CleaningFrequency;
      const due = computeDue(row.last_cleaned_at, frequency, now);
      return {
        id: row.id,
        title: row.title,
        area: row.area,
        frequency,
        notes: row.notes,
        lastCleanedAt: row.last_cleaned_at,
        lastCleanedBy: row.last_cleaned_by,
        ...due,
        updatedAt: row.updated_at,
      };
    })
    .sort(sortTasks);
}

export async function createCleaningTask(input: {
  title: string;
  area?: string;
  frequency: CleaningFrequency;
}): Promise<CleaningTaskView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("cleaning.write");

  const { data, error } = await supabase
    .from("cleaning_tasks")
    .insert({
      workspace_id: workspace.id,
      title: input.title,
      area: input.area || null,
      frequency: input.frequency,
      created_by: user.id,
    })
    .select("id, title, area, frequency, notes, last_cleaned_at, last_cleaned_by, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("CLEANING_CREATE_FAILED", error?.message ?? "Falha ao criar tarefa.");
  }

  const frequency = data.frequency as CleaningFrequency;
  const due = computeDue(data.last_cleaned_at, frequency);

  return {
    id: data.id,
    title: data.title,
    area: data.area,
    frequency,
    notes: data.notes,
    lastCleanedAt: data.last_cleaned_at,
    lastCleanedBy: data.last_cleaned_by,
    ...due,
    updatedAt: data.updated_at,
  };
}

export async function completeCleaningTask(taskId: string): Promise<CleaningTaskView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("cleaning.write");
  const cleanedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("cleaning_tasks")
    .update({
      last_cleaned_at: cleanedAt,
      last_cleaned_by: user.id,
      updated_at: cleanedAt,
    })
    .eq("workspace_id", workspace.id)
    .eq("id", taskId)
    .select("id, title, area, frequency, notes, last_cleaned_at, last_cleaned_by, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError(
      "CLEANING_COMPLETE_FAILED",
      error?.message ?? "Falha ao marcar como limpo.",
    );
  }

  const { error: logError } = await supabase.from("cleaning_logs").insert({
    workspace_id: workspace.id,
    task_id: taskId,
    cleaned_at: cleanedAt,
    cleaned_by: user.id,
  });

  if (logError) {
    // Non-fatal — task already updated.
  }

  const frequency = data.frequency as CleaningFrequency;
  const due = computeDue(data.last_cleaned_at, frequency);

  return {
    id: data.id,
    title: data.title,
    area: data.area,
    frequency,
    notes: data.notes,
    lastCleanedAt: data.last_cleaned_at,
    lastCleanedBy: data.last_cleaned_by,
    ...due,
    updatedAt: data.updated_at,
  };
}

export async function deleteCleaningTask(taskId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("cleaning.write");

  const { error } = await supabase
    .from("cleaning_tasks")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", taskId);

  if (error) {
    throw new DomainError("CLEANING_DELETE_FAILED", error.message);
  }
}
