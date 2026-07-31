import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/config/env";
import { EmptyState } from "@/features/shared";
import { InviteMemberForm } from "@/features/workspace/components/invite-member-form";
import {
  listWorkspaceMembers,
  resolveActiveWorkspace,
} from "@/features/workspace/services/workspace-service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("settings") };
}

export default async function SettingsPage() {
  const t = await getTranslations("nav");
  const tWorkspace = await getTranslations("workspace");
  const tCommon = await getTranslations("common");

  if (!isSupabaseConfigured()) {
    return <EmptyState title={t("settings")} description={tCommon("comingSoon")} />;
  }

  let active: Awaited<ReturnType<typeof resolveActiveWorkspace>> = null;
  let members: Awaited<ReturnType<typeof listWorkspaceMembers>> = [];

  try {
    active = await resolveActiveWorkspace();
    if (active) {
      members = await listWorkspaceMembers(active.id);
    }
  } catch {
    return <EmptyState title={t("settings")} description={tCommon("comingSoon")} />;
  }

  if (!active) {
    return <EmptyState title={t("settings")} description={tCommon("comingSoon")} />;
  }

  const canInvite = active.role === "owner" || active.role === "admin";

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings")}</h1>
        <p className="text-sm text-muted-foreground">
          {tWorkspace("settings")} · {active.name}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">{tWorkspace("members")}</h2>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card/50">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.displayName || member.email}</p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{member.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {canInvite ? (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-foreground">{tWorkspace("invite")}</h2>
          <div className="max-w-md rounded-xl border border-border bg-card/50 p-4">
            <InviteMemberForm workspaceId={active.id} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
