"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { acceptInviteAction } from "@/features/workspace/actions/workspace-actions";

interface AcceptInviteClientProps {
  token: string;
}

export function AcceptInviteClient({ token }: AcceptInviteClientProps) {
  const t = useTranslations("workspace");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const result = await acceptInviteAction({ token });
      if (cancelled) return;

      if (!result.ok) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      router.replace("/");
      router.refresh();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (loading && !error) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        {t("acceptingInvite")}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
      <Button type="button" onClick={() => router.push("/")}>
        {t("backHome")}
      </Button>
    </div>
  );
}
