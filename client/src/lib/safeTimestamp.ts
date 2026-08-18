export function safeTimestampMs(value: unknown): number {
  const timestamp = value instanceof Date
    ? value.getTime()
    : typeof value === "string" || typeof value === "number"
      ? new Date(value).getTime()
      : Number.NaN;

  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}

export function toActivityTimestamp(...values: unknown[]): string {
  const timestamp = values.map(safeTimestampMs).find((value) => value > 0);
  return timestamp ? new Date(timestamp).toISOString() : "";
}

export function formatSafeDate(value: unknown, options?: Intl.DateTimeFormatOptions): string {
  const timestamp = safeTimestampMs(value);
  return timestamp ? new Date(timestamp).toLocaleDateString(undefined, options) : "Date unavailable";
}

export function formatSafeDateTime(value: unknown): string {
  const timestamp = safeTimestampMs(value);
  return timestamp ? new Date(timestamp).toLocaleString() : "Date unavailable";
}
