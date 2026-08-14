// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  setLocation: vi.fn(),
  reportBlockedHandoff: vi.fn(),
}));

vi.mock("wouter", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
  useLocation: () => ["/enquire", mocks.setLocation],
}));

vi.mock("@/lib/seo", () => ({ applyPageSeo: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { campaign: { clientIssue: { reportBlockedWhatsAppHandoff: { useMutation: () => ({ mutate: mocks.reportBlockedHandoff }) } } } } }));

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", TestResizeObserver);

describe("campaign taxonomy handoff flow", () => {
  let replace: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    replace = vi.fn();
    mocks.setLocation.mockReset();
    mocks.reportBlockedHandoff.mockReset();
    vi.spyOn(window, "open").mockReturnValue({ opener: null, location: { replace } } as unknown as Window);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  it("adds selected English taxonomy values to the prepared WhatsApp campaign handoff", async () => {
    const { default: Enquire } = await import("./Enquire");
    const { container } = render(<Enquire />);
    fireEvent.change(screen.getByPlaceholderText("How should we address you?"), { target: { value: "Sara" } });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), { target: { value: "sara@example.com" } });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Technology" } });
    fireEvent.change(selects[1], { target: { value: "Riyadh" } });
    fireEvent.change(selects[2], { target: { value: "Finance & Banking" } });
    fireEvent.submit(container.querySelector("form")!);
    vi.runAllTimers();

    expect(decodeURIComponent(replace.mock.calls[0][0])).toContain("Target city: Riyadh");
    expect(decodeURIComponent(replace.mock.calls[0][0])).toContain("Target industry: Finance & Banking");
  });

  it("uses Arabic labels for selected canonical taxonomy values in the Arabic WhatsApp handoff", async () => {
    const { default: ArabicEnquire } = await import("./ArabicEnquire");
    const { container } = render(<ArabicEnquire />);
    fireEvent.change(screen.getByPlaceholderText("كيف نُخاطبك؟"), { target: { value: "سارة" } });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), { target: { value: "sara@example.com" } });
    const selects = screen.getAllByRole("combobox");
    expect(screen.getByRole("option", { name: "الرياض" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "المالية والمصارف" })).toBeTruthy();
    fireEvent.change(selects[0], { target: { value: "Technology" } });
    fireEvent.change(selects[1], { target: { value: "Riyadh" } });
    fireEvent.change(selects[2], { target: { value: "Finance & Banking" } });
    fireEvent.submit(container.querySelector("form")!);
    vi.runAllTimers();

    expect(decodeURIComponent(replace.mock.calls[0][0])).toContain("المدينة المستهدفة: الرياض");
    expect(decodeURIComponent(replace.mock.calls[0][0])).toContain("المجال المستهدف: المالية والمصارف");
  });
});
