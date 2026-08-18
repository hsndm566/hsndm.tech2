import { ArrowUpDown, CheckCircle2, ClipboardCheck, FileCheck2, Inbox, ListFilter, ShieldCheck } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatSafeDate, safeTimestampMs } from "@/lib/safeTimestamp";

type Application = { id: number; companyName: string; roleTitle: string; status: string; updatedAt?: Date | string | null; createdAt?: Date | string | null };
type Category = "candidate_action" | "team_review" | "evidence" | "response" | "tracked";
type BoardItem = { id: string; category: Category; title: string; detail: string; date?: Date | string | null; priority: number };
export type CampaignBoardFilter = "all" | "candidate_action" | "team_review" | "evidence" | "updates";
export type CampaignBoardSort = "priority" | "recent" | "type";

type Props = { applications?: Application[]; hasCandidateApproval: boolean; isArabic?: boolean; verifiedEvidenceCount: number; isLoading?: boolean };

type Copy = {
  eyebrow: string; title: string; body: string; filter: string; sort: string; all: string; candidateAction: string; teamReview: string; evidence: string; updates: string; priority: string; recent: string; type: string; empty: string; planNeedsReview: string; planNeedsReviewDetail: string; planInReview: string; planInReviewDetail: string; evidenceRecorded: (count: number) => string; evidenceNone: string; evidenceDetail: string; responseDetail: string; trackedDetail: string; response: string; tracked: string; dateUnavailable: string; stage: string;
};

const english: Copy = {
  eyebrow: "Stage 7 · Campaign management", title: "Campaign action board", body: "Filter and sort only the saved plan, recorded evidence, and tracked job entries available to your account.", filter: "Filter items", sort: "Sort items", all: "All items", candidateAction: "Needs your review", teamReview: "Team review", evidence: "Evidence", updates: "Tracked updates", priority: "Priority", recent: "Most recent", type: "Item type", empty: "No items match this view yet.", planNeedsReview: "Review targeting plan", planNeedsReviewDetail: "Your plan still needs your explicit approval. Saving it does not submit applications.", planInReview: "Targeting plan saved for team review", planInReviewDetail: "The team reviews your approved plan before any application activity.", evidenceRecorded: (count) => `${count} verified evidence record${count === 1 ? "" : "s"}`, evidenceNone: "No verified evidence recorded yet", evidenceDetail: "Only portal, email-acceptance, or employer confirmations count here.", responseDetail: "This tracked application has an interview or offer milestone.", trackedDetail: "This is a tracked job entry, not automatic proof of submission.", response: "Response milestone", tracked: "Tracked application", dateUnavailable: "Date unavailable", stage: "Campaign status", 
};

const arabic: Copy = {
  eyebrow: "المرحلة ٧ · إدارة الحملة", title: "لوحة إجراءات الحملة", body: "صفِّ ورتِّب فقط خطة الاستهداف المحفوظة والإثباتات المسجلة وطلبات التوظيف المتتبعة المتاحة لحسابك.", filter: "تصفية العناصر", sort: "ترتيب العناصر", all: "كل العناصر", candidateAction: "تحتاج إلى مراجعتك", teamReview: "مراجعة الفريق", evidence: "الإثباتات", updates: "التحديثات المتتبعة", priority: "الأولوية", recent: "الأحدث", type: "نوع العنصر", empty: "لا توجد عناصر مطابقة لهذا العرض بعد.", planNeedsReview: "راجع خطة الاستهداف", planNeedsReviewDetail: "لا تزال خطتك تحتاج إلى موافقتك الصريحة. حفظها لا يرسل طلبات توظيف.", planInReview: "خطة الاستهداف محفوظة لمراجعة الفريق", planInReviewDetail: "يراجع الفريق خطتك المعتمدة قبل أي نشاط للتقديم.", evidenceRecorded: (count) => `${count} إثبات موثّق مسجّل`, evidenceNone: "لا يوجد إثبات موثق مسجّل بعد", evidenceDetail: "يُحتسب هنا فقط تأكيد البوابة أو قبول البريد أو تأكيد جهة التوظيف.", responseDetail: "يوجد لهذا الطلب المتتبع مرحلة مقابلة أو عرض.", trackedDetail: "هذا سجل طلب متتبع وليس إثباتاً تلقائياً للإرسال.", response: "مرحلة استجابة", tracked: "طلب متتبع", dateUnavailable: "التاريخ غير متاح", stage: "حالة الحملة",
};

const categoryOrder: Record<Category, number> = { candidate_action: 0, response: 1, team_review: 2, evidence: 3, tracked: 4 };

export function filterAndSortCampaignItems(items: BoardItem[], filter: CampaignBoardFilter, sort: CampaignBoardSort) {
  return items.filter((item) => filter === "all" || (filter === "updates" ? item.category === "response" || item.category === "tracked" : item.category === filter)).sort((left, right) => {
    if (sort === "recent") return safeTimestampMs(right.date) - safeTimestampMs(left.date) || left.priority - right.priority;
    if (sort === "type") return categoryOrder[left.category] - categoryOrder[right.category] || left.title.localeCompare(right.title);
    return left.priority - right.priority || safeTimestampMs(right.date) - safeTimestampMs(left.date);
  });
}

export function CampaignManagementBoard({ applications = [], hasCandidateApproval, isArabic = false, isLoading = false, verifiedEvidenceCount }: Props) {
  const copy = isArabic ? arabic : english;
  const [filter, setFilter] = useState<CampaignBoardFilter>("all");
  const [sort, setSort] = useState<CampaignBoardSort>("priority");
  const items = useMemo<BoardItem[]>(() => {
    const plan: BoardItem = hasCandidateApproval
      ? { id: "targeting-plan", category: "team_review", title: copy.planInReview, detail: copy.planInReviewDetail, priority: 2 }
      : { id: "targeting-plan", category: "candidate_action", title: copy.planNeedsReview, detail: copy.planNeedsReviewDetail, priority: 0 };
    const evidence: BoardItem = { id: "evidence", category: "evidence", title: verifiedEvidenceCount > 0 ? copy.evidenceRecorded(verifiedEvidenceCount) : copy.evidenceNone, detail: copy.evidenceDetail, priority: verifiedEvidenceCount > 0 ? 3 : 1 };
    const applicationItems = applications.map<BoardItem>((application) => {
      const isResponse = application.status === "interview" || application.status === "offer";
      return { id: `application-${application.id}`, category: isResponse ? "response" : "tracked", title: `${application.roleTitle} · ${application.companyName}`, detail: isResponse ? copy.responseDetail : copy.trackedDetail, date: application.updatedAt || application.createdAt, priority: isResponse ? 1 : 4 };
    });
    return [plan, evidence, ...applicationItems];
  }, [applications, copy, hasCandidateApproval, verifiedEvidenceCount]);
  const displayed = useMemo(() => filterAndSortCampaignItems(items, filter, sort), [filter, items, sort]);
  if (isLoading) return <section aria-busy="true" aria-label={copy.title} className="rounded-3xl border border-[#151515]/10 bg-white p-5 shadow-sm sm:p-7"><div className="h-3 w-32 animate-pulse rounded bg-[#e5482a]/15 motion-reduce:animate-none" /><div className="mt-3 h-6 w-64 max-w-full animate-pulse rounded bg-[#151515]/10 motion-reduce:animate-none" /><div className="mt-6 space-y-3">{[0, 1, 2].map((index) => <div key={index} className="h-20 animate-pulse rounded-2xl border border-[#151515]/10 bg-[#fdfcf9] motion-reduce:animate-none" />)}</div><span className="sr-only">Loading campaign management items</span></section>;

  return <section aria-labelledby="campaign-management-board-title" className="rounded-3xl border border-[#151515]/10 bg-white p-5 shadow-sm sm:p-7" dir={isArabic ? "rtl" : "ltr"}>
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.eyebrow}</p><h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#151515]" id="campaign-management-board-title">{copy.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{copy.body}</p></div><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-bold text-stone-600"><span className="flex items-center gap-1.5"><ListFilter className="size-3.5" />{copy.filter}</span><Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}><SelectTrigger className="min-h-10 w-full bg-[#fdfcf9] text-[#151515]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{copy.all}</SelectItem><SelectItem value="candidate_action">{copy.candidateAction}</SelectItem><SelectItem value="team_review">{copy.teamReview}</SelectItem><SelectItem value="evidence">{copy.evidence}</SelectItem><SelectItem value="updates">{copy.updates}</SelectItem></SelectContent></Select></label><label className="grid gap-1.5 text-xs font-bold text-stone-600"><span className="flex items-center gap-1.5"><ArrowUpDown className="size-3.5" />{copy.sort}</span><Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}><SelectTrigger className="min-h-10 w-full bg-[#fdfcf9] text-[#151515]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="priority">{copy.priority}</SelectItem><SelectItem value="recent">{copy.recent}</SelectItem><SelectItem value="type">{copy.type}</SelectItem></SelectContent></Select></label></div></div>
    <div className="mt-6 divide-y divide-[#151515]/10 overflow-hidden rounded-2xl border border-[#151515]/10 bg-[#fdfcf9]">{displayed.length === 0 ? <p className="px-4 py-8 text-center text-sm text-stone-600">{copy.empty}</p> : displayed.map((item) => <BoardRow copy={copy} item={item} key={item.id} />)}</div>
  </section>;
}

function BoardRow({ copy, item }: { copy: Copy; item: BoardItem }) {
  const icon = item.category === "candidate_action" ? <ClipboardCheck className="size-4" /> : item.category === "team_review" ? <ShieldCheck className="size-4" /> : item.category === "evidence" ? <FileCheck2 className="size-4" /> : item.category === "response" ? <Inbox className="size-4" /> : <CheckCircle2 className="size-4" />;
  const dateLabel = safeTimestampMs(item.date) ? formatSafeDate(item.date) : copy.dateUnavailable;
  return <article className="group flex gap-3 p-4 transition-colors duration-200 hover:bg-white motion-reduce:transition-none"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e5482a]/10 text-[#e5482a] transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">{icon}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#151515]">{item.title}</p><p className="mt-1 text-xs leading-5 text-stone-600">{item.detail}</p></div>{item.date ? <time className="shrink-0 text-[10px] font-mono text-stone-500">{dateLabel}</time> : <span className="shrink-0 text-[10px] font-mono uppercase tracking-[.1em] text-stone-500">{copy.stage}</span>}</article>;
}
