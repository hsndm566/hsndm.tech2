import * as Sentry from "@sentry/react";

const OPTIONAL_CONSENT_COOKIE = "autoapply_optional_consent=accepted";
const MAX_MESSAGE_LENGTH = 180;

function hasOptionalConsent() {
  return typeof document !== "undefined" && document.cookie.split("; ").includes(OPTIONAL_CONSENT_COOKIE);
}

export function sanitizeSentryText(value: unknown) {
  return String(value || "unknown error")
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?:\+?966\s?5\d|05\d)[\s-]?\d{3}[\s-]?\d{4}/g, "[phone]")
    .replace(/\b\d{8,}\b/g, "[number]")
    .replace(/\s+/g, " ")
    .slice(0, MAX_MESSAGE_LENGTH);
}

function currentRoute() {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

let dsnRequest: Promise<string | null> | null = null;

export async function resolveSentryDsn() {
  const buildDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (buildDsn) return buildDsn;
  if (typeof window === "undefined") return null;

  dsnRequest ??= fetch("/api/client-config/sentry", { credentials: "same-origin", headers: { Accept: "application/json" } })
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = await response.json() as { dsn?: unknown };
      return typeof payload.dsn === "string" && payload.dsn.startsWith("http") ? payload.dsn : null;
    })
    .catch(() => null);
  return dsnRequest;
}

function sanitizeEvent(event: Sentry.ErrorEvent) {
  event.request = undefined;
  event.user = undefined;
  event.contexts = undefined;
  event.extra = undefined;
  event.breadcrumbs = undefined;
  event.transaction = `route:${currentRoute()}`;
  event.tags = { source: "autoapply-web", privacy: "redacted" };
  event.exception?.values?.forEach((exception) => {
    exception.value = sanitizeSentryText(exception.value);
    if (exception.stacktrace?.frames) {
      exception.stacktrace.frames = exception.stacktrace.frames.map((frame) => ({
        ...frame,
        abs_path: undefined,
        filename: "[source]",
      }));
    }
  });
  return event;
}

export async function startOptionalSentry() {
  const dsn = await resolveSentryDsn();
  if (!dsn || !hasOptionalConsent() || Sentry.getClient()) return false;

  Sentry.init({
    dsn,
    enabled: true,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    beforeBreadcrumb: () => null,
    beforeSend: sanitizeEvent,
  });
  return true;
}

export function captureClientReliabilitySignal(type: string, message: unknown) {
  if (!Sentry.getClient()) return;
  Sentry.withScope((scope) => {
    scope.setTag("reliability_signal", sanitizeSentryText(type));
    scope.setTag("route", currentRoute());
    scope.setFingerprint(["client-reliability", sanitizeSentryText(type)]);
    Sentry.captureMessage(sanitizeSentryText(message), "warning");
  });
}

export function captureBoundaryException(error: Error) {
  if (!Sentry.getClient()) return;
  Sentry.withScope((scope) => {
    scope.setTag("boundary", "route-recovery");
    scope.setTag("route", currentRoute());
    Sentry.captureException(error);
  });
}

export function installOptionalSentry() {
  void startOptionalSentry();
  window.addEventListener("autoapply:optional-consent", () => { void startOptionalSentry(); });
}
