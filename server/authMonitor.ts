import { eq } from "drizzle-orm";
import { systemJobs } from "../drizzle/schema";
import { getDb } from "./db";

export const AUTH_MONITOR_JOB_NAME = "dashboard-auth-monitor";
export const AUTH_MONITOR_PATH = "/api/scheduled/dashboard-auth-monitor";

type MonitorStatus = "healthy" | "degraded";

export type AuthMonitorCheck = {
  status: MonitorStatus;
  configurationReady: boolean;
  supabaseHealthStatus: number | null;
};

type FetchLike = typeof fetch;

const OWNER_ALERT_EMAIL = "hasanadam506@gmail.com";


function bootstrapRequest() {
  return {
    headers: {
      Accept: "application/json",
      apikey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "",
      Origin: "https://www.hsndm.tech",
      Referer: "https://www.hsndm.tech/dashboard",
    },
    signal: AbortSignal.timeout(10_000),
  };
}

export async function checkDashboardAuth(fetchImpl: FetchLike = fetch): Promise<AuthMonitorCheck> {
  const configurationReady = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY));
  try {
    const response = await fetchImpl(`${process.env.SUPABASE_URL}/auth/v1/health`, bootstrapRequest());
    return {
      status: configurationReady && response.ok ? "healthy" : "degraded",
      configurationReady,
      supabaseHealthStatus: response.status,
    };
  } catch {
    return { status: "degraded", configurationReady, supabaseHealthStatus: null };
  }
}

function monitorEvent(check: AuthMonitorCheck, recovered = false) {
  return {
    monitor: "dashboard-auth",
    status: check.status,
    recovered,
    configuration: check.configurationReady ? "present" : "missing",
    supabaseHealth: check.supabaseHealthStatus === null ? "network-error" : `http-${check.supabaseHealthStatus}`,
  };
}

export function createAuthMonitorAlertText(check: AuthMonitorCheck, recovered = false) {
  const event = monitorEvent(check, recovered);
  const state = recovered ? "recovered" : "requires attention";
  return [
    `AutoApply SA dashboard authentication ${state}.`,
    `Monitor: ${event.monitor}`,
    `Configuration: ${event.configuration}`,
    `Supabase auth health: ${event.supabaseHealth}`,
    "This operational alert contains technical status only.",
  ].join("\n");
}

function sentryEnvelopeUrl(dsn: string) {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.split("/").filter(Boolean).at(-1);
  if (!projectId || !parsed.username) return null;
  return `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${parsed.username}&sentry_client=autoapply-auth-monitor/1.0`;
}

export async function reportAuthMonitorToSentry(check: AuthMonitorCheck, recovered = false, fetchImpl: FetchLike = fetch) {
  const dsn = process.env.SENTRY_DSN;
  const endpoint = dsn ? sentryEnvelopeUrl(dsn) : null;
  if (!endpoint) return false;

  const event = monitorEvent(check, recovered);
  const payload = {
    event_id: crypto.randomUUID().replaceAll("-", ""),
    timestamp: Math.floor(Date.now() / 1000),
    level: recovered ? "info" : "error",
    logger: "autoapply.auth-monitor",
    message: recovered ? "Dashboard authentication dependency recovered" : "Dashboard authentication dependency degraded",
    platform: "node",
    tags: { monitor: event.monitor, privacy: "no-candidate-data", configuration: event.configuration, supabase_health: event.supabaseHealth },
  };
  const envelope = `${JSON.stringify({ dsn })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(payload)}\n`;
  try {
    const response = await fetchImpl(endpoint, { method: "POST", headers: { "Content-Type": "application/x-sentry-envelope" }, body: envelope });
    return response.ok;
  } catch {
    return false;
  }
}

export async function emailAuthMonitorAlert(check: AuthMonitorCheck, recovered = false, fetchImpl: FetchLike = fetch) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;
  try {
    const response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: "apply@hsndm.tech", name: "AutoApply SA Monitoring" },
        to: [{ email: OWNER_ALERT_EMAIL }],
        subject: recovered ? "[AutoApply SA] Dashboard auth recovered" : "[AutoApply SA] Dashboard auth requires attention",
        textContent: createAuthMonitorAlertText(check, recovered),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function runDashboardAuthMonitor(taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("monitor-state-unavailable");
  const rows = await db.select().from(systemJobs).where(eq(systemJobs.heartbeatTaskUid, taskUid)).limit(1);
  const current = rows[0];
  if (!current || current.name !== AUTH_MONITOR_JOB_NAME) return { ok: true, skipped: "orphan" as const };

  const check = await checkDashboardAuth();
  const previous = current.lastStatus as MonitorStatus | null;
  const changed = previous !== check.status;
  const shouldNotify = changed && (check.status === "degraded" || previous === "degraded");
  let sentryReported = false;
  let ownerAlerted = false;
  if (shouldNotify) {
    const recovered = check.status === "healthy";
    [sentryReported, ownerAlerted] = await Promise.all([
      reportAuthMonitorToSentry(check, recovered),
      emailAuthMonitorAlert(check, recovered),
    ]);
  }

  await db.update(systemJobs).set({ lastRunAt: new Date(), lastStatus: check.status }).where(eq(systemJobs.name, AUTH_MONITOR_JOB_NAME));
  return { ok: true, check, changed, sentryReported, ownerAlerted };
}
