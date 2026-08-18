import { BriefcaseBusiness, MapPin, Settings2, UserRoundCheck } from "lucide-react";
import React from "react";
import { Link } from "wouter";

type Approval = {
  targetRoles: string[];
  targetCity: string;
  targetIndustry: string;
  seniority: string;
  preferredLanguage: string;
  openToRemote: boolean;
  approvedAt: Date | string;
  authorizationConfirmed: boolean;
};

type Profile = {
  targetCity?: string | null;
  targetIndustry?: string | null;
  preferredSeniority?: string | null;
  preferredLanguage?: string | null;
  openToRemote?: boolean | null;
};

const useArabic = () => typeof navigator !== "undefined" && navigator.language.startsWith("ar");

export function CampaignPlanSummary({ approval, profile }: { approval?: Approval | null; profile?: Profile | null }) {
  const isArabic = useArabic();
  const copy = isArabic
    ? {
        eyebrow: "خطة حملتك المحفوظة", title: "تفضيلات الاستهداف الحالية", body: "تساعد التفضيلات الفريق على التخطيط. خطة الاستهداف المعتمدة هي التي يراجعها الفريق قبل أي تقديم.", noApproval: "لم تعتمد مسارات وظيفية بعد", noApprovalDetail: "أكمل مراجعة خطة الاستهداف لإضافة المسميات التي تريد أن يراجعها الفريق.", city: "المدينة", industry: "المجال", seniority: "المستوى", language: "لغة التواصل", remote: "العمل عن بُعد", yes: "مقبول", no: "غير محدد", edit: "تعديل التفضيلات", approved: "تمت مراجعتها بواسطتك",
      }
    : {
        eyebrow: "Your saved campaign plan", title: "Current targeting preferences", body: "These preferences help the team plan. The explicitly approved targeting plan is what the team reviews before any application activity.", noApproval: "No role lanes approved yet", noApprovalDetail: "Complete the targeting-plan review to add the role lanes you want the team to consider.", city: "City", industry: "Industry", seniority: "Seniority", language: "Communication", remote: "Remote work", yes: "Open", no: "Not selected", edit: "Edit preferences", approved: "Reviewed by you",
      };
  const items = [
    { label: copy.city, value: approval?.targetCity || profile?.targetCity || "Jeddah", icon: <MapPin className="size-3.5" /> },
    { label: copy.industry, value: approval?.targetIndustry || profile?.targetIndustry || "—", icon: <BriefcaseBusiness className="size-3.5" /> },
    { label: copy.seniority, value: approval?.seniority || profile?.preferredSeniority || "—", icon: <UserRoundCheck className="size-3.5" /> },
    { label: copy.language, value: approval?.preferredLanguage || profile?.preferredLanguage || "—", icon: <Settings2 className="size-3.5" /> },
  ];

  return (
    <section aria-label={copy.title} className="rounded-3xl border border-[#151515]/10 bg-[#fdfcf9] p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.eyebrow}</p><h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#151515]">{copy.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{copy.body}</p></div><Link href="/dashboard/settings" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#151515]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#151515] transition hover:border-[#e5482a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5482a]"><Settings2 className="size-4" /> {copy.edit}</Link></div>
      {approval?.authorizationConfirmed ? <div className="mt-5"><p className="text-xs font-bold text-emerald-800">{copy.approved}</p><div className="mt-2 flex flex-wrap gap-2">{approval.targetRoles.map((role) => <span key={role} className="rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">{role}</span>)}</div></div> : <div className="mt-5 rounded-2xl border border-dashed border-[#151515]/20 bg-white p-4"><p className="text-sm font-bold text-[#151515]">{copy.noApproval}</p><p className="mt-1 text-xs leading-5 text-stone-600">{copy.noApprovalDetail}</p></div>}
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <div key={item.label} className="rounded-2xl border border-[#151515]/10 bg-white p-3"><dt className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[.12em] text-stone-500">{item.icon}{item.label}</dt><dd className="mt-2 text-sm font-bold text-[#151515]">{item.value}</dd></div>)}<div className="rounded-2xl border border-[#151515]/10 bg-white p-3"><dt className="text-[10px] font-mono uppercase tracking-[.12em] text-stone-500">{copy.remote}</dt><dd className="mt-2 text-sm font-bold text-[#151515]">{approval?.openToRemote || profile?.openToRemote ? copy.yes : copy.no}</dd></div></dl>
    </section>
  );
}
