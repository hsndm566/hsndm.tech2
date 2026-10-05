import { createHmac, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { createV2ServiceClient } from "./v2Supabase";

const PLAN_LIMITS: Record<string, number> = { free: 5, starter: 50, pro: 100 };
const PLAN_PRODUCTS: Record<string, string> = {
  starter: "DODO_PRODUCT_STARTER_ID",
  pro: "DODO_PRODUCT_PRO_ID",
};

function header(req: Request, name: string) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function verifyStandardWebhook(rawBody: string, req: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();
  const id = header(req, "webhook-id");
  const timestamp = header(req, "webhook-timestamp");
  const signature = header(req, "webhook-signature");
  if (!secret || !id || !timestamp || !signature) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

  const secretValue = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let key: Buffer;
  try {
    key = Buffer.from(secretValue, "base64");
  } catch {
    return false;
  }
  const signed = id + "." + timestamp + "." + rawBody;
  const expected = createHmac("sha256", key).update(signed).digest("base64");
  return signature.split(" ").some(candidate => {
    const [version, encoded] = candidate.split(",", 2);
    if (version !== "v1" || !encoded) return false;
    const actual = Buffer.from(encoded);
    const expectedBytes = Buffer.from(expected);
    return actual.length === expectedBytes.length && timingSafeEqual(actual, expectedBytes);
  });
}

function planFromPayment(data: any) {
  const metadataPlan = typeof data?.metadata?.autoapply_plan === "string" ? data.metadata.autoapply_plan.toLowerCase() : "";
  if (PLAN_LIMITS[metadataPlan]) return metadataPlan;
  const productId = typeof data?.product_id === "string" ? data.product_id : "";
  for (const [plan, envName] of Object.entries(PLAN_PRODUCTS)) {
    if (productId && process.env[envName]?.trim() === productId) return plan;
  }
  return "";
}

function emailFromPayment(data: any) {
  const metadataEmail = data?.metadata?.autoapply_email;
  const customerEmail = data?.customer?.email;
  const email = typeof metadataEmail === "string" && metadataEmail.includes("@") ? metadataEmail : customerEmail;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function registerDodoWebhookRoute(app: Express) {
  app.post("/api/payments/dodo/webhook", (req: Request, res: Response) => {
    expressRawJson(req, res, async () => {
      const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
      if (!rawBody || !verifyStandardWebhook(rawBody, req)) {
        return res.status(401).json({ error: "invalid-webhook-signature" });
      }

      let event: any;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return res.status(400).json({ error: "invalid-webhook-payload" });
      }

      if (event?.type !== "payment.succeeded") {
        return res.status(200).json({ ok: true, ignored: true });
      }

      const data = event.data || event.payload?.data || {};
      const plan = planFromPayment(data);
      const email = emailFromPayment(data);
      const paymentId = typeof data?.payment_id === "string" ? data.payment_id : "";
      if (!paymentId || !email || !PLAN_LIMITS[plan] || plan === "free") {
        return res.status(422).json({ error: "payment-entitlement-data-incomplete" });
      }

      const service = createV2ServiceClient();
      if (!service) return res.status(503).json({ error: "entitlement-service-unavailable" });

      const userId = typeof data?.metadata?.autoapply_user_id === "string" ? data.metadata.autoapply_user_id : "";
      const billingPeriod = typeof data?.metadata?.autoapply_billing_period === "string"
        ? data.metadata.autoapply_billing_period
        : "package";
      const subscriptionId = typeof data?.subscription_id === "string" ? data.subscription_id : null;
      const expiresAt = typeof data?.next_billing_date === "string" ? data.next_billing_date : null;
      let result: any;
      let error: any;
      if (userId) {
        const response = await service.rpc("apply_dodo_payment_success", {
          p_webhook_id: header(req, "webhook-id"),
          p_payment_id: paymentId,
          p_user_id: userId,
          p_plan_key: plan,
          p_billing_period: billingPeriod,
          p_subscription_id: subscriptionId,
          p_plan_expires_at: expiresAt,
        });
        result = response.data;
        error = response.error;
      } else {
        const response = await service.rpc("v2_apply_payment_entitlement", {
          p_payment_id: paymentId,
          p_customer_email: email,
          p_plan_key: plan,
          p_application_limit: PLAN_LIMITS[plan],
        });
        result = response.data;
        error = response.error;
      }
      if (error) {
        console.error("Dodo entitlement grant failed", { paymentId, plan, error: error.message });
        return res.status(502).json({ error: "entitlement-grant-failed" });
      }

      return res.status(200).json({ ok: true, applied: result !== false });
    });
  });
}

// The webhook must run before express.json() so the signed bytes are preserved.
function expressRawJson(req: Request, _res: Response, callback: () => void) {
  const chunks: Buffer[] = [];
  req.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
  req.on("end", () => {
    req.body = Buffer.concat(chunks);
    callback();
  });
  req.on("error", () => callback());
}
