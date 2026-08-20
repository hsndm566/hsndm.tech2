import React from "react";
import { BarChart3, BadgeCheck, FileCheck2, MessageCircleMore } from "lucide-react";
import { calculateCandidateAnalytics } from "@/lib/candidateInsights";

type CandidateAnalyticsSummaryProps = {
  applications: Array<{ status?: string | null }>;
  evidence: Array<{ applicationId?: number | string | null; evidenceType?: string | null }>;
};

function percentage(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

export function CandidateAnalyticsSummary({ applications, evidence }: CandidateAnalyticsSummaryProps) {
  const analytics = calculateCandidateAnalytics(applications, evidence);
  const metrics = [
    { label: "Applications tracked", value: String(analytics.tracked), detail: "Records in your workspace", icon: BarChart3 },
    { label: "Evidence coverage", value: percentage(analytics.evidenceCoverageRate), detail: analytics.tracked ? `${analytics.evidenceCovered} record${analytics.evidenceCovered === 1 ? "" : "s"} with evidence` : "No records yet", icon: FileCheck2 },
    { label: "Positive response rate", value: percentage(analytics.positiveResponseRate), detail: analytics.tracked ? `${analytics.positiveResponses} interview or offer update${analytics.positiveResponses === 1 ? "" : "s"}` : "No responses yet", icon: MessageCircleMore },
    { label: "Verified submissions", value: String(analytics.verifiedSubmitted), detail: "Portal-confirmed only", icon: BadgeCheck },
  ];

  return (
    <section aria-labelledby="candidate-analytics-title" className="rounded-2xl border border-[#151515]/10 bg-[#fbf9f5] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e5482a]">Your campaign snapshot</p>
          <h2 id="candidate-analytics-title" className="mt-1 text-xl font-bold tracking-tight">Evidence-first analytics</h2>
        </div>
        <span className="w-fit rounded-full border border-[#151515]/15 bg-[#f3f0e9] px-3 py-1.5 text-xs font-medium text-[#151515]/75">Private to your workspace</span>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#151515]/70">These rates are calculated from your own tracked applications and available evidence. They are not a benchmark, prediction, or comparison with other candidates.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ detail, icon: Icon, label, value }) => (
          <article key={label} className="rounded-xl border border-[#151515]/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold text-[#151515]/70">{label}</span><span className="grid size-8 place-items-center rounded-lg bg-[#e5482a]/10 text-[#e5482a]"><Icon className="size-4" aria-hidden="true" /></span></div>
            <p className="mt-5 font-mono text-3xl font-semibold tracking-tight text-[#151515]">{value}</p>
            <p className="mt-1 text-xs leading-5 text-[#151515]/60">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
