/**
 * Application-level constants (non-brand).
 */
export const appConfig = {
  defaultLocale: "pt-BR" as const,
  locales: ["pt-BR"] as const,
  /** UI label for Workspace — product copy may say "Família" */
  workspaceDisplayNameKey: "workspace.displayName" as const,
  /** Cookie / storage key for active workspace */
  activeWorkspaceCookie: "myninho_active_workspace",
  defaultTheme: "system" as const,
} as const;

export type AppLocale = (typeof appConfig.locales)[number];
