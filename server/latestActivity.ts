type LatestActivityRow = {
  createdAt: Date | string | number | null | undefined;
};

/**
 * Converts the only public activity datum into a safe epoch value. Application
 * details stay inside protected routes; malformed timestamps fall back to null.
 */
export function normalizeLatestActivityTimestamp(row: LatestActivityRow | null | undefined): number | null {
  if (!row?.createdAt) return null;
  const timestamp = new Date(row.createdAt).getTime();
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}
