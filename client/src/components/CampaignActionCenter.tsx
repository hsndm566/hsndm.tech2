import { ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, Inbox, ShieldCheck } from "lucide-react";
import React from "react";

type Props = {
  hasCandidateApproval: boolean;
  verifiedEvidenceCount: number;
  applicationStatuses?: string[];
  isArabic?: boolean;
  isLoading?: boolean;
};

type Copy = {
  eyebrow: string;
  title: string;
  body: string;
  plan: string;
  evidence: string;
  next: string;
  approved: string;
  notApproved: string;
  evidenceCount: (count: number) => string;
  confirmTitle: string;
  confirmBody: string;
  confirmCta: string;
  reviewTitle: string;
  reviewBody: string;
  reviewCta: string;
  responseTitle: string;
  responseBody: string;
  responseCta: string;
};

const english: Copy = {
  eyebrow: "Campaign action center",
  title: "Your next campaign step",
  body: "This panel reflects only your saved plan, recorded application evidence, and tracked status updates.",
  plan: "Targeting plan",
  evidence: "Verified evidence",
  next: "Next action",
  approved: "Reviewed by you",
  notApproved: "Needs your review",
  evidenceCount: (count) => `${count} recorded`,
  confirmTitle: "Review and approve your targeting plan",
  confirmBody: "Choose the roles, city, and preferences you want the team to review. This saves a plan only; it does not send job applications.",
  confirmCta: "Review targeting plan",
  reviewTitle: "No candidate action is needed right now",
  reviewBody: "Your plan is saved for team review. Check the activity log when application evidence or a status update is recorded.",
  reviewCta: "View campaign activity",
  responseTitle: "Review your recorded application update",
  responseBody: "A tracked application shows an interview or offer milestone. Open the activity log to check the latest recorded details.",
  responseCta: "Review activity update",
};

const arabic: Copy = {
  eyebrow: "مركز إجراءات الحملة",
  title: "خطوتك التالية في الحملة",
  body: "تعتمد هذه البطاقة فقط على خطتك المحفوظة وإثباتات التقديم المسجلة وتحديثات الحالة المتتبعة.",
  plan: "خطة الاستهداف",
  evidence: "الإثباتات الموثقة",
  next: "الإجراء التالي",
  approved: "راجعتها أنت",
  notApproved: "تحتاج إلى مراجعتك",
  evidenceCount: (count) => `${count} مسجّل`,
  confirmTitle: "راجع واعتمد خطة الاستهداف",
  confirmBody: "اختر المسميات والمدينة والتفضيلات التي تريد أن يراجعها الفريق. يحفظ ذلك خطة فقط ولا يرسل طلبات توظيف.",
  confirmCta: "مراجعة خطة الاستهداف",
  reviewTitle: "لا يلزمك أي إجراء الآن",
  reviewBody: "خطة الاستهداف محفوظة لمراجعة الفريق. راجع سجل النشاط عند تسجيل إثبات تقديم أو تحديث حالة.",
  reviewCta: "عرض نشاط الحملة",
  responseTitle: "راجع تحديث طلبك المسجّل",
  responseBody: "يوجد طلب متتبع بحالة مقابلة أو عرض. افتح سجل النشاط لمراجعة أحدث التفاصيل المسجلة.",
  responseCta: "مراجعة تحديث النشاط",
};

export function CampaignActionCenter({ applicationStatuses = [], hasCandidateApproval, isArabic = false, isLoading = false, verifiedEvidenceCount }: Props) {
  const copy = isArabic ? arabic : english;
  if (isLoading) {
    return <section aria-busy="true" aria-label={copy.title} className="rounded-3xl border border-[#e5482a]/20 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-5"><div className="space-y-3"><div className="h-3 w-28 animate-pulse rounded bg-[#e5482a]/15 motion-reduce:animate-none" /><div className="h-6 w-52 animate-pulse rounded bg-[#151515]/10 motion-reduce:animate-none" /><div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#151515]/10 motion-reduce:animate-none" /></div><div className="h-11 w-36 animate-pulse rounded-xl bg-[#151515]/10 motion-reduce:animate-none" /></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[0, 1, 2].map((index) => <div key={index} className="h-28 animate-pulse rounded-2xl border border-[#151515]/10 bg-[#fdfcf9] motion-reduce:animate-none" />)}</div><span className="sr-only">Loading campaign action details</span></section>;
  }
  const hasResponseMilestone = applicationStatuses.some((status) => status === "interview" || status === "offer");
  const action = !hasCandidateApproval
    ? { title: copy.confirmTitle, body: copy.confirmBody, cta: copy.confirmCta, href: "#campaign-approval-title", icon: <ClipboardCheck className="size-5" /> }
    : hasResponseMilestone
      ? { title: copy.responseTitle, body: copy.responseBody, cta: copy.responseCta, href: "#recent-activity", icon: <Inbox className="size-5" /> }
      : { title: copy.reviewTitle, body: copy.reviewBody, cta: copy.reviewCta, href: "#recent-activity", icon: <ShieldCheck className="size-5" /> };

  return (
    <section aria-labelledby="campaign-action-center-title" className="group rounded-3xl border border-[#e5482a]/30 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#e5482a]/55 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:p-7" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.eyebrow}</p><h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#151515]" id="campaign-action-center-title">{copy.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{copy.body}</p></div>
        <a className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#151515] px-4 py-2.5 text-sm font-extrabold text-[#f5f2eb] shadow-sm transition-[transform,background-color,color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#e5482a] hover:text-[#151515] hover:shadow-md active:scale-[.97] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a] focus-visible:ring-offset-2" href={action.href}>{action.cta}<ArrowRight className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${isArabic ? "-scale-x-100" : ""}`} /></a>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ActionMetric icon={<ClipboardCheck className="size-4" />} label={copy.plan} value={hasCandidateApproval ? copy.approved : copy.notApproved} positive={hasCandidateApproval} />
        <ActionMetric icon={<FileCheck2 className="size-4" />} label={copy.evidence} value={copy.evidenceCount(verifiedEvidenceCount)} positive={verifiedEvidenceCount > 0} />
        <ActionMetric icon={action.icon} label={copy.next} value={action.title} positive={hasCandidateApproval} />
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#151515]/10 bg-[#f5f2eb] p-4 text-sm leading-6 text-stone-700"><span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#e5482a]/10 text-[#e5482a]">{action.icon}</span><p>{action.body}</p></div>
    </section>
  );
}

function ActionMetric({ icon, label, positive, value }: { icon: React.ReactNode; label: string; positive: boolean; value: string }) {
  return <div className="rounded-2xl border border-[#151515]/10 bg-[#fdfcf9] p-4 transition-[transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#e5482a]/40 hover:bg-white motion-reduce:transform-none motion-reduce:transition-none"><span className={`grid size-8 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none ${positive ? "bg-emerald-100 text-emerald-800" : "bg-[#e5482a]/10 text-[#e5482a]"}`}>{positive ? <CheckCircle2 className="size-4" /> : icon}</span><p className="mt-3 font-mono text-[10px] uppercase tracking-[.12em] text-stone-500">{label}</p><p className="mt-1 text-sm font-bold text-[#151515]">{value}</p></div>;
}
