import { getRequestConfig } from "next-intl/server";
import { appConfig } from "@/config/app";

export default getRequestConfig(async () => {
  const locale = appConfig.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
