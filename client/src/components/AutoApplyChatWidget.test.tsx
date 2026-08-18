// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutoApplyChatWidget } from "./AutoApplyChatWidget";

const mockedFetch = vi.fn();

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("AutoApplyChatWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    cleanup();
    mockedFetch.mockReset();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("uses a persisted anonymous session and renders remote text without interpreting it as markup", async () => {
    mockedFetch.mockResolvedValue({ ok: true, json: async () => ({ reply: "<img src=x onerror=alert(1)> Safe bilingual reply / رد آمن" }) });
    vi.stubGlobal("fetch", mockedFetch);
    const { container } = render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Start a campaign / ابدأ" }));

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(1));
    const request = mockedFetch.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.message).toBe("start");
    expect(payload.session_id).toMatch(/^autoapply-/);
    expect(window.localStorage.getItem("autoapply_sa_web_chat_session")).toBe(payload.session_id);
    expect(screen.getByText("<img src=x onerror=alert(1)> Safe bilingual reply / رد آمن")).toBeTruthy();
    expect(container.querySelector('img[src="x"]')).toBeNull();
  });

  it("offers the approved bilingual campaign and FAQ quick actions", () => {
    render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));

    expect(screen.getByRole("button", { name: "Start a campaign / ابدأ" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "How it works / كيف نعمل" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pricing / الأسعار" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Privacy / الخصوصية" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cities / المدن" })).toBeTruthy();
    expect(screen.getByText(/CV files are not retained in chat/)).toBeTruthy();
  });

  it("shows an accurate bilingual privacy-isolation badge with a keyboard-accessible explanation", async () => {
    render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    expect(screen.getByText("Private by design / الخصوصية أولاً")).toBeTruthy();

    fireEvent.focus(screen.getByRole("button", { name: "How AutoApply SA protects chat privacy" }));
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toContain("Candidate dashboard records are isolated by signed-in account");
    expect(tooltip.textContent).toContain("CV files are not retained in chat");
    expect(tooltip.textContent).toContain("تُعزل سجلات لوحة المرشح");
  });

  it("keeps bilingual quick replies available after a response so visitors can continue common queries", async () => {
    mockedFetch.mockResolvedValue({ ok: true, json: async () => ({ reply: "Campaign guidance / إرشادات الحملة" }) });
    vi.stubGlobal("fetch", mockedFetch);
    render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Start a campaign / ابدأ" }));

    await screen.findByText("Campaign guidance / إرشادات الحملة");
    expect(screen.getByRole("group", { name: "Quick chat replies" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Pricing / الأسعار" }));
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    const request = mockedFetch.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(String(request.body)).message).toBe("pricing");
  });

  it("sends a minimal up or down quality signal for a server-identified response", async () => {
    mockedFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reply: "Campaign guidance / إرشادات الحملة", response_id: "web_abcdefghijklmnop" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ recorded: true }) });
    vi.stubGlobal("fetch", mockedFetch);
    render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Start a campaign / ابدأ" }));
    await screen.findByText("Campaign guidance / إرشادات الحملة");
    expect(screen.getByRole("button", { name: "Mark this response not helpful" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Mark this response helpful" }));
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    const feedbackRequest = mockedFetch.mock.calls[1];
    expect(feedbackRequest?.[0]).toContain("/web-chat-feedback");
    expect(JSON.parse(String((feedbackRequest?.[1] as RequestInit).body))).toEqual({ response_id: "web_abcdefghijklmnop", rating: "up" });
    expect(screen.getByRole("button", { name: "Mark this response helpful" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Thank you / شكراً")).toBeTruthy();
  });

  it("shows a loading state and a user-safe recovery message when the endpoint is unavailable", async () => {
    let rejectRequest: (reason?: unknown) => void = () => undefined;
    mockedFetch.mockImplementation(() => new Promise((_, reject) => { rejectRequest = reject; }));
    vi.stubGlobal("fetch", mockedFetch);
    render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    fireEvent.change(screen.getByLabelText("Message AutoApply SA"), { target: { value: "Help me apply" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    const typingIndicator = screen.getByRole("status", { name: "AutoApply SA is typing" });
    expect(typingIndicator.textContent).toContain("Typing");
    expect(screen.getAllByTestId("chat-typing-dot")).toHaveLength(3);
    expect(screen.getAllByTestId("chat-typing-dot")[0]?.className).toContain("motion-safe:animate");

    rejectRequest(new Error("network unavailable"));
    expect((await screen.findByText(/Chat is temporarily unavailable/)).textContent).toContain("Chat is temporarily unavailable");
    expect(screen.getByRole("link", { name: "WhatsApp" }).getAttribute("href")).toContain("wa.me/966571448656");
  });

  it("supports Escape to close the widget and provides a CV upload route", () => {
    render(<AutoApplyChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    expect(screen.getByRole("dialog", { name: "AutoApply SA chat" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Upload CV/i }).getAttribute("href")).toBe("/#upload");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "AutoApply SA chat" })).toBeNull();
  });

  it("moves keyboard focus into the modal chat and restores it to the launcher on close", async () => {
    render(<AutoApplyChatWidget />);
    const launcher = screen.getByRole("button", { name: "Open AutoApply SA chat" });
    launcher.focus();
    fireEvent.click(launcher);

    const dialog = screen.getByRole("dialog", { name: "AutoApply SA chat" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Message AutoApply SA")));

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(launcher));
  });
});
