export const shoppingFeature = {
  id: "shopping" as const,
  offlineEnabled: true,
};

export {
  addShoppingItemAction,
  clearCheckedAction,
  deleteShoppingItemAction,
  ensureShoppingListAction,
  toggleShoppingItemAction,
} from "./actions/shopping-actions";

export {
  addShoppingItem,
  clearCheckedItems,
  deleteShoppingItem,
  ensureDefaultShoppingList,
  listShoppingItems,
  type ShoppingItemView,
  type ShoppingListView,
  toggleShoppingItem,
} from "./services/shopping-service";
