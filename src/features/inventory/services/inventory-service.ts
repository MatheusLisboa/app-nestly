import {
  addShoppingItem,
  ensureDefaultShoppingList,
} from "@/features/shopping/services/shopping-service";
import { DomainError } from "@/lib/errors";
import { requireActiveWorkspaceContext } from "@/lib/workspace/require-workspace";

export type InventoryItemView = {
  id: string;
  name: string;
  category: string | null;
  locationId: string | null;
  locationName: string | null;
  quantity: string;
  unit: string;
  minQuantity: string;
  notes: string | null;
  isLow: boolean;
  updatedAt: string;
};

export type InventoryLocationView = {
  id: string;
  name: string;
};

function isLowStock(quantity: string, minQuantity: string): boolean {
  return Number(quantity) <= Number(minQuantity);
}

export async function listInventoryLocations(): Promise<InventoryLocationView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("inventory.read");

  const { data, error } = await supabase
    .from("inventory_locations")
    .select("id, name")
    .eq("workspace_id", workspace.id)
    .order("name");

  if (error) {
    throw new DomainError("INVENTORY_LOCATIONS_FAILED", error.message);
  }

  return data ?? [];
}

export async function ensureDefaultLocations(): Promise<InventoryLocationView[]> {
  const existing = await listInventoryLocations();
  if (existing.length > 0) return existing;

  const { workspace, supabase } = await requireActiveWorkspaceContext("inventory.write");
  const defaults = ["Geladeira", "Despensa", "Armário"];

  const { data, error } = await supabase
    .from("inventory_locations")
    .insert(defaults.map((name) => ({ workspace_id: workspace.id, name })))
    .select("id, name");

  if (error) {
    throw new DomainError("INVENTORY_LOCATION_SEED_FAILED", error.message);
  }

  return data ?? [];
}

export async function listInventoryItems(): Promise<InventoryItemView[]> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("inventory.read");

  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      "id, name, category, location_id, quantity, unit, min_quantity, notes, updated_at, location:inventory_locations(name)",
    )
    .eq("workspace_id", workspace.id)
    .order("name");

  if (error) {
    throw new DomainError("INVENTORY_ITEMS_FAILED", error.message);
  }

  return (data ?? []).map((row) => {
    const location = row.location as { name: string } | { name: string }[] | null;
    const loc = Array.isArray(location) ? location[0] : location;
    const quantity = String(row.quantity);
    const minQuantity = String(row.min_quantity);

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      locationId: row.location_id,
      locationName: loc?.name ?? null,
      quantity,
      unit: row.unit,
      minQuantity,
      notes: row.notes,
      isLow: isLowStock(quantity, minQuantity),
      updatedAt: row.updated_at,
    };
  });
}

export async function createInventoryItem(input: {
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  category?: string;
  locationId?: string;
  notes?: string;
}): Promise<InventoryItemView> {
  const { user, workspace, supabase } = await requireActiveWorkspaceContext("inventory.write");

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      workspace_id: workspace.id,
      name: input.name,
      quantity: String(input.quantity),
      unit: input.unit,
      min_quantity: String(input.minQuantity),
      category: input.category ?? null,
      location_id: input.locationId ?? null,
      notes: input.notes ?? null,
      created_by: user.id,
    })
    .select("id, name, category, location_id, quantity, unit, min_quantity, notes, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("INVENTORY_CREATE_FAILED", error?.message ?? "Falha ao criar item.");
  }

  const quantity = String(data.quantity);
  const minQuantity = String(data.min_quantity);

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    locationId: data.location_id,
    locationName: null,
    quantity,
    unit: data.unit,
    minQuantity,
    notes: data.notes,
    isLow: isLowStock(quantity, minQuantity),
    updatedAt: data.updated_at,
  };
}

export async function updateInventoryQuantity(
  itemId: string,
  quantity: number,
): Promise<InventoryItemView> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("inventory.write");

  const { data, error } = await supabase
    .from("inventory_items")
    .update({
      quantity: String(quantity),
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspace.id)
    .eq("id", itemId)
    .select("id, name, category, location_id, quantity, unit, min_quantity, notes, updated_at")
    .single();

  if (error || !data) {
    throw new DomainError("INVENTORY_UPDATE_FAILED", error?.message ?? "Falha ao atualizar.");
  }

  const qty = String(data.quantity);
  const minQuantity = String(data.min_quantity);

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    locationId: data.location_id,
    locationName: null,
    quantity: qty,
    unit: data.unit,
    minQuantity,
    notes: data.notes,
    isLow: isLowStock(qty, minQuantity),
    updatedAt: data.updated_at,
  };
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  const { workspace, supabase } = await requireActiveWorkspaceContext("inventory.write");

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", itemId);

  if (error) {
    throw new DomainError("INVENTORY_DELETE_FAILED", error.message);
  }
}

/**
 * Adds a low-stock inventory item to the active shopping list.
 */
export async function restockInventoryItemToShopping(itemId: string) {
  const { workspace, supabase } = await requireActiveWorkspaceContext("inventory.write");

  const { data: item, error } = await supabase
    .from("inventory_items")
    .select("id, name, unit, min_quantity, quantity")
    .eq("workspace_id", workspace.id)
    .eq("id", itemId)
    .single();

  if (error || !item) {
    throw new DomainError("INVENTORY_NOT_FOUND", error?.message ?? "Item não encontrado.");
  }

  // Need shopping.write as well — ensureDefault/add check shopping.write
  const list = await ensureDefaultShoppingList();
  const needed = Math.max(1, Number(item.min_quantity) - Number(item.quantity) + 1);

  return addShoppingItem({
    listId: list.id,
    name: item.name,
    quantity: needed,
    unit: item.unit,
    inventoryItemId: item.id,
  });
}
