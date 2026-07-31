import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { CalendarPanel } from "@/features/calendar/components/calendar-panel";
import { listCalendarEvents } from "@/features/calendar/services/calendar-service";
import { EmptyState } from "@/features/shared";
import { resolveActiveWorkspace } from "@/features/workspace";
import { roleHasPermission } from "@/features/workspace/types/permissions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar");
  return { title: t("title") };
}

export default async function CalendarPage() {
  const t = await getTranslations("calendar");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("title")} description={tAuth("supabaseNotConfigured")} />;
  }

  try {
    const workspace = await resolveActiveWorkspace();
    const canWrite = workspace ? roleHasPermission(workspace.role, "calendar.write") : false;

    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const to = new Date();
    to.setMonth(to.getMonth() + 2);

    const events = await listCalendarEvents({
      from: from.toISOString(),
      to: to.toISOString(),
    });

    return <CalendarPanel events={events} canWrite={canWrite} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : t("loadError");
    return <EmptyState title={t("title")} description={message} />;
  }
}
