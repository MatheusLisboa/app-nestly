export const inventoryFeature = {
  id: "inventory" as const,
  offlineEnabled: true,
};

export {
  createInventoryItemAction,
  deleteInventoryItemAction,
  restockToShoppingAction,
  updateInventoryQuantityAction,
} from "./actions/inventory-actions";

export {
  createInventoryItem,
  deleteInventoryItem,
  ensureDefaultLocations,
  type InventoryItemView,
  type InventoryLocationView,
  listInventoryItems,
  listInventoryLocations,
  restockInventoryItemToShopping,
  updateInventoryQuantity,
} from "./services/inventory-service";
