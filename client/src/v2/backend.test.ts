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

  it("checks the V2 health route before accepting a generic health response", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(checkBackendHealth(fetchImpl as unknown as typeof fetch)).resolves.toEqual({
      ok: true,
      status: 200,
      path: "/healthz/auth",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not substitute generic search links when the verified job API is missing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 }));
    const result = await fetchRecommendedJobs({ city: "Jeddah", role: "Industrial Engineering" }, fetchImpl as unknown as typeof fetch);
    expect(result.mode).toBe("unavailable");
    expect(result.jobs).toEqual([]);
  });

  it("returns no synthetic jobs before sign-in", async () => {
    auth.token = null;
    const result = await fetchRecommendedJobs({ city: "Riyadh", role: "Operations" });
    expect(result).toEqual(getFallbackRecommendedJobs({ city: "Riyadh", role: "Operations" }, result.checkedAt));
    expect(result.jobs).toEqual([]);
  });

  it("accepts a send only when the backend returns provider evidence", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        ok: true,
        messageId: "<provider-message-1>",
        application: { id: "app-1", status: "applied" },
      }), { status: 200, headers: { "content-type": "application/json" } }),
    );

    const result = await sendApplicationEmail({
      jobId: "199945cc-4e96-451c-bb4f-e999f37c6873",
    }, fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({
      ok: true,
      status: 200,
      error: "",
      messageId: "<provider-message-1>",
      application: { id: "app-1", status: "applied" },
    });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body as string)).toEqual({
      jobId: "199945cc-4e96-451c-bb4f-e999f37c6873",
    });
  });

  it("labels a missing application endpoint distinctly", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 }));
    const result = await sendApplicationEmail({
      jobId: "199945cc-4e96-451c-bb4f-e999f37c6873",
    }, fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ ok: false, status: 404, error: "application-email-endpoint-missing" });
  });
});
