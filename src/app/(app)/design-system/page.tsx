import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/features/shared/components/design-system/showcase";

export const metadata: Metadata = {
  title: "Design System",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
