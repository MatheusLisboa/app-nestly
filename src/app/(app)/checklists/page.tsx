import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { ChecklistsHome } from "@/features/checklists/components/checklists-home";
import { listChecklists } from "@/features/checklists/services/checklists-service";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checklists");
  return { title: t("title") };
}

export default async function ChecklistsPage() {
  const t = await getTranslations("checklists");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "checklists.write") : false;
    const checklists = await listChecklists();

    return <ChecklistsHome checklists={checklists} canWrite={canWrite} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
