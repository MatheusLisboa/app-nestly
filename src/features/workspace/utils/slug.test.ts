import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/features/workspace/utils/slug";

describe("slugify", () => {
  it("normalizes accents and spaces", () => {
    expect(slugify("Família Lisboa")).toBe("familia-lisboa");
  });

  it("builds unique slugs with suffix", () => {
    expect(uniqueSlug("Apartamento 302", "a1b2")).toBe("apartamento-302-a1b2");
  });
});
