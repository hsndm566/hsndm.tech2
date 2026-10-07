const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;
const WINDOW_SECONDS = 60;
const rateBuckets = new Map();
const DEPRECATION_POLICY = "https://www.hsndm.tech/developers/deprecation/";

const publicData = {
  "/api/v1/health": { status: "ok", service: "AutoApply SA public catalog API", apiVersion: "v1", scope: "read-only-public-catalog" },
  "/api/v1/product": {
    name: "AutoApply SA",
    description: "A Saudi Arabia-focused job-search organiser and application tracker.",
    market: "Saudi Arabia",
    languages: ["Arabic", "English"],
    intendedUsers: ["new graduates", "professionals changing direction", "busy job seekers"],
    capabilities: ["review CV skills and keywords", "set target roles and locations", "save opportunities", "track next actions manually", "review ATS and keyword guidance"],
    limitations: ["employer submission is not currently enabled", "the public API does not expose candidate profiles or application records", "matches and CV feedback are guidance, not a hiring guarantee"],
  },
  "/api/v1/plans": {
    currency: "SAR",
    billingInterval: "month",
    plans: [
      { id: "starter", name: "Starter", price: 99, features: ["CV profile setup", "single-role targeting lane", "application tracker workspace"] },
      { id: "pro", name: "Pro", price: 149, features: ["multi-city targeting", "role and preference review", "priority campaign workspace"] },
      { id: "founder", name: "Founder", price: 249, features: ["white-glove onboarding", "multi-role targeting lanes", "campaign direction review", "higher-touch application preparation"] },
    ],
    note: "Plan features and prices are informational and should be confirmed on the website before purchase.",
  },
};

function quotaFor(request) {
  const now = Date.now();
  const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const resetSeconds = Math.max(1, Math.ceil((windowStart + WINDOW_MS - now) / 1000));
  const key = request.headers.get("cf-connecting-ip") || "unknown";
  let bucket = rateBuckets.get(key);
  if (!bucket || bucket.windowStart !== windowStart) {
    bucket = { windowStart, count: 0 };
    rateBuckets.set(key, bucket);
  }
  if (rateBuckets.size > 5000) {
    for (const [candidate, item] of rateBuckets) {
      if (item.windowStart !== windowStart) rateBuckets.delete(candidate);
      if (rateBuckets.size <= 4000) break;
    }
  }
  bucket.count += 1;
  return { allowed: bucket.count <= RATE_LIMIT, remaining: Math.max(0, RATE_LIMIT - bucket.count), resetSeconds };
}

function baseHeaders(quota) {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Expose-Headers": "RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, Link",
    "Cache-Control": "public, max-age=60, s-maxage=300",
    "Content-Type": "application/json; charset=utf-8",
    "RateLimit-Limit": String(RATE_LIMIT),
    "RateLimit-Remaining": String(quota.remaining),
    "RateLimit-Reset": String(quota.resetSeconds),
    "RateLimit-Policy": `${RATE_LIMIT};w=${WINDOW_SECONDS}`,
    "Link": `<${DEPRECATION_POLICY}>; rel="deprecation"`,
  });
}

function jsonResponse(data, status, quota) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: baseHeaders(quota) });
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Accept, Content-Type",
      "Access-Control-Max-Age": "86400",
    }});
  }

  const quota = quotaFor(request);
  if (!quota.allowed) {
    const headers = baseHeaders(quota);
    headers.set("Retry-After", String(quota.resetSeconds));
    return new Response(JSON.stringify({
      error: "rate_limit_exceeded",
      message: "The public API limit has been reached for this edge window. Retry after the supplied delay.",
    }), { status: 429, headers });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const response = jsonResponse({ error: "method_not_allowed", message: "Use GET for public API resources." }, 405, quota);
    response.headers.set("Allow", "GET, HEAD, OPTIONS");
    return response;
  }

  const path = new URL(request.url).pathname;
  const data = publicData[path];
  if (!data) {
    return jsonResponse({
      error: "not_found",
      message: "No public API resource exists at this path. See the developer documentation.",
      documentation: "https://www.hsndm.tech/developers/",
    }, 404, quota);
  }

  const response = jsonResponse(data, 200, quota);
  if (request.method === "HEAD") return new Response(null, { status: 200, headers: response.headers });
  return response;
}
