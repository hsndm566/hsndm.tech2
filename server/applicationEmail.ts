import type { Express, Request, Response } from "express";
import { z } from "zod";
import { authenticateSupabaseRequest } from "./_core/context";

const applicationEmailInput = z.object({
  toEmail: z.string().trim().email().max(320),
  companyName: z.string().trim().min(2).max(150),
  roleTitle: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(64),
  candidateName: z.string().trim().min(2).max(120),
  candidateEmail: z.string().trim().email().max(320),
  message: z.string().trim().min(20).max(3000),
  cvSummary: z.string().trim().max(1200).optional().or(z.literal("")),
});

export type ApplicationEmailInput = z.infer<typeof applicationEmailInput>;

type FetchLike = typeof fetch;

export function createApplicationEmailPayload(input: ApplicationEmailInput, candidateEmail: string) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "apply@hsndm.tech";
  const senderName = process.env.BREVO_SENDER_NAME || "AutoApply SA";
  const subject = `${input.candidateName} for ${input.roleTitle}`;
  const summary = input.cvSummary ? `\n\nCV summary:\n${input.cvSummary}` : "";
  const textContent = [
    `Hello ${input.companyName} team,`,
    "",
    input.message,
    summary,
    "",
    `Role: ${input.roleTitle}`,
    `Location: ${input.city}`,
    `Candidate: ${input.candidateName}`,
    `Reply to: ${candidateEmail}`,
    "",
    "Sent from AutoApply SA after candidate review.",
  ].join("\n");

  return {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: input.toEmail }],
    replyTo: { email: candidateEmail, name: input.candidateName },
    subject,
    textContent,
  };
}

export async function sendApplicationEmail(input: ApplicationEmailInput, candidateEmail: string, fetchImpl: FetchLike = fetch) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !process.env.BREVO_SENDER_EMAIL) return { ok: false, status: 503, reason: "brevo-not-configured" as const };
  const response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json", "idempotency-key": `application-${input.toEmail}-${input.companyName}-${input.roleTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 120) },
    body: JSON.stringify(createApplicationEmailPayload(input, candidateEmail)),
    signal: AbortSignal.timeout(15_000),
  });
  return { ok: response.ok, status: response.status, reason: response.ok ? "sent" as const : "brevo-rejected" as const };
}

const defaultJobs = [
  { companyName: "Saudi Digital Bank", roleTitle: "Operations Analyst", city: "Riyadh", source: "LinkedIn", summary: "Operations reporting, workflow improvement and stakeholder coordination." },
  { companyName: "Red Sea Global", roleTitle: "Project Coordinator", city: "Jeddah", source: "Company careers", summary: "Planning support, vendor follow-up and project documentation." },
  { companyName: "STC Solutions", roleTitle: "Customer Success Specialist", city: "Riyadh", source: "Career page", summary: "Account support, onboarding and bilingual customer communications." },
  { companyName: "Tamara", roleTitle: "Business Analyst", city: "Remote", source: "Wellfound", summary: "Data review, product operations and weekly performance insights." },
];

function jobSearchUrl(role: string, city: string) {
  const query = new URLSearchParams({ keywords: role, location: city === "Remote" ? "Saudi Arabia" : `${city}, Saudi Arabia` });
  return `https://www.linkedin.com/jobs/search/?${query.toString()}`;
}

export async function checkApplicationDeliveryReadiness(fetchImpl: FetchLike = fetch) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !process.env.BREVO_SENDER_EMAIL) {
    return { ok: false, status: 503, reason: "brevo-not-configured" as const };
  }
  try {
    const response = await fetchImpl("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: { "api-key": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    return {
      ok: response.ok,
      status: response.status,
      reason: response.ok ? "ready" as const : "brevo-readiness-failed" as const,
    };
  } catch {
    return { ok: false, status: 502, reason: "brevo-readiness-failed" as const };
  }
}

export function registerApplicationEmailRoutes(app: Express) {
  app.get("/api/v2/jobs/recommended", async (req: Request, res: Response) => {
    const user = await authenticateSupabaseRequest(req as never);
    if (!user) return res.status(401).json({ error: "sign-in-required" });
    const city = typeof req.query.city === "string" && req.query.city.trim() ? req.query.city.trim() : "Riyadh";
    const role = typeof req.query.role === "string" && req.query.role.trim() ? req.query.role.trim() : "Operations";
    const liveEndpoint = process.env.JOB_DISCOVERY_ENDPOINT;
    if (liveEndpoint) {
      try {
        const response = await fetch(`${liveEndpoint}?${new URLSearchParams({ city, role })}`, { signal: AbortSignal.timeout(8_000) });
        if (response.ok) {
          const payload = await response.json();
          if (Array.isArray(payload.jobs)) return res.status(200).json({ jobs: payload.jobs.slice(0, 8), mode: "live", checkedAt: new Date().toISOString() });
        }
      } catch {}
    }
    const jobs = defaultJobs.map((job, index) => {
      const roleTitle = index === 0 && role ? `${role} ${job.roleTitle}`.replace(/\s+/g, " ").trim() : job.roleTitle;
      const jobCity = index < 2 ? city : job.city;
      return {
        id: `${job.companyName}-${roleTitle}-${jobCity}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        ...job,
        roleTitle,
        city: jobCity,
        url: jobSearchUrl(roleTitle, jobCity),
        matchReason: `Based on your ${role || "target"} direction and ${city} preference.`,
        freshness: "Search link refreshed now",
      };
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ jobs, mode: "curated", checkedAt: new Date().toISOString() });
  });

  app.get("/api/v2/applications/readiness", async (req: Request, res: Response) => {
    const user = await authenticateSupabaseRequest(req as never);
    if (!user) return res.status(401).json({ error: "sign-in-required" });
    const result = await checkApplicationDeliveryReadiness();
    if (!result.ok) return res.status(result.status).json({ error: result.reason });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true });
  });

  app.post("/api/v2/applications/send-email", async (req: Request, res: Response) => {
    const user = await authenticateSupabaseRequest(req as never);
    if (!user) return res.status(401).json({ error: "sign-in-required" });
    const parsed = applicationEmailInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid-application-email" });
    const candidateEmail = user.email || parsed.data.candidateEmail;
    if (user.email && parsed.data.candidateEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: "candidate-email-mismatch" });
    }
    try {
      const result = await sendApplicationEmail(parsed.data, candidateEmail);
      if (!result.ok) return res.status(result.status).json({ error: result.reason });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(502).json({ error: "application-email-failed" });
    }
  });
}
