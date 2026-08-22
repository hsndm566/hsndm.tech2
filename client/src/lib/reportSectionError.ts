/**
 * Privacy-safe section failure signal. It deliberately does not send CV, form,
 * contact, browser, or network data and does not depend on the private API.
 */
export function reportSectionError(section: string, error: unknown) {
  const message = String(error instanceof Error ? error.message : error || "unknown error")
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("autoapply:section-error", {
    detail: { section: section.slice(0, 64), message, ts: Date.now() },
  }));
}
