import { afterEach, describe, expect, it, vi } from "vitest";
import { createApplicationEmailPayload, sendApplicationEmail } from "./applicationEmail";

const input = {
  toEmail: "hiring@example.com",
  companyName: "Example Co",
  roleTitle: "Operations Analyst",
  city: "Riyadh",
  candidateName: "Test Candidate",
  candidateEmail: "candidate@example.com",
  message: "I am excited to apply because my experience matches the role requirements.",
  cvSummary: "Reporting, Excel, process improvement",
};

afterEach(() => vi.unstubAllEnvs());

describe("application email sending", () => {
  it("builds a Brevo payload with candidate reply-to and no API secret", () => {
    vi.stubEnv("BREVO_SENDER_EMAIL", "apply@hsndm.tech");
    const payload = createApplicationEmailPayload(input, "candidate@example.com");

    expect(payload).toMatchObject({
      sender: { email: "apply@hsndm.tech", name: "AutoApply SA" },
      to: [{ email: "hiring@example.com" }],
      replyTo: { email: "candidate@example.com", name: "Test Candidate" },
      subject: "Test Candidate for Operations Analyst",
    });
    expect(payload.textContent).toContain("CV summary:");
    expect(JSON.stringify(payload)).not.toContain("BREVO_API_KEY");
  });

  it("fails closed when Brevo is not configured", async () => {
    const fetchImpl = vi.fn();
    await expect(sendApplicationEmail(input, "candidate@example.com", fetchImpl as unknown as typeof fetch)).resolves.toEqual({
      ok: false,
      status: 503,
      reason: "brevo-not-configured",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends through Brevo when a server-side key is configured", async () => {
    vi.stubEnv("BREVO_API_KEY", "server-only-key");
    vi.stubEnv("BREVO_SENDER_EMAIL", "apply@hsndm.tech");
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const result = await sendApplicationEmail(input, "candidate@example.com", fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({ ok: true, status: 201, reason: "sent" });
    expect(fetchImpl).toHaveBeenCalledWith("https://api.brevo.com/v3/smtp/email", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "api-key": "server-only-key" }),
    }));
  });
});
