import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGroundedApplicationMessage,
  checkApplicationDeliveryReadiness,
  createApplicationEmailPayload,
  sendApplicationEmail,
} from "./applicationEmail";

const input = {
  toEmail: "hiring@example.com",
  companyName: "Example Co",
  roleTitle: "Operations Analyst",
  city: "Riyadh",
  candidateName: "Test Candidate",
  message: "I am applying for the Operations Analyst role. Please find my CV attached for your review.",
};

const attachment = {
  content: Buffer.from("test-cv").toString("base64"),
  name: "Test Candidate CV.pdf",
};

afterEach(() => vi.unstubAllEnvs());

describe("application email sending", () => {
  it("builds a Brevo payload with candidate reply-to and the original CV attachment", () => {
    vi.stubEnv("BREVO_SENDER_EMAIL", "apply@hsndm.tech");
    const payload = createApplicationEmailPayload(input, "candidate@example.com", attachment);

    expect(payload).toMatchObject({
      sender: { email: "apply@hsndm.tech", name: "AutoApply SA" },
      to: [{ email: "hiring@example.com" }],
      replyTo: { email: "candidate@example.com", name: "Test Candidate" },
      subject: "Test Candidate for Operations Analyst",
      attachment: [{ content: attachment.content, name: "Test Candidate CV.pdf" }],
    });
    expect(JSON.stringify(payload)).not.toContain("BREVO_API_KEY");
  });

  it("builds grounded application copy only from the selected job and stored CV keywords", () => {
    const message = buildGroundedApplicationMessage(
      { resumeSummary: "Excel, process improvement" },
      { company: "Example Co", title: "Operations Analyst", location: "Jeddah" },
    );
    expect(message).toContain("Example Co");
    expect(message).toContain("Operations Analyst");
    expect(message).toContain("Excel, process improvement");
    expect(message).not.toContain("years of experience");
  });

  it("fails closed when Brevo is not configured", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    vi.stubEnv("BREVO_SENDER_EMAIL", "");
    const fetchImpl = vi.fn();
    await expect(
      sendApplicationEmail(input, "candidate@example.com", attachment, "application-test", fetchImpl as unknown as typeof fetch),
    ).resolves.toEqual({
      ok: false,
      status: 503,
      reason: "brevo-not-configured",
      messageId: null,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("requires a provider message ID before reporting a send as successful", async () => {
    vi.stubEnv("BREVO_API_KEY", "server-only-key");
    vi.stubEnv("BREVO_SENDER_EMAIL", "apply@hsndm.tech");
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ messageId: "<provider-message-1>" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await sendApplicationEmail(
      input,
      "candidate@example.com",
      attachment,
      "application-test",
      fetchImpl as unknown as typeof fetch,
    );

    expect(result).toEqual({
      ok: true,
      status: 201,
      reason: "sent",
      messageId: "<provider-message-1>",
    });
    const request = fetchImpl.mock.calls[0][1];
    expect(request.headers).toEqual(expect.objectContaining({
      "api-key": "server-only-key",
      "idempotency-key": "application-test",
    }));
    expect(JSON.parse(request.body as string).attachment).toEqual([
      { content: attachment.content, name: "Test Candidate CV.pdf" },
    ]);
  });

  it("does not mark a 2xx provider response as sent when submission evidence is missing", async () => {
    vi.stubEnv("BREVO_API_KEY", "server-only-key");
    vi.stubEnv("BREVO_SENDER_EMAIL", "apply@hsndm.tech");
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 201, headers: { "content-type": "application/json" } }),
    );

    await expect(
      sendApplicationEmail(input, "candidate@example.com", attachment, "application-test", fetchImpl as unknown as typeof fetch),
    ).resolves.toEqual({
      ok: false,
      status: 502,
      reason: "brevo-missing-message-id",
      messageId: null,
    });
  });

  it("validates Brevo readiness without sending email", async () => {
    vi.stubEnv("BREVO_API_KEY", "server-only-key");
    vi.stubEnv("BREVO_SENDER_EMAIL", "apply@hsndm.tech");
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await checkApplicationDeliveryReadiness(fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({ ok: true, status: 200, reason: "ready" });
    expect(fetchImpl).toHaveBeenCalledWith("https://api.brevo.com/v3/account", expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({ "api-key": "server-only-key" }),
    }));
  });
});
