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
    fireEvent.click(screen.getByRole("button", { name: "How does AutoApply SA work?" }));

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(1));
    const request = mockedFetch.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.message).toBe("How does AutoApply SA work?");
    expect(payload.session_id).toMatch(/^autoapply-/);
    expect(window.localStorage.getItem("autoapply_sa_web_chat_session")).toBe(payload.session_id);
    expect(screen.getByText("<img src=x onerror=alert(1)> Safe bilingual reply / رد آمن")).toBeTruthy();
    expect(container.querySelector('img[src="x"]')).toBeNull();
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
    expect(screen.getByRole("link", { name: /Upload CV/i }).getAttribute("href")).toBe("/#cv-intake");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "AutoApply SA chat" })).toBeNull();
  });
});
