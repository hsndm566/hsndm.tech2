import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardBrowserHelperCta } from "./DashboardBrowserHelperCta";

vi.mock("wouter", () => ({
  useLocation: () => ["/dashboard"],
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe("DashboardBrowserHelperCta", () => {
  it("surfaces the local browser helper inside the dashboard", () => {
    render(<DashboardBrowserHelperCta />);
    expect(screen.getByRole("link", { name: /local browser helper/i })).toBeTruthy();
    expect(screen.getByText("Browser helper")).toBeTruthy();
  });
});
