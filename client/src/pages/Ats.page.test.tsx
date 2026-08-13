// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reportCvExtractionFailure: vi.fn(),
  extractAtsCvText: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    campaign: {
      ats: { analyze: { useMutation: () => ({ data: null, error: null, isPending: false, mutate: vi.fn() }) } },
      clientIssue: { reportCvExtractionFailure: { useMutation: () => ({ mutate: mocks.reportCvExtractionFailure }) } },
    },
  },
}));

vi.mock("@/lib/atsUpload", () => ({ extractAtsCvText: mocks.extractAtsCvText }));
vi.mock("@/components/SearchableSaudiSelect", () => ({ SearchableSaudiSelect: () => <div data-testid="saudi-select" /> }));

describe("ATS page local upload", () => {
  beforeEach(() => {
    mocks.reportCvExtractionFailure.mockReset();
    mocks.extractAtsCvText.mockReset().mockImplementation(async (_file: File, reportFailure: (route: "/ats") => void) => {
      reportFailure("/ats");
      return "";
    });
  });

  it("reports only the ATS route when file extraction fails during selection", async () => {
    const { default: Ats } = await import("./Ats");
    const { container } = render(<Ats />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["unreadable"], "cv.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mocks.reportCvExtractionFailure).toHaveBeenCalledWith({ route: "/ats" }));
    expect(mocks.reportCvExtractionFailure).toHaveBeenCalledTimes(1);
  });
});
