import { timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { createV2ServiceClient } from "./v2Supabase";

const NOTION_VERSION = "2026-03-11";
type NotionPage = { id?: string; properties?: Record<string, any> };

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function propertyValue(value: any): string | boolean | null {
  if (!value || typeof value !== "object") return null;
  if (typeof value.email === "string") return value.email;
  if (typeof value.url === "string") return value.url;
  if (typeof value.checkbox === "boolean") return value.checkbox;
  if (typeof value.date?.start === "string") return value.date.start;
  if (typeof value.number === "number") return String(value.number);
  const values = Array.isArray(value.title) ? value.title
    : Array.isArray(value.rich_text) ? value.rich_text
    : null;
  if (values) return values.map((part: any) => part?.plain_text || part?.text?.content || "").join("").trim();
  if (typeof value.select?.name === "string") return value.select.name;
  if (typeof value.status?.name === "string") return value.status.name;
  return null;
}

function getProperty(properties: Record<string, any>, aliases: string[]) {
  const wanted = new Set(aliases.map(normalizeKey));
  const match = Object.entries(properties).find(([key]) => wanted.has(normalizeKey(key)));
  return match ? propertyValue(match[1]) : null;
}

function toText(value: string | boolean | null) {
  return typeof value === "string" ? value.trim() : "";
}

function verifiedStatus(value: string) {
  const normalized = value.trim().toLowerCase();
  return ["verified", "approved", "verified and approved"].includes(normalized) ? "verified" : "unverified";
}

function parseContact(page: NotionPage, batchId: string) {
  const properties = page.properties || {};
  const company = toText(getProperty(properties, ["Company", "Company Name", "Employer"]));
  const email = toText(getProperty(properties, ["HR Email", "Recruitment Email", "Contact Email", "Email"])).toLowerCase();
  const companyDomain = toText(getProperty(properties, ["Company Domain", "Domain", "Website Domain"])).toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const verification = toText(getProperty(properties, ["Email Verification Status", "Verification Status", "Email Status"]));
  const verifiedAt = toText(getProperty(properties, ["Last Verified", "Last Verified At", "Verified At"]));
  const activeValue = getProperty(properties, ["Active", "Approved for Sending", "Contact Active"]);
  const doNotSendValue = getProperty(properties, ["Do Not Send", "DNC", "Suppressed"]);
  const doNotSend = doNotSendValue === true || (typeof doNotSendValue === "string" && ["yes", "true", "do not send"].includes(doNotSendValue.toLowerCase()));
  const active = activeValue === true && !doNotSend;
  const normalizedCompanyName = company.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[^a-z0-9\u0600-\u06ff]+/g, "");
  if (!page.id || !company || !normalizedCompanyName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return {
    company_name: company,
    normalized_company_name: normalizedCompanyName,
    company_domain: companyDomain || null,
    recipient_email: email,
    recipient_type: toText(getProperty(properties, ["Recipient Type", "Contact Type"])) || "recruitment",
    verification_status: verifiedStatus(verification),
    source: "notion",
    source_record_id: page.id,
    last_verified_at: verifiedAt || null,
    active,
    do_not_send: doNotSend,
    sync_batch_id: batchId,
    updated_at: new Date().toISOString(),
  };
}

function sameSecret(actual: string | undefined, expected: string | undefined) {
  if (!actual || !expected) return false;
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function notionRequest(url: string, token: string, body?: unknown) {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`notion-http-${response.status}`);
  return payload;
}

export function registerNotionContactSyncRoute(app: Express) {
  app.post("/api/v2/admin/notion-sync", async (req: Request, res: Response) => {
    if (!sameSecret(req.headers["x-autoapply-sync-token"] as string | undefined, process.env.NOTION_SYNC_SECRET)) {
      return res.status(401).json({ error: "sync-authentication-required" });
    }
    const notionToken = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;
    const service = createV2ServiceClient();
    if (!notionToken || !databaseId || !service) {
      return res.status(503).json({ error: "notion-sync-not-configured" });
    }

    const batchId = crypto.randomUUID();
    try {
      let dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
      if (!dataSourceId) {
        const database = await notionRequest(`https://api.notion.com/v1/databases/${encodeURIComponent(databaseId)}`, notionToken);
        dataSourceId = Array.isArray(database?.data_sources) ? database.data_sources[0]?.id : undefined;
      }
      if (!dataSourceId) return res.status(409).json({ error: "notion-data-source-not-found" });

      let cursor: string | undefined;
      let pagesRead = 0;
      let contactsUpserted = 0;
      do {
        const result = await notionRequest(
          `https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}/query`,
          notionToken,
          { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
        );
        const pages = Array.isArray(result?.results) ? result.results as NotionPage[] : [];
        pagesRead += pages.length;
        const contacts = pages.map(page => parseContact(page, batchId)).filter(Boolean);
        if (contacts.length) {
          const { error } = await service.from("v2_employer_contacts").upsert(contacts, { onConflict: "source_record_id" });
          if (error) throw new Error("contact-upsert-failed");
          contactsUpserted += contacts.length;
        }
        cursor = result?.has_more && typeof result?.next_cursor === "string" ? result.next_cursor : undefined;
      } while (cursor);

      const { error: deactivateError } = await service.from("v2_employer_contacts")
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq("source", "notion")
        .or(`sync_batch_id.is.null,sync_batch_id.neq.${batchId}`);
      if (deactivateError) throw new Error("stale-contact-deactivation-failed");

      return res.status(200).json({
        ok: true,
        pagesRead,
        contactsUpserted,
        checkedAt: new Date().toISOString(),
      });
    } catch {
      return res.status(502).json({ error: "notion-sync-failed" });
    }
  });
}
