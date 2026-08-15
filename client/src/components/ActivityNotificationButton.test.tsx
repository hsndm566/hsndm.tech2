// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivityNotificationButton } from "./ActivityNotificationButton";

describe("ActivityNotificationButton candidate journey", () => {
  afterEach(() => cleanup());
  it("shows new activity, clears it after opening, and scrolls to the feed", async () => {
    const onSeen = vi.fn();
    const scrollIntoView = vi.fn();
    const feed = document.createElement("section");
    feed.id = "recent-activity";
    feed.scrollIntoView = scrollIntoView;
    document.body.appendChild(feed);

    render(
      <ActivityNotificationButton
        activities={[{ timestamp: "2026-08-15T04:00:00.000Z" }]}
        seenAt={0}
        onSeen={onSeen}
      />,
    );

    const button = screen.getByRole("button", { name: "View 1 new activity updates" });
    expect(button.textContent).toContain("1");

    fireEvent.pointerDown(button, { button: 0 });
    const previewItem = await screen.findByRole("menuitem", { name: /Activity update/i });
    expect(previewItem).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: /View full activity feed/i }));

    expect(onSeen).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("keeps the control quiet when activity has already been seen", async () => {
    render(
      <ActivityNotificationButton
        activities={[{ timestamp: "2026-08-15T04:00:00.000Z" }]}
        seenAt={Date.parse("2026-08-15T05:00:00.000Z")}
        onSeen={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "View recent activity" })).toBeTruthy();
    fireEvent.pointerDown(screen.getByRole("button", { name: "View recent activity" }), { button: 0 });
    expect(await screen.findByText("Up to date")).toBeTruthy();
    expect(screen.queryByLabelText("1 new updates")).toBeNull();
  });
});
