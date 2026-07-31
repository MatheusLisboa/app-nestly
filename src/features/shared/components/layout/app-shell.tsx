import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { AppSidebar, AppTopbar } from "@/features/shared/components/layout/app-chrome";

interface AppShellProps {
  children: ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const t = await getTranslations("a11y");

  return (
    <div className="flex min-h-dvh w-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <AppTopbar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
