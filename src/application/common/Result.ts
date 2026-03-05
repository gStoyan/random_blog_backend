export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const Ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const Err = <T = never>(error: string): Result<T> => ({ ok: false, error });
