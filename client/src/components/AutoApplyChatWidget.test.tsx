// @vitest-environment jsdom
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutoApplyChatWidget } from "./AutoApplyChatWidget";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AutoApplyChatWidget readiness gate", () => {
  it("stays hidden when the server-side Hermes integration is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: "unavailable" }),
    }));

    const { container } = render(<AutoApplyChatWidget />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "/api/chat/health",
      expect.objectContaining({ headers: { accept: "application/json" } }),
    ));
    expect(container.innerHTML).toBe("");
  });

  it("shows the launcher only after the server reports Hermes ready", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ready" }),
    }));

    render(<AutoApplyChatWidget />);
    expect(await screen.findByRole("button", { name: "Ask AutoApply" })).toBeTruthy();
  });
});
