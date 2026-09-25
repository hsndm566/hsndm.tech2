// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { LocaleProvider } from "./locale";

const mocks = vi.hoisted(() => ({ data: {} as any, sendApplicationEmail: vi.fn() }));

vi.mock("./data", () => ({
  useWorkspaceData: () => mocks.data,
  saudiWeekStart: () => new Date("2026-09-19T21:00:00Z"),
}));

vi.mock("./auth", () => ({
  useSession: () => ({ session: { user: { id: "test-user", email: "candidate@example.com" } } }),
  supabase: { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } },
}));

vi.mock("./backend", () => ({
  useBackendHealth: () => ({ data: { ok: true, status: 200 }, isLoading: false }),
  useApplicationDeliveryReadiness: () => ({ data: { ok: true, status: 200 }, isLoading: false }),
  useRecommendedJobs: () => ({
    data: {
      jobs: [{
        id: "199945cc-4e96-451c-bb4f-e999f37c6873",
        companyName: "Pronto",
        roleTitle: "Field Engineer",
        city: "Riyadh, KSA",
        source: "public_ats",
        url: "https://job-boards.greenhouse.io/pronto/jobs/8842921002",
        summary: "",
        matchReason: "title aligns with Engineering",
        freshness: "2026-09-25T18:10:05Z",
      }],
      mode: "live",
      checkedAt: "2026-09-25T18:10:05Z",
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  sendApplicationEmail: mocks.sendApplicationEmail,
}));

import { Workspace } from "./Workspace";

function mount(path = "/dashboard") {
  const memory = memoryLocation({ path });
  render(<Router hook={memory.hook}><LocaleProvider><Workspace /></LocaleProvider></Router>);
  return memory;
}

beforeEach(() => {
  mocks.sendApplicationEmail.mockReset();
  mocks.sendApplicationEmail.mockResolvedValue({
    ok: true,
    status: 200,
    error: "",
    messageId: "<provider-message-1>",
    application: { id: "app-1", status: "applied" },
  });
  mocks.data = {
    profile: {
      data: {
        fullName: "Test Candidate",
        targetCity: "Jeddah",
        targetRole: "Industrial Engineer",
        targetIndustry: "Engineering",
        experienceLevel: "Entry level",
        resumeFileName: "candidate.pdf",
        resumeSummary: "Excel, process improvement",
        resumeStoragePath: "test-user/candidate.pdf",
      },
      isSuccess: true,
    },
    apps: { data: [], refetch: vi.fn().mockResolvedValue(undefined) },
    create: { mutate: vi.fn(), isPending: false },
    update: { mutate: vi.fn() },
    saveProfile: { mutateAsync: vi.fn().mockResolvedValue(undefined), isPending: false },
    claimAccess: {
      mutateAsync: vi.fn().mockResolvedValue({ ok: true, applications: 50, name: "Test Candidate" }),
      isPending: false,
    },
    clear: vi.fn(),
  };
});

afterEach(cleanup);

describe("V2 workspace behavior", () => {
  it("offers private candidate access before onboarding", async () => {
    mocks.data.profile.data = null;
    mount();
    expect(await screen.findByRole("heading", { name: "Connect your application history." })).toBeTruthy();
    expect(screen.getByRole("link", { name: "I am a new user without a code" })).toBeTruthy();
  });

  it("renders the real empty state without illustrative account records", () => {
    mount();
    expect(screen.getByRole("heading", { name: "Your next opportunity starts here." })).toBeTruthy();
    expect(screen.queryByText("Example company")).toBeNull();
  });

  it("shows a recoverable service error", () => {
    mocks.data.profile.isError = true;
    mount();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Track a job" })).toBeNull();
  });

  it("submits only the entered manual job to the tracker adapter", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Track a job" }));
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Test Company" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "Engineer" } });
    fireEvent.click(screen.getByRole("button", { name: "Save job" }));
    expect(mocks.data.create.mutate).toHaveBeenCalledWith(
      { companyName: "Test Company", roleTitle: "Engineer", city: "Riyadh" },
      expect.any(Object),
    );
  });

  it("requires a verified selected job and refreshes the server-recorded application after send", async () => {
    mount();
    expect(screen.getByRole("button", { name: "Send and record application" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Use this job" }));
    expect(screen.getByDisplayValue("Pronto")).toBeTruthy();
    expect(screen.getByDisplayValue("Field Engineer")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Recipient email"), { target: { value: "hiring@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send and record application" }));

    await waitFor(() => expect(mocks.sendApplicationEmail).toHaveBeenCalledWith({
      toEmail: "hiring@example.com",
      jobId: "199945cc-4e96-451c-bb4f-e999f37c6873",
    }));
    await waitFor(() => expect(mocks.data.apps.refetch).toHaveBeenCalled());
    expect(mocks.data.create.mutate).not.toHaveBeenCalled();
    expect(await screen.findByText(/Provider evidence/)).toBeTruthy();
  });

  it("keeps form entries when profile saving fails", async () => {
    mocks.data.saveProfile.mutateAsync.mockRejectedValue(new Error("offline"));
    mount("/settings");
    fireEvent.change(screen.getByLabelText("Target role"), { target: { value: "Engineer" } });
    fireEvent.click(screen.getByRole("button", { name: "Save and open dashboard" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Could not save"));
    expect((screen.getByLabelText("Target role") as HTMLInputElement).value).toBe("Engineer");
  });

  it("distinguishes failure from an empty application list", () => {
    mocks.data.apps.isError = true;
    mount();
    expect(screen.getByRole("alert").textContent).toContain("Applications could not be loaded");
    expect(screen.queryByText("Your next opportunity starts here.")).toBeNull();
  });
});
