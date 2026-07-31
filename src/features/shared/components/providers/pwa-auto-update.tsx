"use client";

import { useSerwist } from "@serwist/next/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "@/features/shared/components/feedback/toast";

const UPDATE_CHECK_MS = 60_000;

/**
 * Checks for a new service worker and reloads the installed webapp automatically
 * when an update takes control — keeps standalone installs on the latest build.
 */
export function PwaAutoUpdate() {
  const { serwist } = useSerwist();
  const t = useTranslations("pwa");
  const reloading = useRef(false);

  useEffect(() => {
    if (!serwist || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const reloadApp = () => {
      if (reloading.current) return;
      reloading.current = true;
      toast.message(t("updating"));
      window.setTimeout(() => {
        window.location.reload();
      }, 280);
    };

    const onWaiting = () => {
      void serwist.messageSkipWaiting();
    };

    const onControlling = (event: { isUpdate?: boolean }) => {
      // Skip first-time claim; only reload when replacing an existing SW.
      if (event.isUpdate) {
        reloadApp();
      }
    };

    serwist.addEventListener("waiting", onWaiting);
    serwist.addEventListener("controlling", onControlling);

    const checkForUpdate = () => {
      void navigator.serviceWorker.getRegistration().then((registration) => {
        void registration?.update();
      });
    };

    const initial = window.setTimeout(checkForUpdate, 2_500);
    const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", checkForUpdate);
    window.addEventListener("online", checkForUpdate);

    return () => {
      serwist.removeEventListener("waiting", onWaiting);
      serwist.removeEventListener("controlling", onControlling);
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", checkForUpdate);
      window.removeEventListener("online", checkForUpdate);
    };
  }, [serwist, t]);

  return null;
}
