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
});
