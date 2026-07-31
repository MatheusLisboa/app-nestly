import {
  Baby,
  CalendarDays,
  CheckSquare,
  Home,
  type LucideIcon,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Wallet,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey:
    | "dashboard"
    | "shopping"
    | "inventory"
    | "checklists"
    | "cleaning"
    | "bills"
    | "calendar"
    | "baby"
    | "settings";
  icon: LucideIcon;
  /** Feature modules not yet implemented — shown disabled */
  disabled?: boolean;
}

/** Shipped modules — keep `disabled` only for not-yet-built features. */
export const mainNav: NavItem[] = [
  { href: "/", labelKey: "dashboard", icon: Home },
  { href: "/baby", labelKey: "baby", icon: Baby },
  { href: "/shopping", labelKey: "shopping", icon: ShoppingCart },
  { href: "/inventory", labelKey: "inventory", icon: Package },
  { href: "/checklists", labelKey: "checklists", icon: CheckSquare },
  { href: "/cleaning", labelKey: "cleaning", icon: Sparkles },
  { href: "/bills", labelKey: "bills", icon: Wallet },
  { href: "/calendar", labelKey: "calendar", icon: CalendarDays },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

/** Primary shortcuts for mobile bottom bar (enabled modules only). */
export const mobileNavKeys: NavItem["labelKey"][] = [
  "dashboard",
  "baby",
  "shopping",
  "calendar",
];

/** Modules reachable via the mobile "Mais" drawer. */
export const mobileMoreNavKeys: NavItem["labelKey"][] = [
  "inventory",
  "checklists",
  "cleaning",
  "bills",
  "settings",
];
