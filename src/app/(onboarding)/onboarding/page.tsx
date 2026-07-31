import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { isSupabaseConfigured } from "@/config/env";
import { getSessionUser } from "@/features/auth/services/session";
import { Logo } from "@/features/shared/components/brand/logo";
import { ThemeToggle } from "@/features/shared/components/layout/theme-toggle";
import { CreateWorkspaceForm } from "@/features/workspace/components/create-workspace-form";
import { listUserWorkspaces } from "@/features/workspace/services/workspace-service";

export default async function OnboardingPage() {
  const t = await getTranslations("workspace");
  const tAuth = await getTranslations("auth");

  if (!isSupabaseConfigured()) {
    return (
      <OnboardingShell title={t("onboardingTitle")} description={tAuth("supabaseNotConfigured")}>
        <p className="text-sm text-muted-foreground">{brand.tagline}</p>
      </OnboardingShell>
    );
  }

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const workspaces = await listUserWorkspaces();
    if (workspaces.length > 0) {
      redirect("/");
    }
  } catch {
    // Tables may be missing — still show create form so errors surface clearly.
  }

  return (
    <OnboardingShell title={t("onboardingTitle")} description={t("onboardingDescription")}>
      <CreateWorkspaceForm />
    </OnboardingShell>
  );
}

function OnboardingShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 70% at 50% -20%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 55%),
            radial-gradient(ellipse 80% 50% at 100% 100%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 50%)
          `,
        }}
      />
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10">
        <ThemeToggle />
      </div>
      <header className="flex justify-center px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-8">
        <Logo size="md" priority />
      </header>
      <div className="flex flex-1 items-stretch justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:items-center sm:py-10">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-border/70 bg-card/85 p-5 shadow-glow backdrop-blur-md sm:p-8">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
