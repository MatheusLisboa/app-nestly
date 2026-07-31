/**
 * Datetime helpers for Nestly.
 * Workspace default timezone is America/Sao_Paulo (UTC−3, no DST since 2019).
 *
 * `<input type="datetime-local">` yields "YYYY-MM-DDTHH:mm" with no offset.
 * Parsing that with `new Date(...).toISOString()` on a UTC server treats it as
 * UTC and shifts display by −3h in Brazil. Always convert via these helpers.
 */

export const DEFAULT_WORKSPACE_TIMEZONE = "America/Sao_Paulo";

const LOCAL_DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

function hasExplicitOffset(value: string): boolean {
  return /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value.trim());
}

/** Offset of `timeZone` at `instantMs`, in milliseconds east of UTC (e.g. −3h → −10800000). */
function getTimeZoneOffsetMs(timeZone: string, instantMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "numeric",
  }).formatToParts(new Date(instantMs));

  const raw = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  if (raw === "GMT" || raw === "UTC") return 0;

  const match = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return 0;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes) * 60 * 1000;
}

/**
 * Interprets a datetime-local / date string as wall clock in `timeZone`
 * and returns a UTC ISO string.
 */
export function localDateTimeToUtcIso(
  value: string,
  timeZone: string = DEFAULT_WORKSPACE_TIMEZONE,
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Empty datetime");
  }

  if (hasExplicitOffset(trimmed)) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid datetime: ${value}`);
    }
    return parsed.toISOString();
  }

  const match = trimmed.match(LOCAL_DATE_TIME_RE);
  if (!match) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid datetime: ${value}`);
    }
    return parsed.toISOString();
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? 12);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);

  // Treat components as UTC, then subtract the zone offset so wall time matches.
  const asUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  let offset = getTimeZoneOffsetMs(timeZone, asUtcMs);
  let utcMs = asUtcMs - offset;
  // Refine once around DST / historical offset boundaries.
  offset = getTimeZoneOffsetMs(timeZone, utcMs);
  utcMs = asUtcMs - offset;

  return new Date(utcMs).toISOString();
}

export function formatInTimeZone(
  iso: string,
  options: Intl.DateTimeFormatOptions,
  timeZone: string = DEFAULT_WORKSPACE_TIMEZONE,
  locale = "pt-BR",
): string {
  return new Date(iso).toLocaleString(locale, { timeZone, ...options });
}

export function formatDateTimePtBr(
  iso: string,
  timeZone: string = DEFAULT_WORKSPACE_TIMEZONE,
): string {
  return formatInTimeZone(
    iso,
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
    timeZone,
  );
}

export function formatTimePtBr(
  iso: string,
  timeZone: string = DEFAULT_WORKSPACE_TIMEZONE,
): string {
  return formatInTimeZone(
    iso,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
    timeZone,
  );
}
