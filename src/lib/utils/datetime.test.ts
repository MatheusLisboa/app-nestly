import { describe, expect, it } from "vitest";
import {
  DEFAULT_WORKSPACE_TIMEZONE,
  formatTimePtBr,
  localDateTimeToUtcIso,
} from "./datetime";

describe("localDateTimeToUtcIso", () => {
  it("treats São Paulo wall time as UTC−3", () => {
    const iso = localDateTimeToUtcIso("2026-08-01T10:00", DEFAULT_WORKSPACE_TIMEZONE);
    expect(iso).toBe("2026-08-01T13:00:00.000Z");
  });

  it("keeps explicit offsets", () => {
    expect(localDateTimeToUtcIso("2026-08-01T10:00:00-03:00")).toBe("2026-08-01T13:00:00.000Z");
    expect(localDateTimeToUtcIso("2026-08-01T13:00:00.000Z")).toBe("2026-08-01T13:00:00.000Z");
  });

  it("defaults date-only to noon local", () => {
    const iso = localDateTimeToUtcIso("2026-08-01", DEFAULT_WORKSPACE_TIMEZONE);
    expect(iso).toBe("2026-08-01T15:00:00.000Z");
  });
});

describe("formatTimePtBr", () => {
  it("shows São Paulo wall clock from UTC", () => {
    expect(formatTimePtBr("2026-08-01T13:00:00.000Z")).toMatch(/10:00/);
  });
});
