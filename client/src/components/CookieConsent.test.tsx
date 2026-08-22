// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { consentCookieAttributes } from "@/lib/consentCookie";
import { CookieConsent } from "./CookieConsent";

let currentLocation = "/";
vi.mock("wouter", () => ({ useLocation: () => [currentLocation, vi.fn()] }));

describe("CookieConsent", () => {
  afterEach(() => {
    cleanup();
    document.cookie = "autoapply_optional_consent=; Path=/; Max-Age=0";
    document.querySelector("script[data-autoapply-analytics]")?.remove();
    currentLocation = "/";
  });

  it("keeps optional analytics off until the visitor makes an affirmative choice", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.querySelector("script[data-autoapply-analytics]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Use necessary only" }));
    const settings = screen.getByRole("button", { name: "Cookie settings" });
    expect(settings).toBeTruthy();
    expect(settings.className).toContain("cookie-settings-trigger");
    expect(settings.className).toContain("bottom-[max(.75rem,env(safe-area-inset-bottom))]");
    expect(settings.className).toContain("sm:bottom-4");
    expect(document.querySelector("script[data-autoapply-analytics]")).toBeNull();
  });

  it("uses Arabic consent copy and an Arabic policy destination on Arabic routes", () => {
    currentLocation = "/ar";
    render(<CookieConsent />);
    expect(screen.getByRole("heading", { name: "تحليلات اختيارية" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "سياسة الخصوصية" }).getAttribute("href")).toBe("/ar/privacy");
  });

  it("keeps the consent surface compact, non-modal, and actions usable on narrow screens", () => {
    render(<CookieConsent />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("false");
    expect(dialog.className).toContain("bottom-[max(.5rem,env(safe-area-inset-bottom))]");
    expect(dialog.className).toContain("z-[80]");
    expect(dialog.className).toContain("max-w-md");
    expect(dialog.querySelector("div")?.className).toContain("sm:flex-row");
    expect(dialog.querySelector(".grid")?.className).toContain("grid-cols-2");
    expect(screen.getByRole("button", { name: "Allow analytics" }).className).toContain("min-w-0");
    expect(screen.getByRole("button", { name: "Use necessary only" })).toBeTruthy();
  });

  it("uses Secure only for HTTPS cookie persistence while retaining same-site protection on HTTP", () => {
    expect(consentCookieAttributes(60, "http:")).toBe("Path=/; Max-Age=60; SameSite=Lax");
    expect(consentCookieAttributes(60, "https:")).toBe("Path=/; Max-Age=60; SameSite=Lax; Secure");
  });
});
