import { notifyOwner } from "./_core/notification";

const clientAlertCooldowns = new Map<string, number>();
const CLIENT_ALERT_COOLDOWN_MS = 10 * 60 * 1000;

function compactReason(error: unknown) {
  return String(error instanceof Error ? error.message : error || "unknown failure")
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

/** Sends owner-only operational context without candidate content, CV text, or contact details. */
export async function notifyOperationalFailure(workflow: "ATS analysis" | "campaign readiness" | "application creation", error: unknown) {
  await notifyOwner({
    title: `AutoApply SA workflow alert: ${workflow}`,
    content: `The ${workflow} workflow failed at ${new Date().toISOString()}. Reason: ${compactReason(error)}. No candidate CV text or contact details are included in this alert.`,
  }).catch(() => false);
}

/** Limits repeat browser fallback alerts and never accepts candidate-provided content. */
export async function notifyClientWorkflowFallback(route: "/" | "/ar" | "/enquire" | "/ar/enquire") {
  const key = `whatsapp-popup-blocked:${route}`;
  const now = Date.now();
  if ((clientAlertCooldowns.get(key) || 0) + CLIENT_ALERT_COOLDOWN_MS > now) return false;
  clientAlertCooldowns.set(key, now);
  return notifyOwner({
    title: "AutoApply SA workflow alert: WhatsApp handoff fallback",
    content: `A browser blocked the new-window WhatsApp handoff on ${route} at ${new Date(now).toISOString()}. The visitor was redirected in the current tab instead. No candidate CV text, contact details, or form values are included.`,
  }).catch(() => false);
}

/** Records a browser-side extraction failure without receiving any CV content or file metadata. */
export async function notifyClientCvExtractionFailure(route: "/" | "/ar" | "/ats") {
  const key = `cv-extraction-failed:${route}`;
  const now = Date.now();
  if ((clientAlertCooldowns.get(key) || 0) + CLIENT_ALERT_COOLDOWN_MS > now) return false;
  clientAlertCooldowns.set(key, now);
  return notifyOwner({
    title: "AutoApply SA workflow alert: local CV extraction",
    content: `Local browser CV extraction failed on ${route} at ${new Date(now).toISOString()}. The visitor received the normal readable-file fallback. No CV text, file name, contact details, or form values are included.`,
  }).catch(() => false);
}
