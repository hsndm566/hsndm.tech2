import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BrowserHelper from "./BrowserHelper";

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe("BrowserHelper", () => {
  it("offers a no-store local Chrome path with a safe dry run", () => {
    render(<BrowserHelper />);
    expect(screen.getByText(/No Web Store install/i)).toBeTruthy();
    expect(screen.getByText("applypilot apply --dry-run")).toBeTruthy();
    expect(screen.getByText("applypilot doctor")).toBeTruthy();
    expect(screen.getByRole("link", { name: /View source and updates/i }).getAttribute("href")).toContain("hsndm566/applypilot-saudi");
  });
});
