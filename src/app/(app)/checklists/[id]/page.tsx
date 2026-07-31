import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { ChecklistDetailPanel } from "@/features/checklists/components/checklist-detail-panel";
import {
  getChecklist,
  listChecklistItems,
} from "@/features/checklists/services/checklists-service";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";
import { DomainError } from "@/lib/errors";

interface ChecklistDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checklists");
  return { title: t("title") };
}

export default async function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("checklists");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "checklists.write") : false;
    const checklist = await getChecklist(id);
    const items = await listChecklistItems(id);

    return <ChecklistDetailPanel checklist={checklist} items={items} canWrite={canWrite} />;
  } catch (error) {
    if (error instanceof DomainError && error.code === "CHECKLIST_NOT_FOUND") {
      notFound();
    }
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
