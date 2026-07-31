import { describe, expect, it } from "vitest";
import { roleHasPermission } from "@/features/workspace";
import { cn } from "@/lib/utils";

describe("RBAC", () => {
  it("grants owner full workspace control", () => {
    expect(roleHasPermission("owner", "workspace.delete")).toBe(true);
    expect(roleHasPermission("owner", "members.invite")).toBe(true);
  });

  it("prevents admin from deleting workspace", () => {
    expect(roleHasPermission("admin", "workspace.delete")).toBe(false);
    expect(roleHasPermission("admin", "workspace.manage")).toBe(true);
  });

  it("keeps viewer read-only on shopping", () => {
    expect(roleHasPermission("viewer", "shopping.read")).toBe(true);
    expect(roleHasPermission("viewer", "shopping.write")).toBe(false);
  });
});

describe("cn", () => {
  it("merges tailwind classes without duplicates", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
