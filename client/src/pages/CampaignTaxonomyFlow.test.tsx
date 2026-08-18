// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  setLocation: vi.fn(),
  reportBlockedHandoff: vi.fn(),
  submitSecureEnquiry: vi.fn(),
}));

vi.mock("wouter", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
  useLocation: () => ["/enquire", mocks.setLocation],
}));

vi.mock("@/lib/seo", () => ({ applyPageSeo: vi.fn() }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    campaign: {
      clientIssue: { reportBlockedWhatsAppHandoff: { useMutation: () => ({ mutate: mocks.reportBlockedHandoff }) } },
      enquiry: { submit: { useMutation: () => ({ mutate: mocks.submitSecureEnquiry, isPending: false, error: null }) } },
    },
  },
}));

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", TestResizeObserver);

describe("campaign taxonomy handoff flow", () => {
  let replace: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    replace = vi.fn();
    mocks.setLocation.mockReset();
    mocks.reportBlockedHandoff.mockReset();
    mocks.submitSecureEnquiry.mockReset();
    vi.spyOn(window, "open").mockReturnValue({ opener: null, location: { replace } } as unknown as Window);
  });

  afterEach(() => {
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
    fireEvent.click(screen.getByLabelText("I approve this contact request and understand it does not start any employer application."));
    fireEvent.click(screen.getByRole("button", { name: "Confirm via WhatsApp" }));

    expect(decodeURIComponent(vi.mocked(window.open).mock.calls[0][0] as string)).toContain("Target city: Riyadh");
    expect(decodeURIComponent(vi.mocked(window.open).mock.calls[0][0] as string)).toContain("Target industry: Finance & Banking");
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
    fireEvent.click(screen.getByLabelText("أوافق على طلب التواصل هذا وأفهم أنه لا يبدأ أي تقديم لصاحب عمل."));
    fireEvent.click(screen.getByRole("button", { name: "تأكيد عبر واتساب" }));

    expect(decodeURIComponent(vi.mocked(window.open).mock.calls[0][0] as string)).toContain("المدينة المستهدفة: الرياض");
    expect(decodeURIComponent(vi.mocked(window.open).mock.calls[0][0] as string)).toContain("المجال المستهدف: المالية والمصارف");
  });

  it("creates a CV-free secure web enquiry only after explicit campaign authorization and shows a receipt", async () => {
    mocks.submitSecureEnquiry.mockImplementation((_payload, options) => options?.onSuccess?.({ reference: "AA-TEST123", createdAt: new Date() }));
    const { default: Enquire } = await import("./Enquire");
    const { container } = render(<Enquire />);
    fireEvent.change(screen.getByPlaceholderText("How should we address you?"), { target: { value: "Sara" } });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), { target: { value: "sara@example.com" } });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Technology" } });
    fireEvent.submit(container.querySelector("form")!);
    fireEvent.click(screen.getByLabelText("Secure web enquiry"));
    fireEvent.click(screen.getByLabelText("I approve this contact request and understand it does not start any employer application."));
    fireEvent.click(screen.getByRole("button", { name: "Confirm secure enquiry" }));

    expect(mocks.submitSecureEnquiry).toHaveBeenCalledWith(expect.objectContaining({ fullName: "Sara", email: "sara@example.com", targetRole: "Technology", campaignAuthorizationConfirmed: true }), expect.any(Object));
    expect(mocks.submitSecureEnquiry.mock.calls[0][0]).not.toHaveProperty("fileName");
    expect(screen.getByText("AA-TEST123")).toBeTruthy();
    expect(screen.getByText(/No CV was sent from this page/)).toBeTruthy();
  });
});
