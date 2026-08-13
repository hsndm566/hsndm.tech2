import { describe, expect, it, vi } from "vitest";

const readCvText = vi.fn();
vi.mock("./careerMatcher", () => ({ readCvText }));

describe("ATS local upload", () => {
  it("reports only the ATS route when local extraction fails", async () => {
    const reportFailure = vi.fn();
    readCvText.mockImplementationOnce(async (_file, options) => {
      options.onExtractionFailure();
      return "";
    });
    const { extractAtsCvText } = await import("./atsUpload");

    await expect(extractAtsCvText({} as File, reportFailure)).resolves.toBe("");
    expect(reportFailure).toHaveBeenCalledTimes(1);
    expect(reportFailure).toHaveBeenCalledWith("/ats");
  });
});
