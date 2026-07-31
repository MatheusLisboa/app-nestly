"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { brand } from "@/config/brand";
import { UserMenu } from "@/features/auth/components/user-menu";
import { Logo } from "@/features/shared/components/brand/logo";
import { BottomNavigation } from "@/features/shared/components/layout/bottom-navigation";
import { Header } from "@/features/shared/components/layout/header";
import {
  mainNav,
  mobileMoreNavKeys,
  mobileNavKeys,
} from "@/features/shared/components/layout/nav-config";
import { Sidebar, SidebarNavItem } from "@/features/shared/components/layout/sidebar";
import { ThemeToggle } from "@/features/shared/components/layout/theme-toggle";
import { Button } from "@/features/shared/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/features/shared/components/ui/drawer";
import { Icon } from "@/features/shared/components/ui/icon";
import { Separator } from "@/features/shared/components/ui/separator";
import { useUiShellStore } from "@/features/shared/stores/ui-shell-store";
import { useWorkspaceShell } from "@/features/workspace/components/workspace-shell-provider";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const { user, workspaces, activeWorkspace } = useWorkspaceShell();

  return (
    <Sidebar
      aria-label={tA11y("mainNavigation")}
      header={
        <div className="space-y-3 px-1 pt-1">
          <Link href="/" className="block px-2 py-1">
            <Logo size="sm" />
          </Link>
          <WorkspaceSwitcher workspaces={workspaces} active={activeWorkspace} />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          {user ? <UserMenu email={user.email} displayName={user.displayName} /> : <span />}
          <ThemeToggle />
        </div>
      }
    >
      <nav className="flex flex-col gap-0.5">
        {mainNav.map((item) => {
          const Glyph = item.icon;
          const active = isActivePath(pathname, item.href);

          if (item.disabled) {
            return (
              <SidebarNavItem key={item.href} disabled icon={<Glyph />} title={tNav(item.labelKey)}>
                {tNav(item.labelKey)}
              </SidebarNavItem>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="block">
              <SidebarNavItem active={active} icon={<Glyph />}>
                {tNav(item.labelKey)}
              </SidebarNavItem>
            </Link>
          );
        })}
      </nav>
      <Separator className="my-3 bg-sidebar-border" />
      <p className="px-3 text-[11px] leading-relaxed text-muted-foreground">{brand.tagline}</p>
    </Sidebar>
  );
}

export function AppTopbar() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const { user, workspaces, activeWorkspace } = useWorkspaceShell();
  const mobileNavOpen = useUiShellStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiShellStore((s) => s.setMobileNavOpen);

  const current = mainNav.find((item) => isActivePath(pathname, item.href));
  const pageTitle = current ? tNav(current.labelKey) : (activeWorkspace?.name ?? brand.name);

  const primaryItems = mobileNavKeys
    .map((key) => mainNav.find((item) => item.labelKey === key))
    .filter((item): item is (typeof mainNav)[number] => item != null && !item.disabled)
    .map((item) => ({
      href: item.href,
      label: tNav(item.labelKey),
      icon: item.icon,
      active: isActivePath(pathname, item.href),
    }));

  const moreItems = mobileMoreNavKeys
    .map((key) => mainNav.find((item) => item.labelKey === key))
    .filter((item): item is (typeof mainNav)[number] => item != null && !item.disabled);

  const moreActive = moreItems.some((item) => isActivePath(pathname, item.href));

  return (
    <>
      <Header
        className="pt-[env(safe-area-inset-top)]"
        title={<span className="hidden md:inline">{pageTitle}</span>}
        leading={
          <Link href="/" className="flex min-w-0 items-center gap-2 md:hidden">
            <Logo variant="mark" size="sm" />
            <span className="truncate text-[0.9375rem] font-bold tracking-tight">
              {activeWorkspace?.name ?? brand.name}
            </span>
          </Link>
        }
        trailing={
          <div className="flex items-center gap-0.5 md:hidden">
            {user ? <UserMenu email={user.email} displayName={user.displayName} /> : null}
            <ThemeToggle />
          </div>
        }
      />

      <BottomNavigation
        items={primaryItems}
        more={{
          label: tNav("more"),
          active: moreActive,
          onClick: () => setMobileNavOpen(true),
        }}
        aria-label={tA11y("mainNavigation")}
      />

      <Drawer open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DrawerContent className="pb-[env(safe-area-inset-bottom)] md:hidden">
          <DrawerHeader>
            <DrawerTitle>{tA11y("moreModules")}</DrawerTitle>
            <DrawerDescription>{brand.tagline}</DrawerDescription>
          </DrawerHeader>
          <div className="mb-4">
            <WorkspaceSwitcher workspaces={workspaces} active={activeWorkspace} />
          </div>
          <nav className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {moreItems.map((item) => {
              const Glyph = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border border-border/80 bg-card/70 px-2 py-4 text-center shadow-xs transition-soft",
                    active
                      ? "border-primary/30 bg-primary-soft text-primary"
                      : "text-foreground hover:bg-muted/80",
                  )}
                >
                  <Icon icon={Glyph} />
                  <span className="text-xs font-semibold tracking-tight">
                    {tNav(item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => setMobileNavOpen(false)}>
              {tA11y("closeMenu")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
