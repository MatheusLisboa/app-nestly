"use client";

import { SerwistProvider } from "@serwist/next/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import { appConfig } from "@/config/app";
import { Toaster } from "@/features/shared/components/feedback/toast";
import { PwaAutoUpdate } from "@/features/shared/components/providers/pwa-auto-update";

interface AppProvidersProps {
  children: ReactNode;
}

const serwistDisabled = process.env.NODE_ENV === "development";

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: true,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={appConfig.defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <SerwistProvider
        swUrl="/sw.js"
        disable={serwistDisabled}
        register={!serwistDisabled}
        cacheOnNavigation
        reloadOnOnline={false}
      >
        <QueryClientProvider client={queryClient}>
          <PwaAutoUpdate />
          {children}
          <Toaster />
        </QueryClientProvider>
      </SerwistProvider>
    </ThemeProvider>
  );
}
