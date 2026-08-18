// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CampaignEvidenceGuide } from "./CampaignEvidenceGuide";

describe("CampaignEvidenceGuide", () => {
  afterEach(() => cleanup());

  it("separates compact evidence definitions from ordinary campaign activity", () => {
    render(<CampaignEvidenceGuide hasCandidateApproval={false} verifiedEvidenceCount={0} />);
    expect(screen.getByText("What counts as a verified application?")).toBeTruthy();
    expect(screen.getByText("Portal confirmation")).toBeTruthy();
    expect(screen.getByText("Email accepted")).toBeTruthy();
    expect(screen.getByText("Employer confirmation")).toBeTruthy();
    expect(screen.getByText("0 Verified evidence")).toBeTruthy();
    expect(screen.getByText("Your targeting approval is needed")).toBeTruthy();
    expect(screen.getByText(/Capacity and a launch date are not shown/i)).toBeTruthy();
  });

  it("states that a saved approval still awaits team review and does not auto-submit", () => {
    render(<CampaignEvidenceGuide hasCandidateApproval verifiedEvidenceCount={2} />);
    expect(screen.getByText("Your targeting plan is awaiting team review")).toBeTruthy();
    expect(screen.getByText(/does not submit applications automatically/i)).toBeTruthy();
    expect(screen.getByText("2 Verified evidence")).toBeTruthy();
  });

  it("localizes the proof and review-state guidance for an Arabic browser", () => {
    Object.defineProperty(window.navigator, "language", { configurable: true, value: "ar-SA" });
    render(<CampaignEvidenceGuide hasCandidateApproval={false} verifiedEvidenceCount={0} />);
    expect(screen.getByText("ما الذي يُحتسب كطلب موثّق؟")).toBeTruthy();
    expect(screen.getByText("بانتظار موافقتك على الاستهداف")).toBeTruthy();
    Object.defineProperty(window.navigator, "language", { configurable: true, value: "en-US" });
  });
});
