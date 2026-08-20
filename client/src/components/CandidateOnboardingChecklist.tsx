import React, { useEffect, useRef, useState } from "react";
import { Check, Circle, ClipboardCheck, ArrowRight } from "lucide-react";
import { buildCandidateOnboardingSteps } from "@/lib/candidateInsights";

type CandidateOnboardingChecklistProps = {
  profile?: { targetCity?: string | null; targetIndustry?: string | null; preferredSeniority?: string | null } | null;
  approval?: { authorizationConfirmed?: boolean | null } | null;
  applications: Array<{ status?: string | null }>;
  evidence: Array<{ applicationId?: number | string | null; evidenceType?: string | null }>;
  isArabic?: boolean;
};

export function CandidateOnboardingChecklist({ applications, approval, evidence, isArabic = false, profile }: CandidateOnboardingChecklistProps) {
  const steps = buildCandidateOnboardingSteps({ profile, approval, applications, evidence });
  const completed = steps.filter((step) => step.complete).length;
  const previousCompletionState = useRef<Map<string, boolean>>(new Map());
  const [recentlyCompletedStepIds, setRecentlyCompletedStepIds] = useState<string[]>([]);
  const completionSignature = steps.map((step) => `${step.id}:${step.complete}`).join("|");
  const copy = isArabic
    ? { eyebrow: "إعداد الحملة", title: "قائمة بدء حسابك", body: "أكمل هذه الخطوات بالترتيب. لا تبدأ أي عملية تقديم تلقائياً.", complete: "مكتملة", next: "الخطوة التالية" }
    : { eyebrow: "Campaign setup", title: "Your onboarding checklist", body: "Complete these steps in order. No application activity starts automatically.", complete: "complete", next: "Next step" };

  useEffect(() => {
    const previous = previousCompletionState.current;
    const justCompleted = steps.filter((step) => previous.size > 0 && previous.get(step.id) === false && step.complete).map((step) => step.id);
    previousCompletionState.current = new Map(steps.map((step) => [step.id, step.complete]));

    if (!justCompleted.length) return;
    setRecentlyCompletedStepIds(justCompleted);
    const timeoutId = window.setTimeout(() => setRecentlyCompletedStepIds([]), 620);
    return () => window.clearTimeout(timeoutId);
  }, [completionSignature]);

  return (
    <section aria-labelledby="candidate-onboarding-title" className="rounded-2xl border border-[#151515]/10 bg-[#fbf9f5] p-5 shadow-sm sm:p-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#e5482a]">{copy.eyebrow}</p>
          <h2 id="candidate-onboarding-title" className="mt-1 text-xl font-bold tracking-tight">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#151515]/70">{copy.body}</p>
        </div>
        <span className="w-fit rounded-full border border-[#e5482a]/25 bg-[#e5482a]/10 px-3 py-1.5 font-mono text-xs font-semibold text-[#9c2f1e]">{completed} / {steps.length} {copy.complete}</span>
      </div>
      <ol className="mt-5 grid gap-3 lg:grid-cols-2">
        {steps.map((step, index) => (
          <li data-anime-dashboard-onboarding-step data-onboarding-complete-feedback={recentlyCompletedStepIds.includes(step.id) ? "true" : undefined} key={step.id} className={`flex gap-3 rounded-xl border p-4 ${step.complete ? "border-emerald-700/20 bg-emerald-50/50" : "border-[#151515]/10 bg-white"}`}>
            <span data-onboarding-completion-check={recentlyCompletedStepIds.includes(step.id) ? "true" : undefined} className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border ${step.complete ? "border-emerald-700/25 bg-emerald-100 text-emerald-800" : "border-[#151515]/15 bg-[#f3f0e9] text-[#151515]/60"}`}>{step.complete ? <Check className="size-4" aria-label="Complete" /> : <Circle className="size-4" aria-label="Not complete" />}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-[#151515]/50">{String(index + 1).padStart(2, "0")}</span><h3 className="text-sm font-bold">{step.title}</h3>{!step.complete && index === completed ? <span className="rounded-full bg-[#e5482a]/10 px-2 py-0.5 text-[10px] font-semibold text-[#9c2f1e]">{copy.next}</span> : null}</div>
              <p className="mt-1 text-xs leading-5 text-[#151515]/65">{step.detail}</p>
              {!step.complete ? <a className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#e5482a] hover:text-[#9c2f1e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]" href={step.href}>{step.action}<ArrowRight className={`size-3 ${isArabic ? "-scale-x-100" : ""}`} /></a> : null}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 flex items-center gap-2 text-xs text-[#151515]/60"><ClipboardCheck className="size-4 text-[#e5482a]" aria-hidden="true" />Your progress is calculated from this workspace only.</p>
    </section>
  );
}
