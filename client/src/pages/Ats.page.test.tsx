// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reportCvExtractionFailure: vi.fn(),
  extractAtsCvText: vi.fn(),
  saveResumeMetadata: vi.fn(),
  isAuthenticated: false,
  analysis: null as null | { score: number; summary: string; strengths: string[]; gaps: string[]; optimizedBullets: string[]; disclaimer: string },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    campaign: {
      ats: { analyze: { useMutation: () => ({ data: mocks.analysis, error: null, isPending: false, mutate: vi.fn() }) } },
      clientIssue: { reportCvExtractionFailure: { useMutation: () => ({ mutate: mocks.reportCvExtractionFailure }) } },
      applications: { profile: { update: { useMutation: () => ({ mutate: mocks.saveResumeMetadata, isPending: false }) } } },
    },
  },
}));

vi.mock("@/lib/atsUpload", () => ({ extractAtsCvText: mocks.extractAtsCvText }));
vi.mock("@/components/SearchableSaudiSelect", () => ({ SearchableSaudiSelect: () => <div data-testid="saudi-select" /> }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: mocks.isAuthenticated }) }));

describe("ATS page local upload", () => {
  beforeEach(() => {
    mocks.reportCvExtractionFailure.mockReset();
    mocks.saveResumeMetadata.mockReset();
    mocks.isAuthenticated = false;
    mocks.analysis = null;
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
    expect(container.textContent).toContain("We could not read enough text from this file.");
  });

  it("explains the local-text minimum before analysis and labels the matching selectors", async () => {
    const { default: Ats } = await import("./Ats");
    const { getByText, getAllByText, getAllByTestId } = render(<Ats />);

    expect(getByText("Add at least 120 readable CV characters to run the preview.")).toBeTruthy();
    expect(getAllByText("Target Saudi city").length).toBeGreaterThan(0);
    expect(getAllByText("Target industry").length).toBeGreaterThan(0);
    expect(getAllByTestId("saudi-select").length).toBeGreaterThanOrEqual(2);
  });

  it("offers a contact-only human follow-up and saves bounded metadata for signed-in candidates", async () => {
    mocks.isAuthenticated = true;
    mocks.analysis = { score: 74, summary: "Good structure.", strengths: ["Clear headings"], gaps: ["Add metrics"], optimizedBullets: ["Improved bullet"], disclaimer: "Preview only." };
    const { default: Ats } = await import("./Ats");
    const { getByRole } = render(<Ats />);

    const contact = getByRole("link", { name: /request a human ats follow-up/i });
    expect(contact.getAttribute("href")).toContain("wa.me/966571448656");
    fireEvent.click(getByRole("button", { name: /save private review note/i }));
    expect(mocks.saveResumeMetadata).toHaveBeenCalledWith(expect.objectContaining({ resumeSummary: expect.stringContaining("74/100") }), expect.any(Object));
  });

  it("handles ATS analysis execution and allows users to retry after an error", async () => {
    const mutateMock = vi.fn();
    let isPendingState = false;
    let errorState: Error | null = null;

    vi.mocked(await import("@/lib/trpc")).trpc.campaign.ats.analyze.useMutation = () => ({
      data: mocks.analysis,
      error: errorState,
      isPending: isPendingState,
      mutate: mutateMock,
    } as any);

    const { default: Ats } = await import("./Ats");
    const { getByRole, getByPlaceholderText, rerender, container } = render(<Ats />);

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "A".repeat(130) } });
    await waitFor(() => expect(container.querySelector("button")?.getAttribute("disabled")).toBeNull());

    const runButton = container.querySelector("button.bg-\\[\\#151515\\]") as HTMLButtonElement;
    expect(runButton.getAttribute("disabled")).toBeNull();
    fireEvent.click(runButton);
    expect(mutateMock).toHaveBeenCalledTimes(1);

    // Simulate mutation error state
    errorState = new Error("Failed");
    rerender(<Ats />);
    expect(container.querySelector("[role=\"alert\"]")).toBeTruthy();
    const tryAgainButton = getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);
    expect(mutateMock).toHaveBeenCalledTimes(2);
  });
});
