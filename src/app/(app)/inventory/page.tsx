import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { InventoryPanel } from "@/features/inventory/components/inventory-panel";
import {
  ensureDefaultLocations,
  listInventoryItems,
} from "@/features/inventory/services/inventory-service";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("inventory");
  return { title: t("title") };
}

export default async function InventoryPage() {
  const t = await getTranslations("inventory");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "inventory.write") : false;
    const locations = await ensureDefaultLocations();
    const items = await listInventoryItems();

    return <InventoryPanel items={items} locations={locations} canWrite={canWrite} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
