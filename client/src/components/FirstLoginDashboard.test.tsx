// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createFirstLoginDashboardViewModel } from "@/lib/firstLoginDashboardModel";
import { FirstLoginDashboard } from "./FirstLoginDashboard";

describe("FirstLoginDashboard", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("uses the signed-in identity without hard-coding a customer", () => {
    render(<FirstLoginDashboard identity={{ fullName: "Aisha Saud", email: "aisha@example.com" }} />);

    expect(screen.getByText("Good to see you, Aisha.")).toBeTruthy();
    expect(screen.getByText("Aisha Saud")).toBeTruthy();
    expect(screen.getByText("aisha@example.com")).toBeTruthy();
    expect(screen.getByText("AS")).toBeTruthy();
    expect(screen.queryByText("Saif Ahmed")).toBeNull();
  });

  it("uses a safe generic identity fallback when no session identity has resolved", () => {
    const viewModel = createFirstLoginDashboardViewModel();
    render(<FirstLoginDashboard />);

    expect(viewModel.customer).toEqual({ firstName: "there", fullName: "Your workspace", initials: "AA", email: "Signed-in customer" });
    expect(screen.getByText("Good to see you, there.")).toBeTruthy();
    expect(screen.getByText("Your workspace")).toBeTruthy();
    expect(screen.getByText("Signed-in customer")).toBeTruthy();
  });

  it("keeps the campaign state and all first-login metrics truthful", () => {
    render(<FirstLoginDashboard identity={{ fullName: "Aisha Saud" }} />);

    expect(screen.getByText("Campaign not started")).toBeTruthy();
    expect(screen.getByText("0 / 4 complete")).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("Nothing has been submitted yet")).toBeTruthy();
    expect(screen.getAllByText("Verified submitted").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Email accepted")).toBeTruthy();
    expect(screen.getAllByText("Needs your action").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/Application submitted for/i)).toBeNull();
  });

  it("opens and closes accessible mobile navigation without horizontal-only controls", () => {
    render(<FirstLoginDashboard />);

    const menuButton = screen.getByRole("button", { name: "Open navigation" });
    expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(menuButton);
    expect(screen.getByRole("button", { name: "Close navigation" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("complementary", { name: "Dashboard navigation" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(screen.getByRole("button", { name: "Open navigation" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("switches the first-login workspace to persisted Arabic RTL copy without changing the signed-in identity", () => {
    render(<FirstLoginDashboard identity={{ fullName: "Aisha Saud", email: "aisha@example.com" }} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Switch dashboard language" })[0]);

    expect(screen.getByText("لنجهّز حملة التوظيف الخاصة بك في السعودية.")).toBeTruthy();
    expect(screen.getByText("سعداء برؤيتك، Aisha.")).toBeTruthy();
    expect(document.querySelector('[lang="ar"]')?.getAttribute("dir")).toBe("rtl");
    expect(window.localStorage.getItem("autoapply_dashboard_locale")).toBe("ar");
  });
});
