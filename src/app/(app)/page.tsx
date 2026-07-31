import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { isSupabaseConfigured } from "@/config/env";
import { TodayDashboard } from "@/features/dashboard/components/today-dashboard";
import { getTodayDigest } from "@/features/dashboard/services/today-digest";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace/services/workspace-service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  let workspaceName: string | null = null;
  try {
    const active = await resolveActiveWorkspace();
    workspaceName = active?.name ?? null;
  } catch {
    workspaceName = null;
  }

  const digest = await getTodayDigest();

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-sm font-medium text-primary">{brand.name}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {t("todayTitle")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {workspaceName
            ? t("todaySubtitleWithWorkspace", { workspace: workspaceName })
            : t("todaySubtitle")}
        </p>
      </header>

      <TodayDashboard
        digest={digest}
        labels={{
          today: t("todayTitle"),
          shopping: t("sectionShopping"),
          shoppingCount: t("shoppingOpen", { count: digest.shoppingOpen }),
          bills: t("sectionBills"),
          cleaning: t("sectionCleaning"),
          calendar: t("sectionCalendar"),
          medical: t("sectionMedical"),
          baby: t("sectionBaby"),
          emptyTitle: t("todayEmptyTitle"),
          emptyDescription: t("todayEmptyDescription"),
          seeAll: t("seeAll"),
          statusExpected: t("babyExpected"),
          statusBorn: t("babyBorn"),
        }}
      />
    </div>
  );
}
