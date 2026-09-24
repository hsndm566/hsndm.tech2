import { afterEach, describe, expect, it, vi } from "vitest";
import { checkBackendHealth, fetchRecommendedJobs, getApiBaseUrl, getFallbackRecommendedJobs, sendApplicationEmail } from "./backend";

const auth = vi.hoisted(() => ({ token: "token" as string | null }));

vi.mock("./auth", () => ({
  getSupabaseToken: () => Promise.resolve(auth.token),
}));

afterEach(() => {
  auth.token = "token";
  vi.restoreAllMocks();
});

describe("V2 backend client", () => {
  it("uses the production API host from every public dashboard domain", () => {
    expect(getApiBaseUrl("https://www.hsndm.tech")).toBe("https://api.hsndm.tech");
    expect(getApiBaseUrl("https://dashboard.hsndm.tech/dashboard")).toBe("https://api.hsndm.tech");
    expect(getApiBaseUrl("https://app.hsndm.tech/dashboard")).toBe("https://api.hsndm.tech");
  });

  it("keeps local development same-origin when no API base is configured", () => {
    expect(getApiBaseUrl("http://localhost:5173")).toBe("");
  });

  it("falls back from /health to /healthz when the first health route is unavailable", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(checkBackendHealth(fetchImpl as unknown as typeof fetch)).resolves.toEqual({ ok: true, status: 200 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns curated job review links when the live V2 endpoint is missing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 }));

    const result = await fetchRecommendedJobs({ city: "Jeddah", role: "Industrial Engineering" }, fetchImpl as unknown as typeof fetch);

    expect(result.mode).toBe("curated");
    expect(result.jobs).toHaveLength(3);
    expect(result.jobs[0].matchReason).toContain("Industrial Engineering");
  });

  it("returns curated job review links before sign-in instead of a blank queue", async () => {
    auth.token = null;

    const result = await fetchRecommendedJobs({ city: "Riyadh", role: "Operations" });

    expect(result).toEqual(getFallbackRecommendedJobs({ city: "Riyadh", role: "Operations" }, result.checkedAt));
  });

  it("labels a missing application email endpoint distinctly", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 }));

    const result = await sendApplicationEmail({
      toEmail: "hiring@example.com",
      companyName: "Hiring Co",
      roleTitle: "Analyst",
      city: "Jeddah",
      candidateName: "Test Candidate",
      candidateEmail: "candidate@example.com",
      message: "I am interested in this role and my experience is a strong match.",
    }, fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({ ok: false, status: 404, error: "application-email-endpoint-missing" });
  });
});
