// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.getByRole("button", { name: "Cookie settings" })).toBeTruthy();
    expect(document.querySelector("script[data-autoapply-analytics]")).toBeNull();
  });

  it("uses Arabic consent copy and an Arabic policy destination on Arabic routes", () => {
    currentLocation = "/ar";
    render(<CookieConsent />);
    expect(screen.getByRole("heading", { name: "تحليلات اختيارية" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "سياسة الخصوصية" }).getAttribute("href")).toBe("/ar/privacy");
  });
});
