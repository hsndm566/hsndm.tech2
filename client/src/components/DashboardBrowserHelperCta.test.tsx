import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardBrowserHelperCta } from "./DashboardBrowserHelperCta";

vi.mock("wouter", () => ({
  useLocation: () => ["/dashboard"],
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe("DashboardBrowserHelperCta", () => {
  it("links dashboard customers to local browser setup", () => {
    render(<DashboardBrowserHelperCta />);
    expect(screen.getByRole("link", { name: /local browser helper/i }).getAttribute("href")).toBe("/dashboard/browser-helper");
  });
});
