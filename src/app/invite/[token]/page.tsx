import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { isSupabaseConfigured } from "@/config/env";
import { getSessionUser } from "@/features/auth/services/session";
import { AcceptInviteClient } from "@/features/workspace/components/accept-invite-client";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const t = await getTranslations("workspace");

  if (!isSupabaseConfigured()) {
    return (
      <InviteShell title={t("inviteTitle")}>
        <p className="text-sm text-muted-foreground">{t("supabaseRequired")}</p>
      </InviteShell>
    );
  }

  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  return (
    <InviteShell title={t("inviteTitle")}>
      <AcceptInviteClient token={token} />
    </InviteShell>
  );
}

function InviteShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card/80 p-8 text-center shadow-soft">
        <p className="text-sm font-medium text-primary">{brand.name}</p>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}
