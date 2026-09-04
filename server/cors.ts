const productionOrigins = new Set([
  "https://hsndm.tech",
  "https://www.hsndm.tech",
  "https://dashboard.hsndm.tech",
  "https://pay.hsndm.tech",
]);

function isDevelopmentPreview(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) return true;
    return url.protocol === "https:" && (url.hostname.endsWith(".manus.space") || url.hostname.endsWith(".manus.computer"));
  } catch {
    return false;
  }
}

/**
 * Credentialed CORS must never reflect arbitrary preview origins in production.
 * Development remains usable for the managed preview and local Vite environments.
 */
export function isTrustedCorsOrigin(origin: string | undefined, nodeEnv = process.env.NODE_ENV): boolean {
  if (!origin) return false;
  if (productionOrigins.has(origin)) return true;
  return nodeEnv !== "production" && isDevelopmentPreview(origin);
}
