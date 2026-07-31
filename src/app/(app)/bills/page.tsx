import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { BillsPanel } from "@/features/bills/components/bills-panel";
import { listBills } from "@/features/bills/services/bills-service";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("bills");
  return { title: t("title") };
}

export default async function BillsPage() {
  const t = await getTranslations("bills");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "bills.write") : false;
    const bills = await listBills();

    return <BillsPanel bills={bills} canWrite={canWrite} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
