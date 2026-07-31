import { Baby, CalendarDays, ChevronRight, ShoppingCart, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import type { TodayDigest, TodayDigestItem } from "@/features/dashboard/services/today-digest";
import { Badge, Icon } from "@/features/shared";
import { SoftLink } from "@/features/shared/components/layout/soft-link";
import { cn } from "@/lib/utils";

type Labels = {
  today: string;
  shopping: string;
  shoppingCount: string;
  bills: string;
  cleaning: string;
  calendar: string;
  medical: string;
  baby: string;
  emptyTitle: string;
  emptyDescription: string;
  seeAll: string;
  statusExpected: string;
  statusBorn: string;
};

export function TodayDashboard({ digest, labels }: { digest: TodayDigest; labels: Labels }) {
  if (!digest.hasAnything) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card/70 p-6 text-center shadow-xs">
        <p className="text-base font-semibold tracking-tight">{labels.emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{labels.emptyDescription}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <QuickLink href="/shopping" label={labels.shopping} />
          <QuickLink href="/baby" label={labels.baby} />
          <QuickLink href="/bills" label={labels.bills} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {digest.baby ? (
        <SoftLink
          href={digest.baby.href}
          className="col-span-full flex items-center gap-3 rounded-3xl border border-primary/20 bg-primary-soft/60 p-4 shadow-xs transition-soft hover:bg-primary-soft"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Icon icon={Baby} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-bold tracking-tight">{digest.baby.name}</span>
              <Badge variant="secondary">
                {digest.baby.status === "born" ? labels.statusBorn : labels.statusExpected}
              </Badge>
            </span>
            <span className="block text-sm text-muted-foreground">{digest.baby.headline}</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </SoftLink>
      ) : null}

      <DigestSection
        title={labels.shopping}
        href="/shopping"
        icon={ShoppingCart}
        badge={
          digest.shoppingOpen > 0
            ? labels.shoppingCount.replace("{count}", String(digest.shoppingOpen))
            : undefined
        }
        items={digest.shoppingPreview}
        seeAll={labels.seeAll}
      />

      <DigestSection
        title={labels.bills}
        href="/bills"
        icon={Wallet}
        items={digest.billsAttention}
        seeAll={labels.seeAll}
      />

      <DigestSection
        title={labels.cleaning}
        href="/cleaning"
        icon={Sparkles}
        items={digest.cleaningAttention}
        seeAll={labels.seeAll}
      />

      <DigestSection
        title={labels.calendar}
        href="/calendar"
        icon={CalendarDays}
        items={digest.upcomingEvents}
        seeAll={labels.seeAll}
      />

      {digest.upcomingMedical.length > 0 ? (
        <DigestSection
          title={labels.medical}
          href="/baby"
          icon={Baby}
          items={digest.upcomingMedical}
          seeAll={labels.seeAll}
          className="lg:col-span-2"
        />
      ) : null}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-soft hover:bg-muted"
    >
      {label}
    </Link>
  );
}

function DigestSection({
  title,
  href,
  icon: Glyph,
  items,
  seeAll,
  badge,
  className,
}: {
  title: string;
  href: string;
  icon: typeof ShoppingCart;
  items: TodayDigestItem[];
  seeAll: string;
  badge?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-border/80 bg-card/70 shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon icon={Glyph} size="sm" className="text-primary" />
          <h2 className="truncate text-sm font-bold tracking-tight">{title}</h2>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
        <SoftLink href={href} className="text-xs font-semibold text-primary">
          {seeAll}
        </SoftLink>
      </div>
      <ul className="divide-y divide-border/70">
        {items.map((item) => (
          <li key={item.id}>
            <SoftLink
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 transition-soft hover:bg-muted/50"
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  item.tone === "urgent" && "bg-destructive",
                  item.tone === "today" && "bg-accent",
                  item.tone === "soon" && "bg-primary",
                  item.tone === "neutral" && "bg-muted-foreground/40",
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium tracking-tight">
                  {item.title}
                </span>
                {item.meta ? (
                  <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
                ) : null}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </SoftLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
