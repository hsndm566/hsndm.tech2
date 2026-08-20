type ApplicationRecord = {
  status?: string | null;
};

type EvidenceRecord = {
  applicationId?: number | string | null;
  evidenceType?: string | null;
};

type CandidateProfile = {
  targetCity?: string | null;
  targetIndustry?: string | null;
  preferredSeniority?: string | null;
} | null | undefined;

type CampaignApproval = {
  authorizationConfirmed?: boolean | null;
} | null | undefined;

export function calculateCandidateAnalytics(applications: ApplicationRecord[], evidence: EvidenceRecord[]) {
  const tracked = applications.length;
  const evidenceApplicationIds = new Set(evidence.map((item) => item.applicationId).filter((id): id is number | string => id !== null && id !== undefined));
  const evidenceCovered = evidenceApplicationIds.size;
  const verifiedSubmitted = evidence.filter((item) => item.evidenceType === "portal_confirmation").length;
  const positiveResponses = applications.filter((item) => item.status === "interview" || item.status === "offer").length;

  return {
    tracked,
    evidenceCovered,
    verifiedSubmitted,
    positiveResponses,
    evidenceCoverageRate: tracked ? Math.round((evidenceCovered / tracked) * 100) : null,
    positiveResponseRate: tracked ? Math.round((positiveResponses / tracked) * 100) : null,
  };
}

export function buildCandidateOnboardingSteps({
  profile,
  approval,
  applications,
  evidence,
}: {
  profile: CandidateProfile;
  approval: CampaignApproval;
  applications: ApplicationRecord[];
  evidence: EvidenceRecord[];
}) {
  return [
    {
      id: "profile",
      title: "Set your preferences",
      detail: "Confirm the Saudi city, industry, and seniority that guide matching.",
      href: "/dashboard/settings",
      action: "Open preferences",
      complete: Boolean(profile?.targetCity && profile?.targetIndustry && profile?.preferredSeniority),
    },
    {
      id: "approval",
      title: "Approve your targeting plan",
      detail: "Your plan must be reviewed before campaign activity can begin.",
      href: "#campaign-approval-title",
      action: "Review plan",
      complete: Boolean(approval?.authorizationConfirmed),
    },
    {
      id: "tracking",
      title: "Review application tracking",
      detail: "Submitted activity appears here only after a record has been created.",
      href: "#recent-activity",
      action: "View tracking",
      complete: applications.length > 0,
    },
    {
      id: "evidence",
      title: "Check evidence updates",
      detail: "Verified records appear when the required portal or email evidence is available.",
      href: "#recent-activity",
      action: "View evidence",
      complete: evidence.length > 0,
    },
  ] as const;
}
