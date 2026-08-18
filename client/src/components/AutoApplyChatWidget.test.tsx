// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutoApplyChatWidget } from "./AutoApplyChatWidget";

const mockedFetch = vi.fn();

describe("AutoApplyChatWidget", () => {
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

  it("shows a loading state and a user-safe recovery message when the endpoint is unavailable", async () => {
    let rejectRequest: (reason?: unknown) => void = () => undefined;
    mockedFetch.mockImplementation(() => new Promise((_, reject) => { rejectRequest = reject; }));
    vi.stubGlobal("fetch", mockedFetch);
    render(<AutoApplyChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: "Open AutoApply SA chat" }));
    fireEvent.change(screen.getByLabelText("Message AutoApply SA"), { target: { value: "Help me apply" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByLabelText("AutoApply SA is replying")).toBeTruthy();

    rejectRequest(new Error("network unavailable"));
    expect((await screen.findByRole("status")).textContent).toContain("Chat is temporarily unavailable");
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
