import { DomainError } from "@/lib/errors";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type ShoppingListView = {
  id: string;
  title: string;
  status: "active" | "archived";
  updatedAt: string;
};

export type ShoppingItemView = {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  unit: string;
  notes: string | null;
  checked: boolean;
  inventoryItemId: string | null;
  position: number;
  updatedAt: string;
};

export async function ensureDefaultShoppingList(): Promise<ShoppingListView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("shopping.write");

  const { data: existing, error: listError } = await supabase
    .from("shopping_lists")
    .select("id, title, status, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (listError) {
    throw new DomainError("SHOPPING_LIST_FAILED", listError.message);
  }

  if (existing) {
    return {
      id: existing.id,
      title: existing.title,
      status: existing.status,
      updatedAt: existing.updated_at,
    };
  }

  const { data: created, error: createError } = await supabase
    .from("shopping_lists")
    .insert({
      workspace_id: workspace.id,
      title: "Compras",
      status: "active",
      created_by: user.id,
    })
    .select("id, title, status, updated_at")
    .single();

  if (createError || !created) {
    throw new DomainError(
      "SHOPPING_LIST_CREATE_FAILED",
      createError?.message ?? "Falha ao criar lista.",
    );
  }

  return {
    id: created.id,
    title: created.title,
    status: created.status,
    updatedAt: created.updated_at,
  };
}

/** Read-only: does not create a list (safe for viewers / dashboard). */
export async function getActiveShoppingList(): Promise<ShoppingListView | null> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("shopping.read");

  const { data, error } = await supabase
    .from("shopping_lists")
    .select("id, title, status, updated_at")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new DomainError("SHOPPING_LIST_FAILED", error.message);
  }
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    updatedAt: data.updated_at,
  };
}

export async function listShoppingItems(listId: string): Promise<ShoppingItemView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("shopping.read");

  const { data, error } = await supabase
    .from("shopping_items")
    .select(
      "id, list_id, name, quantity, unit, notes, checked, inventory_item_id, position, updated_at",
    )
    .eq("workspace_id", workspace.id)
    .eq("list_id", listId)
    .order("checked", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new DomainError("SHOPPING_ITEMS_FAILED", error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    listId: row.list_id,
    name: row.name,
    quantity: String(row.quantity),
    unit: row.unit,
    notes: row.notes,
    checked: row.checked,
    inventoryItemId: row.inventory_item_id,
    position: row.position,
    updatedAt: row.updated_at,
  }));
}

export async function addShoppingItem(input: {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  inventoryItemId?: string;
}): Promise<ShoppingItemView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("shopping.write");

  const { count } = await supabase
    .from("shopping_items")
    .select("id", { count: "exact", head: true })
    .eq("list_id", input.listId);

  const { data, error } = await supabase
    .from("shopping_items")
    .insert({
      workspace_id: workspace.id,
      list_id: input.listId,
      name: input.name,
      quantity: String(input.quantity),
      unit: input.unit,
      notes: input.notes ?? null,
      inventory_item_id: input.inventoryItemId ?? null,
      position: count ?? 0,
      created_by: user.id,
    })
    .select(
      "id, list_id, name, quantity, unit, notes, checked, inventory_item_id, position, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DomainError("SHOPPING_ITEM_CREATE_FAILED", error?.message ?? "Falha ao adicionar.");
  }

  await supabase
    .from("shopping_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.listId);

  return {
    id: data.id,
    listId: data.list_id,
    name: data.name,
    quantity: String(data.quantity),
    unit: data.unit,
    notes: data.notes,
    checked: data.checked,
    inventoryItemId: data.inventory_item_id,
    position: data.position,
    updatedAt: data.updated_at,
  };
}

export async function toggleShoppingItem(
  itemId: string,
  checked: boolean,
): Promise<ShoppingItemView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("shopping.write");

  const { data, error } = await supabase
    .from("shopping_items")
    .update({
      checked,
      checked_at: checked ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspace.id)
    .eq("id", itemId)
    .select(
      "id, list_id, name, quantity, unit, notes, checked, inventory_item_id, position, updated_at",
    )
    .single();

  if (error || !data) {
    throw new DomainError("SHOPPING_ITEM_UPDATE_FAILED", error?.message ?? "Falha ao atualizar.");
  }

  return {
    id: data.id,
    listId: data.list_id,
    name: data.name,
    quantity: String(data.quantity),
    unit: data.unit,
    notes: data.notes,
    checked: data.checked,
    inventoryItemId: data.inventory_item_id,
    position: data.position,
    updatedAt: data.updated_at,
  };
}

export async function deleteShoppingItem(itemId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("shopping.write");

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", itemId);

  if (error) {
    throw new DomainError("SHOPPING_ITEM_DELETE_FAILED", error.message);
  }
}

export async function clearCheckedItems(listId: string): Promise<number> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("shopping.write");

  const { data, error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("list_id", listId)
    .eq("checked", true)
    .select("id");

  if (error) {
    throw new DomainError("SHOPPING_CLEAR_FAILED", error.message);
  }

  return data?.length ?? 0;
}
