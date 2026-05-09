/**
 * Tiny in-house replacements for the few lodash / date-fns helpers the
 * original used. Keeps the dependency surface minimal.
 */

/**
 * Dot-path lookup, e.g. `getByPath(row, "user.profile.name")`.
 * Returns undefined if any segment is missing. Mirrors the small subset
 * of `lodash.get` we actually need.
 */
export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/**
 * True if the input is a parseable date — used to decide between
 * date-aware and string-locale sorting in the table.
 *
 * Mirrors `date-fns.isValid` behavior for the value shapes the table
 * actually receives (strings, numbers, Dates).
 */
export function isParseableDate(value: unknown): boolean {
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return !isNaN(parsed);
  }
  return false;
}
