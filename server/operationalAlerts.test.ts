import { beforeEach, describe, expect, it, vi } from "vitest";

const notifyOwner = vi.fn();

vi.mock("./_core/notification", () => ({ notifyOwner }));

describe("notifyOperationalFailure", () => {
  beforeEach(() => {
    notifyOwner.mockReset();
  });

  it("sends compact owner context without CV or contact fields", async () => {
    notifyOwner.mockResolvedValue(true);
    const { notifyOperationalFailure } = await import("./operationalAlerts");

    await notifyOperationalFailure("ATS analysis", new Error("provider unavailable at https://private.example.test/request"));

    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({
      title: "AutoApply SA workflow alert: ATS analysis",
      content: expect.stringContaining("No candidate CV text or contact details"),
    }));
    expect(notifyOwner.mock.calls[0][0].content).toContain("[url]");
    expect(notifyOwner.mock.calls[0][0].content).not.toContain("private.example.test");
  });

  it("does not turn a primary workflow failure into a secondary notification failure", async () => {
    notifyOwner.mockRejectedValue(new Error("notification service unavailable"));
    const { notifyOperationalFailure } = await import("./operationalAlerts");

    await expect(notifyOperationalFailure("application creation", new Error("database unavailable"))).resolves.toBeUndefined();
  });

  it("throttles repeat blocked-handoff alerts and excludes form fields", async () => {
    notifyOwner.mockResolvedValue(true);
    const { notifyClientWorkflowFallback } = await import("./operationalAlerts");

    await expect(notifyClientWorkflowFallback("/enquire")).resolves.toBe(true);
    await expect(notifyClientWorkflowFallback("/enquire")).resolves.toBe(false);

    const alert = notifyOwner.mock.calls[0][0];
    expect(alert.title).toContain("WhatsApp handoff fallback");
    expect(alert.content).toContain("No candidate CV text, contact details, or form values");
    expect(alert.content).not.toContain("Email:");
  });

  it("reports browser extraction failures without document metadata", async () => {
    notifyOwner.mockResolvedValue(true);
    const { notifyClientCvExtractionFailure } = await import("./operationalAlerts");

    await expect(notifyClientCvExtractionFailure("/ats")).resolves.toBe(true);

    const alert = notifyOwner.mock.calls[0][0];
    expect(alert.title).toContain("local CV extraction");
    expect(alert.content).toContain("No CV text, file name, contact details, or form values");
  });
});
