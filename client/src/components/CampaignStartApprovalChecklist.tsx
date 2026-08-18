import { CheckCircle2, ShieldCheck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { saudiCities } from "@/lib/saudiTaxonomy";

export type CampaignApprovalDraft = {
  targetRoles: string[];
  targetCity: string;
  targetIndustry: string;
  seniority: "Entry level" | "Mid-level" | "Senior" | "Leadership";
  preferredLanguage: "English" | "Arabic";
  openToRemote: boolean;
  authorizationConfirmed: true;
};

type CampaignProfileDefaults = Omit<CampaignApprovalDraft, "targetRoles" | "authorizationConfirmed">;

type ExistingApproval = {
  targetRoles: string[];
  targetCity: string;
  targetIndustry: string;
  seniority: string;
  preferredLanguage: string;
  openToRemote: boolean;
  authorizationConfirmed: boolean;
  approvedAt: Date | string;
};

type Props = {
  isArabic: boolean;
  defaults: CampaignProfileDefaults;
  approval?: ExistingApproval | null;
  isLoading?: boolean;
  isPending?: boolean;
  onConfirm?: (draft: CampaignApprovalDraft) => void;
};

const defaultRoles = (approval?: ExistingApproval | null) => approval?.targetRoles.join(", ") ?? "";
const normalizeSeniority = (value: string | undefined, fallback: CampaignApprovalDraft["seniority"]): CampaignApprovalDraft["seniority"] => ["Entry level", "Mid-level", "Senior", "Leadership"].includes(value ?? "") ? value as CampaignApprovalDraft["seniority"] : fallback;
const normalizeLanguage = (value: string | undefined, fallback: CampaignApprovalDraft["preferredLanguage"]): CampaignApprovalDraft["preferredLanguage"] => value === "Arabic" || value === "English" ? value : fallback;

export function CampaignStartApprovalChecklist({ approval, defaults, isArabic, isLoading = false, isPending = false, onConfirm }: Props) {
  const [roles, setRoles] = useState(() => defaultRoles(approval));
  const [city, setCity] = useState(approval?.targetCity ?? defaults.targetCity);
  const [industry, setIndustry] = useState(approval?.targetIndustry ?? defaults.targetIndustry);
  const [seniority, setSeniority] = useState<CampaignApprovalDraft["seniority"]>(normalizeSeniority(approval?.seniority, defaults.seniority));
  const [language, setLanguage] = useState<CampaignApprovalDraft["preferredLanguage"]>(normalizeLanguage(approval?.preferredLanguage, defaults.preferredLanguage));
  const [remote, setRemote] = useState(approval?.openToRemote ?? defaults.openToRemote);
  const [consent, setConsent] = useState(Boolean(approval?.authorizationConfirmed));

  useEffect(() => {
    setRoles(defaultRoles(approval));
    setCity(approval?.targetCity ?? defaults.targetCity);
    setIndustry(approval?.targetIndustry ?? defaults.targetIndustry);
    setSeniority(normalizeSeniority(approval?.seniority, defaults.seniority));
    setLanguage(normalizeLanguage(approval?.preferredLanguage, defaults.preferredLanguage));
    setRemote(approval?.openToRemote ?? defaults.openToRemote);
    setConsent(Boolean(approval?.authorizationConfirmed));
  }, [approval, defaults]);

  const roleList = useMemo(() => roles.split(",").map((role) => role.trim()).filter(Boolean).slice(0, 5), [roles]);
  const canConfirm = roleList.length > 0 && consent && Boolean(onConfirm) && !isPending;
  const copy = isArabic
    ? {
        eyebrow: "خطوة قبل البدء", title: "راجع خطة الاستهداف ووافق عليها", body: "لن يتم إرسال أي طلب توظيف عند حفظ هذه الخطوة. يراجع الفريق الخطة أولاً، ويمكنك تعديل تفضيلاتك لاحقاً.", roles: "المسميات أو مسارات الوظائف المستهدفة", rolesHint: "افصل بين المسميات بفاصلة، حتى 5 مسارات.", city: "المدينة المستهدفة", industry: "المجال المستهدف", seniority: "المستوى الوظيفي", language: "لغة التواصل", remote: "منفتح على فرص العمل عن بُعد", consent: "أؤكد أن هذه هي المسميات والمدينة والمجال التي أريد من الفريق مراجعتها. لا يعني ذلك تقديم طلبات توظيف تلقائياً.", save: "تأكيد خطة الاستهداف", saved: "تم حفظ موافقتك الأخيرة", waiting: "يتم تحميل خطتك...", noRoles: "أضف مساراً وظيفياً واحداً على الأقل للمراجعة.", english: "الإنجليزية", arabic: "العربية",
      }
    : {
        eyebrow: "Before your campaign starts", title: "Review and approve your targeting plan", body: "Saving this step does not submit any job application. Our team reviews the plan first, and you can update your preferences later.", roles: "Target job titles or role lanes", rolesHint: "Separate titles with commas, up to five lanes.", city: "Target Saudi city", industry: "Target industry", seniority: "Seniority", language: "Communication language", remote: "Open to remote opportunities", consent: "I confirm these are the roles, city, and industry I want the team to review. This does not authorize automatic job submissions.", save: "Confirm targeting plan", saved: "Your latest approval is saved", waiting: "Loading your plan...", noRoles: "Add at least one role lane for review.", english: "English", arabic: "Arabic",
      };

  return (
    <section aria-labelledby="campaign-approval-title" className="mt-7 rounded-3xl border border-[#e5482a]/30 bg-white p-5 shadow-[0_12px_35px_rgba(21,21,21,.07)] sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b82c20]">{copy.eyebrow}</p>
          <h2 id="campaign-approval-title" className="mt-2 text-xl font-extrabold tracking-tight text-[#151515]">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{copy.body}</p>
        </div>
        {approval ? <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"><CheckCircle2 className="size-3.5" /> {copy.saved}</span> : <ShieldCheck className="size-6 shrink-0 text-[#e5482a]" aria-hidden="true" />}
      </div>

      {isLoading ? <p className="mt-6 text-sm text-stone-500">{copy.waiting}</p> : <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); if (canConfirm) onConfirm?.({ targetRoles: roleList, targetCity: city, targetIndustry: industry, seniority, preferredLanguage: language, openToRemote: remote, authorizationConfirmed: true }); }}>
        <label className="space-y-2 sm:col-span-2"><span className="text-sm font-bold text-[#151515]">{copy.roles}</span><input value={roles} onChange={(event) => setRoles(event.target.value)} maxLength={500} placeholder={isArabic ? "مثل: محلل بيانات، أخصائي عمليات" : "For example: Data Analyst, Operations Specialist"} className="w-full rounded-xl border border-[#151515]/20 bg-[#fdfcf9] px-3 py-2.5 text-sm outline-none transition focus:border-[#e5482a] focus:ring-2 focus:ring-[#e5482a]/20" /><span className="block text-xs text-stone-500">{roleList.length > 0 ? `${roleList.length}/5` : copy.rolesHint}</span></label>
        <label className="space-y-2"><span className="text-sm font-bold text-[#151515]">{copy.city}</span><select value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-xl border border-[#151515]/20 bg-[#fdfcf9] px-3 py-2.5 text-sm outline-none transition focus:border-[#e5482a] focus:ring-2 focus:ring-[#e5482a]/20">{saudiCities.map((item) => <option key={item.en} value={item.en}>{item.en}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm font-bold text-[#151515]">{copy.industry}</span><input value={industry} onChange={(event) => setIndustry(event.target.value)} maxLength={100} className="w-full rounded-xl border border-[#151515]/20 bg-[#fdfcf9] px-3 py-2.5 text-sm outline-none transition focus:border-[#e5482a] focus:ring-2 focus:ring-[#e5482a]/20" /></label>
        <label className="space-y-2"><span className="text-sm font-bold text-[#151515]">{copy.seniority}</span><select value={seniority} onChange={(event) => setSeniority(event.target.value as CampaignApprovalDraft["seniority"])} className="w-full rounded-xl border border-[#151515]/20 bg-[#fdfcf9] px-3 py-2.5 text-sm outline-none transition focus:border-[#e5482a] focus:ring-2 focus:ring-[#e5482a]/20"><option value="Entry level">Entry level</option><option value="Mid-level">Mid-level</option><option value="Senior">Senior</option><option value="Leadership">Leadership</option></select></label>
        <label className="space-y-2"><span className="text-sm font-bold text-[#151515]">{copy.language}</span><select value={language} onChange={(event) => setLanguage(event.target.value as CampaignApprovalDraft["preferredLanguage"])} className="w-full rounded-xl border border-[#151515]/20 bg-[#fdfcf9] px-3 py-2.5 text-sm outline-none transition focus:border-[#e5482a] focus:ring-2 focus:ring-[#e5482a]/20"><option value="English">{copy.english}</option><option value="Arabic">{copy.arabic}</option></select></label>
        <label className="flex items-center gap-3 rounded-xl border border-[#151515]/15 bg-[#fdfcf9] p-3 text-sm font-medium text-[#151515] sm:col-span-2"><input checked={remote} onChange={(event) => setRemote(event.target.checked)} type="checkbox" className="size-4 accent-[#e5482a]" />{copy.remote}</label>
        <label className="flex gap-3 rounded-xl border border-[#e5482a]/30 bg-[#e5482a]/5 p-4 text-sm leading-6 text-[#151515] sm:col-span-2"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" className="mt-1 size-4 shrink-0 accent-[#e5482a]" /><span>{copy.consent}</span></label>
        {!roleList.length ? <p className="text-xs font-medium text-[#b82c20] sm:col-span-2">{copy.noRoles}</p> : null}
        <div className="sm:col-span-2"><button disabled={!canConfirm} type="submit" className="inline-flex w-full items-center justify-center rounded-xl bg-[#151515] px-5 py-3 text-sm font-extrabold text-[#f5f2eb] transition hover:bg-[#e5482a] hover:text-[#151515] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{isPending ? "…" : copy.save}</button></div>
      </form>}
    </section>
  );
}
