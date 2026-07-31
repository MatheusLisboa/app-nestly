"use client";

import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { Icon } from "@/features/shared/components/ui/icon";

const DISMISS_KEY = "nestly:pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return true;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && !chrome;
}

/**
 * Soft install banner for the Nestly PWA (Chrome/Edge + iOS tip).
 */
export function PwaInstallPrompt() {
  const t = useTranslations("pwa");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosTip, setIosTip] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // ignore
    }

    if (isIosSafari()) {
      setIosTip(true);
      setVisible(true);
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    setDeferred(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
    if (choice.outcome === "accepted") {
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // ignore
      }
    }
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-3 md:bottom-6">
      <div className="pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-md">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon icon={Download} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight">{t("installTitle")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {iosTip ? t("installIosHint") : t("installDescription")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {!iosTip && deferred ? (
              <Button type="button" size="sm" onClick={install}>
                {t("installCta")}
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
              {t("installLater")}
            </Button>
          </div>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={t("installDismiss")}
          onClick={dismiss}
        >
          <Icon icon={X} size="sm" />
        </Button>
      </div>
    </div>
  );
}
