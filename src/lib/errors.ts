export class DomainError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
  }
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(code: string, message: string): ActionResult<T> {
  return { ok: false, error: { code, message } };
}
