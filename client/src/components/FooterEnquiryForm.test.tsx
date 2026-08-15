// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FooterEnquiryForm } from "./FooterEnquiryForm";

describe("FooterEnquiryForm", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("captures an enquiry and opens a prepared WhatsApp handoff", async () => {
    vi.useFakeTimers();
    const replace = vi.fn();
    vi.spyOn(window, "open").mockReturnValue({ opener: null, location: { replace } } as unknown as Window);
    render(<FooterEnquiryForm locale="en" />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Hasan" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "hasan@example.com" } });
    fireEvent.change(screen.getByLabelText("What would you like help with?"), { target: { value: "I need help with a Jeddah campaign." } });
    fireEvent.submit(screen.getByRole("button", { name: /Open WhatsApp/i }).closest("form")!);

    expect(window.open).toHaveBeenCalledWith("about:blank", "autoapply-footer-enquiry");
    await act(async () => { vi.advanceTimersByTime(450); });
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/966571448656"));
    expect(screen.getByRole("status").textContent).toContain("Your enquiry is ready");
  });

  it("localizes the form and presents a manual recovery link when a popup is blocked", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    render(<FooterEnquiryForm locale="ar" />);

    expect(screen.getByLabelText("الاسم")).toBeTruthy();
    expect(screen.getByRole("button", { name: /افتح WhatsApp/i })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("الاسم"), { target: { value: "حسن" } });
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني"), { target: { value: "hasan@example.com" } });
    fireEvent.change(screen.getByLabelText("كيف يمكننا مساعدتك؟"), { target: { value: "أرغب في الاستفسار." } });
    fireEvent.submit(screen.getByRole("button", { name: /افتح WhatsApp/i }).closest("form")!);

    expect(screen.getByRole("status").textContent).toContain("لم يُفتح WhatsApp؟");
    expect(screen.getByRole("link", { name: /فتح WhatsApp/i }).getAttribute("href")).toContain("https://wa.me/966571448656");
  });
});
