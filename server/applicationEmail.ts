import type { Express, Request, Response } from "express";
import { z } from "zod";
import { authenticateV2Request, safeAttachmentName } from "./v2Supabase";

const applicationSendRequest = z.object({
  toEmail: z.string().trim().email().max(320),
  jobId: z.string().uuid(),
});

export type ApplicationSendRequest = z.infer<typeof applicationSendRequest>;

export type ApplicationEmailInput = {
  toEmail: string;
  companyName: string;
  roleTitle: string;
  city: string;
  candidateName: string;
  message: string;
};

export type CvAttachment = {
  content: string;
  name: string;
};

type FetchLike = typeof fetch;

type VerifiedJobRow = {
  id: string;
  canonicalUrl: string;
  company: string;
  title: string;
  location: string | null;
  description: string | null;
  lastSeenAt: string;
  verifiedUntil: string;
  verification: string;
};

type V2ProfileRow = {
  fullName: string;
  targetRole: string | null;
  targetIndustry: string;
  experienceLevel: string | null;
  resumeFileName: string | null;
  resumeSummary: string | null;
  resumeStoragePath: string | null;
  resumeMimeType: string | null;
  resumeSizeBytes: number | null;
};

function normalizedWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .split(/\s+/)
    .filter(word => word.length >= 3);
}

function tokenMatches(haystack: string, token: string) {
  if (haystack.includes(token)) return true;
  const stem = token.length >= 7 ? token.slice(0, Math.max(5, token.length - 3)) : token;
  return stem.length >= 5 && haystack.includes(stem);
}

function scoreJob(job: VerifiedJobRow, role: string, city: string) {
  const titleAndDescription = `${job.title} ${job.description || ""}`.toLowerCase();
  const location = (job.location || "").toLowerCase();
  const roleWords = normalizedWords(role);
  const roleMatches = roleWords.filter(word => tokenMatches(titleAndDescription, word)).length;
  const cityMatch = city.trim() && location.includes(city.trim().toLowerCase()) ? 5 : 0;
  const saudiFallback = /saudi|ksa|riyadh|jeddah|dammam|khobar/.test(location) ? 1 : 0;
  return roleMatches * 4 + cityMatch + saudiFallback;
}

function matchReason(job: VerifiedJobRow, role: string, city: string) {
  const reasons: string[] = [];
  const title = job.title.toLowerCase();
  if (normalizedWords(role).some(word => tokenMatches(title, word))) reasons.push(`title aligns with ${role}`);
  if (job.location?.toLowerCase().includes(city.toLowerCase())) reasons.push(`location matches ${city}`);
  if (!reasons.length) reasons.push("verified Saudi opportunity from a public ATS");
  return reasons.join(" · ");
}

export function buildGroundedApplicationMessage(
  profile: Pick<V2ProfileRow, "resumeSummary">,
  job: Pick<VerifiedJobRow, "company" | "title" | "location">,
) {
  const summary = (profile.resumeSummary || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");

  return [
    `Hello ${job.company} team,`,
    "",
    `I am applying for the ${job.title} role${job.location ? ` in ${job.location}` : ""}.`,
    summary ? `The CV keywords identified during my profile setup include: ${summary}.` : "Please find my CV attached for your review.",
    "",
    "I would appreciate the opportunity to discuss the role.",
  ].join("\n");
}

export function createApplicationEmailPayload(
  input: ApplicationEmailInput,
  candidateEmail: string,
  attachment: CvAttachment,
) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "apply@hsndm.tech";
  const senderName = process.env.BREVO_SENDER_NAME || "AutoApply SA";
  const subject = `${input.candidateName} for ${input.roleTitle}`;
  const textContent = [
    input.message,
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
    attachment: [{ content: attachment.content, name: safeAttachmentName(attachment.name) }],
  };
}

export async function sendApplicationEmail(
  input: ApplicationEmailInput,
  candidateEmail: string,
  attachment: CvAttachment,
  idempotencyKey: string,
  fetchImpl: FetchLike = fetch,
) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !process.env.BREVO_SENDER_EMAIL) {
    return { ok: false, status: 503, reason: "brevo-not-configured" as const, messageId: null };
  }

  const response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
      "idempotency-key": idempotencyKey.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 120),
    },
    body: JSON.stringify(createApplicationEmailPayload(input, candidateEmail, attachment)),
    signal: AbortSignal.timeout(15_000),
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {}

  if (!response.ok) {
    return { ok: false, status: response.status, reason: "brevo-rejected" as const, messageId: null };
  }

  const messageId =
    body && typeof body === "object" && "messageId" in body && typeof (body as { messageId?: unknown }).messageId === "string"
      ? (body as { messageId: string }).messageId.trim()
      : "";

  if (!messageId) {
    return { ok: false, status: 502, reason: "brevo-missing-message-id" as const, messageId: null };
  }

  return { ok: true, status: response.status, reason: "sent" as const, messageId };
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

async function loadVerifiedJob(client: any, jobId: string) {
  const { data, error } = await client
    .from("v2_live_jobs")
    .select("id,canonicalUrl,company,title,location,description,lastSeenAt,verifiedUntil,verification")
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw error;
  return data as VerifiedJobRow | null;
}

async function loadProfile(client: any, userId: string) {
  const { data, error } = await client
    .from("v2_profiles")
    .select("fullName,targetRole,targetIndustry,experienceLevel,resumeFileName,resumeSummary,resumeStoragePath,resumeMimeType,resumeSizeBytes")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as V2ProfileRow | null;
}

async function downloadCandidateCv(client: any, userId: string, profile: V2ProfileRow): Promise<CvAttachment> {
  const path = profile.resumeStoragePath?.trim();
  if (!path || !profile.resumeFileName) throw new Error("cv-required");
  if (!path.startsWith(`${userId}/`)) throw new Error("cv-ownership-mismatch");

  const { data, error } = await client.storage.from("candidate-cvs").download(path);
  if (error || !data) throw new Error("cv-download-failed");
  const bytes = Buffer.from(await data.arrayBuffer());
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error("cv-size-invalid");
  return { content: bytes.toString("base64"), name: profile.resumeFileName };
}

async function reserveApplication(client: any, userId: string, job: VerifiedJobRow, toEmail: string, cvStoragePath: string) {
  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    companyName: job.company,
    roleTitle: job.title,
    city: job.location || "Saudi Arabia",
    status: "queued",
    updatedAt: now,
    recipientEmail: toEmail,
    deliveryStatus: "unknown",
    responseStatus: "none",
    source: job.verification || "verified_public_ats",
    sourceUrl: job.canonicalUrl,
    cvStoragePath,
    jobId: job.id,
  };
  const { data, error } = await client.from("v2_applications").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") throw new Error("duplicate-application");
    throw error;
  }
  return data;
}

async function markApplicationFailed(client: any, applicationId: string, reason: string) {
  await client
    .from("v2_applications")
    .update({ status: "queued", deliveryStatus: "blocked", responseNote: reason, updatedAt: new Date().toISOString() })
    .eq("id", applicationId);
}

async function markApplicationSent(client: any, applicationId: string, messageId: string) {
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("v2_applications")
    .update({
      status: "applied",
      appliedAt: now,
      updatedAt: now,
      deliveryStatus: "sent",
      providerMessageId: messageId,
      responseNote: null,
    })
    .eq("id", applicationId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export function registerApplicationEmailRoutes(app: Express) {
  app.get("/api/v2/jobs/recommended", async (req: Request, res: Response) => {
    const auth = await authenticateV2Request(req);
    if (!auth) return res.status(401).json({ error: "sign-in-required" });

    const city = typeof req.query.city === "string" && req.query.city.trim() ? req.query.city.trim() : "Saudi Arabia";
    const role = typeof req.query.role === "string" && req.query.role.trim() ? req.query.role.trim() : "Operations";

    try {
      const { data, error } = await auth.client
        .from("v2_live_jobs")
        .select("id,canonicalUrl,company,title,location,description,lastSeenAt,verifiedUntil,verification")
        .order("lastSeenAt", { ascending: false })
        .limit(100);
      if (error) throw error;

      const ranked = ((data || []) as VerifiedJobRow[])
        .map(job => ({ job, score: scoreJob(job, role, city) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || Date.parse(b.job.lastSeenAt) - Date.parse(a.job.lastSeenAt))
        .slice(0, 8)
        .map(({ job }) => ({
          id: job.id,
          companyName: job.company,
          roleTitle: job.title,
          city: job.location || "Saudi Arabia",
          source: job.verification || "verified_public_ats",
          url: job.canonicalUrl,
          summary: (job.description || "Verified public ATS posting.").slice(0, 500),
          matchReason: matchReason(job, role, city),
          freshness: job.lastSeenAt,
        }));

      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ jobs: ranked, mode: "live", checkedAt: new Date().toISOString() });
    } catch {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "verified-job-source-unavailable" });
    }
  });

  app.get("/api/v2/applications/readiness", async (req: Request, res: Response) => {
    const auth = await authenticateV2Request(req);
    if (!auth) return res.status(401).json({ error: "sign-in-required" });
    const result = await checkApplicationDeliveryReadiness();
    if (!result.ok) return res.status(result.status).json({ error: result.reason });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true });
  });

  app.post("/api/v2/applications/send-email", async (req: Request, res: Response) => {
    const auth = await authenticateV2Request(req);
    if (!auth) return res.status(401).json({ error: "sign-in-required" });
    const parsed = applicationSendRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid-application-email" });
    if (!auth.user.email) return res.status(409).json({ error: "candidate-email-required" });

    let reservedApplication: any = null;
    try {
      const [profile, job] = await Promise.all([
        loadProfile(auth.client, auth.user.id),
        loadVerifiedJob(auth.client, parsed.data.jobId),
      ]);
      if (!profile?.fullName) return res.status(409).json({ error: "profile-required" });
      if (!profile.targetRole || !profile.targetIndustry || !profile.experienceLevel) {
        return res.status(409).json({ error: "preferences-required" });
      }
      if (!job) return res.status(404).json({ error: "verified-job-not-found" });
      if (!profile.resumeStoragePath || !profile.resumeFileName) return res.status(409).json({ error: "cv-required" });

      const attachment = await downloadCandidateCv(auth.client, auth.user.id, profile);
      reservedApplication = await reserveApplication(
        auth.client,
        auth.user.id,
        job,
        parsed.data.toEmail,
        profile.resumeStoragePath,
      );

      const emailInput: ApplicationEmailInput = {
        toEmail: parsed.data.toEmail,
        companyName: job.company,
        roleTitle: job.title,
        city: job.location || "Saudi Arabia",
        candidateName: profile.fullName,
        message: buildGroundedApplicationMessage(profile, job),
      };

      const result = await sendApplicationEmail(
        emailInput,
        auth.user.email,
        attachment,
        `application-${auth.user.id}-${job.id}`,
      );

      if (!result.ok || !result.messageId) {
        await markApplicationFailed(auth.client, reservedApplication.id, result.reason);
        return res.status(result.status).json({ error: result.reason });
      }

      const application = await markApplicationSent(auth.client, reservedApplication.id, result.messageId);
      return res.status(200).json({ ok: true, messageId: result.messageId, application });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "application-email-failed";
      if (reservedApplication?.id) await markApplicationFailed(auth.client, reservedApplication.id, reason);
      if (reason === "duplicate-application") return res.status(409).json({ error: reason });
      if (["cv-required", "cv-ownership-mismatch", "cv-size-invalid"].includes(reason)) {
        return res.status(409).json({ error: reason });
      }
      return res.status(502).json({ error: "application-email-failed" });
    }
  });
}
