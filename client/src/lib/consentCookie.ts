export function consentCookieAttributes(maxAgeValue: number, protocol = typeof window !== "undefined" ? window.location.protocol : "https:") {
  const secure = protocol === "https:" ? "; Secure" : "";
  return `Path=/; Max-Age=${maxAgeValue}; SameSite=Lax${secure}`;
}
