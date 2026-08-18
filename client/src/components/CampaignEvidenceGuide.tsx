import { CheckCircle2, Clock3, FileCheck2, MailCheck, ShieldCheck } from "lucide-react";
import React from "react";

type Props = {
  verifiedEvidenceCount: number;
  hasCandidateApproval: boolean;
};

const useArabic = () => typeof navigator !== "undefined" && navigator.language.startsWith("ar");

export function CampaignEvidenceGuide({ hasCandidateApproval, verifiedEvidenceCount }: Props) {
  const isArabic = useArabic();
  const copy = isArabic
    ? {
        eyebrow: "دليل الإثبات", title: "ما الذي يُحتسب كطلب موثّق؟", body: "لا نعدّ الملاحظات أو التحضيرات دليلاً على الإرسال. يُحتسب الدليل فقط بعد تسجيل أحد التأكيدات أدناه.", portal: "تأكيد من البوابة", portalDetail: "تأكيد ظاهر من نظام التقديم.", email: "قبول عبر البريد", emailDetail: "تأكيد قبول الإرسال عبر البريد.", employer: "تأكيد من جهة التوظيف", employerDetail: "تأكيد من الجهة المستلمة عند توفره.", count: "إثباتات موثّقة", launchEyebrow: "حالة بدء الحملة", awaitingApproval: "بانتظار موافقتك على الاستهداف", awaitingApprovalDetail: "راجع المسميات والمدينة والمجال قبل أن يبدأ الفريق مراجعة الخطة.", awaitingReview: "خطة الاستهداف بانتظار مراجعة الفريق", awaitingReviewDetail: "حفظ موافقتك لا يرسل طلبات توظيف تلقائياً. يراجع الفريق الخطة أولاً.", noPromise: "لا تُعرض سعة عامة أو موعد بدء حتى يتم تأكيد الخطة لك.",
      }
    : {
        eyebrow: "Evidence guide", title: "What counts as a verified application?", body: "Preparation notes and activity updates are not counted as submission proof. Proof is counted only after one of the confirmations below is recorded.", portal: "Portal confirmation", portalDetail: "A visible confirmation from the application portal.", email: "Email accepted", emailDetail: "Acceptance confirmation for an email submission.", employer: "Employer confirmation", employerDetail: "A confirmation from the receiving employer when available.", count: "Verified evidence", launchEyebrow: "Campaign launch status", awaitingApproval: "Your targeting approval is needed", awaitingApprovalDetail: "Review the role lanes, city, and industry before the team reviews a plan.", awaitingReview: "Your targeting plan is awaiting team review", awaitingReviewDetail: "Saving your approval does not submit applications automatically. The team reviews the plan first.", noPromise: "Capacity and a launch date are not shown until the plan is confirmed with you.",
      };
  const launchTitle = hasCandidateApproval ? copy.awaitingReview : copy.awaitingApproval;
  const launchDetail = hasCandidateApproval ? copy.awaitingReviewDetail : copy.awaitingApprovalDetail;
  const confirmationTypes = [
    { icon: <FileCheck2 className="size-4" />, title: copy.portal, detail: copy.portalDetail },
    { icon: <MailCheck className="size-4" />, title: copy.email, detail: copy.emailDetail },
    { icon: <CheckCircle2 className="size-4" />, title: copy.employer, detail: copy.employerDetail },
  ];

  return (
    <section aria-label={copy.title} className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <article className="rounded-3xl border border-[#151515]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.eyebrow}</p><h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#151515]">{copy.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{copy.body}</p></div><ShieldCheck className="size-6 shrink-0 text-[#e5482a]" aria-hidden="true" /></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">{confirmationTypes.map((item) => <div key={item.title} className="rounded-2xl border border-[#151515]/10 bg-[#fdfcf9] p-4"><span className="grid size-8 place-items-center rounded-lg bg-[#e5482a]/10 text-[#e5482a]">{item.icon}</span><h3 className="mt-3 text-sm font-bold text-[#151515]">{item.title}</h3><p className="mt-1 text-xs leading-5 text-stone-600">{item.detail}</p></div>)}</div>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"><CheckCircle2 className="size-3.5" /> {verifiedEvidenceCount} {copy.count}</p>
      </article>
      <aside className="rounded-3xl border border-[#e5482a]/30 bg-[#e8e5de] p-5 shadow-sm sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.launchEyebrow}</p>
        <div className="mt-4 flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#e5482a]/25 bg-[#e5482a]/10 text-[#e5482a]"><Clock3 className="size-4" /></span><div><h2 className="text-base font-extrabold tracking-tight text-[#151515]">{launchTitle}</h2><p className="mt-2 text-sm leading-6 text-stone-700">{launchDetail}</p></div></div>
        <p className="mt-5 border-t border-[#151515]/15 pt-4 text-xs leading-5 text-stone-600">{copy.noPromise}</p>
      </aside>
    </section>
  );
}
