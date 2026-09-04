import type { Express, Request, Response } from "express";

const DODO_LIVE_API = "https://live.dodopayments.com";
const PAYMENT_RETURN_URL = process.env.DODO_PAYMENT_RETURN_URL || "https://pay.hsndm.tech/success";

const planProductEnv: Record<string, string> = {
  starter: "DODO_PRODUCT_STARTER_ID",
  pro: "DODO_PRODUCT_PRO_ID",
  founder: "DODO_PRODUCT_FOUNDER_ID",
};

function productIdForPlan(plan: string): string | null {
  const envName = planProductEnv[plan.toLowerCase()];
  if (!envName) return null;
  return process.env[envName]?.trim() || null;
}

function sendNoStore(res: Response) {
  res.setHeader("Cache-Control", "no-store");
}

export function registerDodoPaymentRoutes(app: Express) {
  app.get("/api/payments/dodo/readiness", (_req, res) => {
    sendNoStore(res);
    const apiKeyConfigured = Boolean(process.env.DODO_PAYMENTS_API_KEY?.trim());
    const productsConfigured = Object.keys(planProductEnv).every((plan) => Boolean(productIdForPlan(plan)));
    res.status(apiKeyConfigured && productsConfigured ? 200 : 503).json({
      provider: "dodo",
      configured: apiKeyConfigured && productsConfigured,
      productsConfigured,
    });
  });

  app.post("/api/payments/dodo/checkout", async (req: Request, res: Response) => {
    sendNoStore(res);

    const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    if (!apiKey) return res.status(503).json({ error: "payments-not-configured" });

    const plan = typeof req.body?.plan === "string" ? req.body.plan.trim().toLowerCase() : "";
    const productId = productIdForPlan(plan);
    if (!productId) return res.status(400).json({ error: "invalid-or-unconfigured-plan" });

    const customerEmail = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const customerName = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    const payload: Record<string, unknown> = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: `${PAYMENT_RETURN_URL}?plan=${encodeURIComponent(plan)}`,
    };

    if (customerEmail) {
      payload.customer = {
        email: customerEmail,
        ...(customerName ? { name: customerName } : {}),
      };
    }

    try {
      const response = await fetch(`${DODO_LIVE_API}/checkouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { checkout_url?: string; session_id?: string } | null;
      if (!response.ok || !data?.checkout_url) {
        console.error("Dodo checkout session creation failed", { status: response.status, plan });
        return res.status(502).json({ error: "checkout-session-failed" });
      }

      return res.status(201).json({
        provider: "dodo",
        checkoutUrl: data.checkout_url,
        sessionId: data.session_id || null,
      });
    } catch (error) {
      console.error("Dodo checkout request failed", { plan, error: error instanceof Error ? error.message : "unknown" });
      return res.status(502).json({ error: "checkout-provider-unreachable" });
    }
  });
}
