// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CampaignManagementBoard, filterAndSortCampaignItems } from "./CampaignManagementBoard";

describe("CampaignManagementBoard", () => {
  afterEach(() => cleanup());

  it("filters the campaign board to recorded and tracked application updates", () => {
    const items = [
      { id: "plan", category: "candidate_action" as const, title: "Plan", detail: "", priority: 0 },
      { id: "response", category: "response" as const, title: "Interview", detail: "", priority: 1, date: "2026-08-16T00:00:00.000Z" },
      { id: "tracked", category: "tracked" as const, title: "Tracked", detail: "", priority: 4, date: "2026-08-17T00:00:00.000Z" },
      { id: "evidence", category: "evidence" as const, title: "Evidence", detail: "", priority: 3 },
    ];
    expect(filterAndSortCampaignItems(items, "updates", "priority").map((item) => item.id)).toEqual(["response", "tracked"]);
    expect(filterAndSortCampaignItems(items, "evidence", "priority").map((item) => item.id)).toEqual(["evidence"]);
  });

  it("sorts board items by recent tracked timestamps without treating undated plans as recent", () => {
    const items = [
      { id: "plan", category: "team_review" as const, title: "Plan", detail: "", priority: 2 },
      { id: "older", category: "tracked" as const, title: "Older", detail: "", priority: 4, date: "2026-08-10T00:00:00.000Z" },
      { id: "newer", category: "response" as const, title: "Newer", detail: "", priority: 1, date: "2026-08-17T00:00:00.000Z" },
    ];
    expect(filterAndSortCampaignItems(items, "all", "recent").map((item) => item.id)).toEqual(["newer", "older", "plan"]);
  });

  it("renders truthful no-approval and no-evidence entries with accessible management controls", () => {
    render(<CampaignManagementBoard hasCandidateApproval={false} verifiedEvidenceCount={0} />);
    expect(screen.getByText("Campaign action board")).toBeTruthy();
    expect(screen.getByText("Review targeting plan")).toBeTruthy();
    expect(screen.getByText("No verified evidence recorded yet")).toBeTruthy();
    expect(screen.getByText("Filter items")).toBeTruthy();
    expect(screen.getByText("Sort items")).toBeTruthy();
  });

  it("filters rendered items to tracked updates through the visible filter control", () => {
    render(<CampaignManagementBoard applications={[{ id: 4, companyName: "Example Company", roleTitle: "Data Analyst", status: "interview", updatedAt: "2026-08-17T00:00:00.000Z" }]} hasCandidateApproval={false} verifiedEvidenceCount={0} />);
    expect(screen.getByText("Review targeting plan")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("combobox")[0]!);
    fireEvent.click(screen.getByRole("option", { name: "Tracked updates" }));
    expect(screen.getByText("Data Analyst · Example Company")).toBeTruthy();
    expect(screen.queryByText("Review targeting plan")).toBeNull();
  });

  it("shows an accessible loading state without misleading campaign detail", () => {
    render(<CampaignManagementBoard hasCandidateApproval={false} isLoading verifiedEvidenceCount={0} />);
    expect(screen.getByLabelText("Campaign action board").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Loading campaign management items")).toBeTruthy();
  });
});
