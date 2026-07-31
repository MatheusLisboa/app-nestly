import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { LoginForm } from "@/features/auth/components/login-form";
import { Logo } from "@/features/shared/components/brand/logo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signIn") };
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 70% at 50% -20%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 55%),
            radial-gradient(ellipse 80% 50% at 100% 100%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 50%),
            radial-gradient(ellipse 60% 40% at 0% 80%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 45%)
          `,
        }}
      />

      <header className="flex items-center justify-center px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-8">
        <Logo size="md" priority />
      </header>

      <div className="flex flex-1 items-stretch justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:items-center sm:py-10">
        <div className="flex w-full max-w-md flex-col justify-center rounded-3xl border border-border/70 bg-card/85 p-5 shadow-glow backdrop-blur-md sm:p-8">
          <LoginForm initialError={params.error ?? null} />
          <p className="mt-8 text-center text-xs text-muted-foreground">{brand.tagline}</p>
        </div>
      </div>
    </div>
  );
}
