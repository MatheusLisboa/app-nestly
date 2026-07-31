import { type AppLocale, appConfig } from "@/config/app";

export const locales = appConfig.locales;
export const defaultLocale = appConfig.defaultLocale;

export function isAppLocale(value: string): value is AppLocale {
  return (appConfig.locales as readonly string[]).includes(value);
}
