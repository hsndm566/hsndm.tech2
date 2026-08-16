export function isClerkOriginAllowed(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "hsndm.tech" || normalized.endsWith(".hsndm.tech");
}

export function canUseClerkOnCurrentOrigin() {
  return typeof window !== "undefined" && isClerkOriginAllowed(window.location.hostname);
}
