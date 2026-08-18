// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CampaignPlanSummary } from "./CampaignPlanSummary";

describe("CampaignPlanSummary", () => {
  afterEach(() => cleanup());

  it("shows persisted candidate preferences before a role plan is explicitly approved", () => {
    render(<CampaignPlanSummary profile={{ targetCity: "Jeddah", targetIndustry: "Artificial Intelligence", preferredSeniority: "Senior", preferredLanguage: "Arabic", openToRemote: true }} />);
    expect(screen.getByText("No role lanes approved yet")).toBeTruthy();
    expect(screen.getByText("Artificial Intelligence")).toBeTruthy();
    expect(screen.getByText("Senior")).toBeTruthy();
    expect(screen.getByText("Open")).toBeTruthy();
  });

  it("shows approved role lanes while retaining the profile settings escape route", () => {
    render(<CampaignPlanSummary approval={{ targetRoles: ["Data Analyst", "AI Specialist"], targetCity: "Riyadh", targetIndustry: "Technology", seniority: "Mid-level", preferredLanguage: "English", openToRemote: false, authorizationConfirmed: true, approvedAt: new Date() }} />);
    expect(screen.getByText("Reviewed by you")).toBeTruthy();
    expect(screen.getByText("Data Analyst")).toBeTruthy();
    expect(screen.getByText("AI Specialist")).toBeTruthy();
    expect(screen.getByRole("link", { name: /edit preferences/i }).getAttribute("href")).toBe("/dashboard/settings");
  });
});
