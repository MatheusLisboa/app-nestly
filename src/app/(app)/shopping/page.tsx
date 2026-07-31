import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { EmptyState } from "@/features/shared";
import { ShoppingListPanel } from "@/features/shopping/components/shopping-list-panel";
import {
  ensureDefaultShoppingList,
  listShoppingItems,
} from "@/features/shopping/services/shopping-service";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shopping");
  return { title: t("title") };
}

export default async function ShoppingPage() {
  const t = await getTranslations("shopping");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "shopping.write") : false;
    const list = await ensureDefaultShoppingList();
    const items = await listShoppingItems(list.id);

    return <ShoppingListPanel list={list} items={items} canWrite={canWrite} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
