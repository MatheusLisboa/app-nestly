import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { BabyPanel } from "@/features/baby/components/baby-panel";
import {
  getBabyCareSummary,
  listBabies,
  listBabyCareLogs,
  listBabyPrepItems,
} from "@/features/baby/services/baby-service";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("baby");
  return { title: t("title") };
}

export default async function BabyPage() {
  const t = await getTranslations("baby");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "baby.write") : false;

    const babies = await listBabies();
    const baby = babies[0] ?? null;
    const logs = baby && baby.status === "born" ? await listBabyCareLogs(baby.id) : [];
    const summary = baby && baby.status === "born" ? await getBabyCareSummary(baby.id) : null;
    const prep = baby ? await listBabyPrepItems(baby.id) : null;

    return <BabyPanel baby={baby} logs={logs} summary={summary} prep={prep} canWrite={canWrite} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
