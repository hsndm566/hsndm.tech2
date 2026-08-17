export type DashboardViewModel = {
  customer: {
    firstName: string;
    fullName: string;
    initials: string;
    email: string;
  };
  campaign: {
    status: "not_started" | "profile_review" | "sourcing" | "paused" | "active";
    lastUpdated: string;
  };
  checklist: {
    completed: number;
    total: number;
    items: Array<{
      key: "cv" | "preferences" | "profile_review" | "launch";
      state: "done" | "needs_you" | "locked" | "in_review";
    }>;
  };
  metrics: {
    sourced: number;
    readyForReview: number;
    verifiedSubmitted: number;
    emailAccepted: number;
    needsAction: number;
  };
};

export type DashboardIdentity = {
  fullName?: string | null;
  email?: string | null;
};

export function createFirstLoginDashboardViewModel(identity?: DashboardIdentity): DashboardViewModel {
  const fullName = identity?.fullName?.trim() || "Your workspace";
  const firstName = identity?.fullName?.trim().split(/\s+/)[0] || "there";
  const initials = identity?.fullName?.trim()
    ? identity.fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")
    : "AA";

  return {
    customer: {
      firstName,
      fullName,
      initials,
      email: identity?.email?.trim() || "Signed-in customer",
    },
    campaign: { status: "not_started", lastUpdated: "Updated just now" },
    checklist: {
      completed: 0,
      total: 4,
      items: [
        { key: "cv", state: "needs_you" },
        { key: "preferences", state: "locked" },
        { key: "profile_review", state: "locked" },
        { key: "launch", state: "locked" },
      ],
    },
    metrics: { sourced: 0, readyForReview: 0, verifiedSubmitted: 0, emailAccepted: 0, needsAction: 0 },
  };
}
