import { Home } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { isSupabaseConfigured } from "@/config/env";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace/services/workspace-service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return {
    title: t("title"),
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tWorkspace = await getTranslations("workspace");

  let workspaceName: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const active = await resolveActiveWorkspace();
      workspaceName = active?.name ?? null;
    } catch {
      workspaceName = null;
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">{brand.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {workspaceName ? t("subtitleWithWorkspace", { workspace: workspaceName }) : t("subtitle")}
        </p>
      </header>

      <EmptyState
        icon={<Home className="size-8" aria-hidden />}
        title={t("emptyTitle")}
        description={
          workspaceName
            ? t("emptyDescriptionWithWorkspace", {
                workspace: workspaceName,
                workspaceLabel: tWorkspace("displayName").toLowerCase(),
              })
            : t("emptyDescription")
        }
      />
    </div>
  );
}
