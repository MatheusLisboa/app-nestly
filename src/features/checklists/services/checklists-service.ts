import { DomainError } from "@/lib/errors";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type ChecklistView = {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "archived";
  itemCount: number;
  checkedCount: number;
  updatedAt: string;
};

export type ChecklistItemView = {
  id: string;
  checklistId: string;
  title: string;
  checked: boolean;
  position: number;
  updatedAt: string;
};

export async function listChecklists(): Promise<ChecklistView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.read");

  const { data: lists, error } = await supabase
    .from("checklists")
    .select("id, title, description, status, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new DomainError("CHECKLISTS_LIST_FAILED", error.message);
  }

  const listIds = (lists ?? []).map((list) => list.id);
  const counts = new Map<string, { itemCount: number; checkedCount: number }>();

  if (listIds.length > 0) {
    const { data: items } = await supabase
      .from("checklist_items")
      .select("checklist_id, checked")
      .eq("workspace_id", workspace.id)
      .in("checklist_id", listIds);

    for (const item of items ?? []) {
      const current = counts.get(item.checklist_id) ?? { itemCount: 0, checkedCount: 0 };
      current.itemCount += 1;
      if (item.checked) current.checkedCount += 1;
      counts.set(item.checklist_id, current);
    }
  }

  return (lists ?? []).map((list) => {
    const stats = counts.get(list.id) ?? { itemCount: 0, checkedCount: 0 };
    return {
      id: list.id,
      title: list.title,
      description: list.description,
      status: list.status,
      itemCount: stats.itemCount,
      checkedCount: stats.checkedCount,
      updatedAt: list.updated_at,
    };
  });
}

export async function getChecklist(checklistId: string): Promise<ChecklistView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.read");

  const { data: list, error } = await supabase
    .from("checklists")
    .select("id, title, description, status, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("id", checklistId)
    .maybeSingle();

  if (error || !list) {
    throw new DomainError("CHECKLIST_NOT_FOUND", error?.message ?? "Checklist não encontrada.");
  }

  const { data: items } = await supabase
    .from("checklist_items")
    .select("checked")
    .eq("checklist_id", list.id)
    .eq("workspace_id", workspace.id);

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    status: list.status,
    itemCount: items?.length ?? 0,
    checkedCount: items?.filter((item) => item.checked).length ?? 0,
    updatedAt: list.updated_at,
  };
}

export async function listChecklistItems(checklistId: string): Promise<ChecklistItemView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.read");

  const { data, error } = await supabase
    .from("checklist_items")
    .select("id, checklist_id, title, checked, position, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("checklist_id", checklistId)
    .order("checked", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new DomainError("CHECKLIST_ITEMS_FAILED", error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    checklistId: row.checklist_id,
    title: row.title,
    checked: row.checked,
    position: row.position,
    updatedAt: row.updated_at,
  }));
}

export async function createChecklist(input: {
  title: string;
  description?: string;
}): Promise<ChecklistView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("checklists.write");

  const { data, error } = await supabase
    .from("checklists")
    .insert({
      workspace_id: workspace.id,
      title: input.title,
      description: input.description ?? null,
      status: "active",
      created_by: user.id,
    })
    .select("id, title, description, status, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("CHECKLIST_CREATE_FAILED", error?.message ?? "Falha ao criar checklist.");
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    itemCount: 0,
    checkedCount: 0,
    updatedAt: data.updated_at,
  };
}

export async function addChecklistItem(input: {
  checklistId: string;
  title: string;
}): Promise<ChecklistItemView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("checklists.write");

  const { count } = await supabase
    .from("checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("checklist_id", input.checklistId);

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({
      workspace_id: workspace.id,
      checklist_id: input.checklistId,
      title: input.title,
      position: count ?? 0,
      created_by: user.id,
    })
    .select("id, checklist_id, title, checked, position, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("CHECKLIST_ITEM_CREATE_FAILED", error?.message ?? "Falha ao adicionar.");
  }

  await supabase
    .from("checklists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.checklistId)
    .eq("workspace_id", workspace.id);

  return {
    id: data.id,
    checklistId: data.checklist_id,
    title: data.title,
    checked: data.checked,
    position: data.position,
    updatedAt: data.updated_at,
  };
}

export async function toggleChecklistItem(
  itemId: string,
  checked: boolean,
): Promise<ChecklistItemView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.write");

  const { data, error } = await supabase
    .from("checklist_items")
    .update({
      checked,
      checked_at: checked ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspace.id)
    .eq("id", itemId)
    .select("id, checklist_id, title, checked, position, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("CHECKLIST_ITEM_UPDATE_FAILED", error?.message ?? "Falha ao atualizar.");
  }

  await supabase
    .from("checklists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", data.checklist_id)
    .eq("workspace_id", workspace.id);

  return {
    id: data.id,
    checklistId: data.checklist_id,
    title: data.title,
    checked: data.checked,
    position: data.position,
    updatedAt: data.updated_at,
  };
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.write");

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", itemId);

  if (error) {
    throw new DomainError("CHECKLIST_ITEM_DELETE_FAILED", error.message);
  }
}

export async function resetChecklist(checklistId: string): Promise<number> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.write");

  const { data, error } = await supabase
    .from("checklist_items")
    .update({
      checked: false,
      checked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspace.id)
    .eq("checklist_id", checklistId)
    .eq("checked", true)
    .select("id");

  if (error) {
    throw new DomainError("CHECKLIST_RESET_FAILED", error.message);
  }

  await supabase
    .from("checklists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", checklistId)
    .eq("workspace_id", workspace.id);

  return data?.length ?? 0;
}

export async function deleteChecklist(checklistId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("checklists.write");

  const { error } = await supabase
    .from("checklists")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", checklistId);

  if (error) {
    throw new DomainError("CHECKLIST_DELETE_FAILED", error.message);
  }
}
