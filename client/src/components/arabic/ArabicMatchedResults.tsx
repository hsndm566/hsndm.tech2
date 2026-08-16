import React from "react";
import { Check, ArrowUpRight, Sparkles, Zap, MessageCircle } from "lucide-react";
import type { MatchPreferences } from "@/pages/ArabicHome";

type ScanResultType = {
  field: string;
  confidence: string;
  roles: string[];
  rationale: string;
  keySkills?: string[];
  topDomain?: string;
} | null;

export type MatchedResultsProps = {
  scanResult: ScanResultType;
  selectedSuggestedRole: string | null;
  setSelectedSuggestedRole: (role: string | null) => void;
  resetScan: () => void;
  roleLabel: (role: string) => string;
  cityLabel: (city: string) => string;
  industryLabels: Record<string, string>;
  seniorityLabel: (seniority: string) => string;
  matchPreferences: MatchPreferences;
  briefStatus: "idle" | "submitting" | "success";
  backendAvailable: boolean;
  shareArabicBrief: () => void;
  makeArabicWhatsAppHref: (roles: string[]) => string;
};

export function ArabicMatchedResults({
  scanResult,
  selectedSuggestedRole,
  setSelectedSuggestedRole,
  resetScan,
  roleLabel,
  cityLabel,
  industryLabels,
  seniorityLabel,
  matchPreferences,
  briefStatus,
  backendAvailable,
  shareArabicBrief,
  makeArabicWhatsAppHref,
}: MatchedResultsProps) {
  if (!scanResult) return null;

  return (
    <div className="role-results" role="status" aria-live="polite">
      <div className="result-heading">
        <span>
          <Check size={14} /> تم العثور على إشارات وظيفية
        </span>
        <button onClick={resetScan}>افحص سيرة أخرى</button>
      </div>
      <p>
        المسار الأنسب <b>{scanResult.field}</b> <em>{scanResult.confidence}</em>
      </p>
      <div className="role-chips" aria-label="مسارات الوظائف المقترحة">
        {scanResult.roles.map((role) => (
          <button
            type="button"
            key={role}
            className={selectedSuggestedRole === role ? "selected" : ""}
            aria-pressed={selectedSuggestedRole === role}
            onClick={() => setSelectedSuggestedRole(role)}
          >
            <span>{roleLabel(role)}</span>
            <ArrowUpRight size={13} />
          </button>
        ))}
      </div>
      {selectedSuggestedRole && (
        <p className="role-selection">
          <Check size={13} /> تم اختيار <b>{roleLabel(selectedSuggestedRole)}</b> لملخص حملتك.
        </p>
      )}
      {scanResult.keySkills && scanResult.keySkills.length > 0 ? (
        <div className="p-3 bg-black/[0.03] border border-black/10 my-3">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold mb-2 text-[#151515]">
            <Sparkles size={13} className="text-[#e5482a]" /> المهارات الأساسية المستخرجة بالذكاء الاصطناعي {scanResult.topDomain ? `(${scanResult.topDomain})` : ""}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scanResult.keySkills.map((skill) => (
              <span
                key={skill}
                title={`تتوافق مباشرة مع مسار ${scanResult.field} في السوق السعودي`}
                className="px-2 py-0.5 bg-white border border-black/15 text-xs font-mono text-[#151515] cursor-help transition-colors hover:border-[#e5482a]"
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-mono text-black/60 mt-2">مرّر مؤشر الماوس فوق المهارات لمعرفة مدى توافقها مع مسارك الوظيفي المستهدف.</p>
        </div>
      ) : (
        <div className="p-3 bg-black/[0.02] border border-black/10 my-3 text-xs font-mono text-black/70 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>المهارات الذكية غير متوفرة حالياً — مطابقة الوظائف المحلية تعمل بكامل كفاءتها.</span>
        </div>
      )}
      <div className="match-rationale">
        <b>سبب المطابقة</b>
        <span>{scanResult.rationale}</span>
      </div>
      <section className="readiness-card" aria-label="فحص جاهزية الحملة السعودية">
        <div className="readiness-heading">
          <span>
            <Zap size={14} /> جاهزية الحملة السعودية
          </span>
          <b>معاينة فقط</b>
        </div>
        <p>هذا هو الاتجاه الذي سنستخدمه لبدء محادثة حول الحملة — وليس طلب تقديم أو توقعاً لمقابلة.</p>
        <dl className="readiness-grid">
          <div>
            <dt>المدينة المستهدفة</dt>
            <dd>{cityLabel(matchPreferences.city)}</dd>
          </div>
          <div>
            <dt>المجال</dt>
            <dd>{industryLabels[matchPreferences.industry]}</dd>
          </div>
          <div>
            <dt>المستوى</dt>
            <dd>{seniorityLabel(matchPreferences.seniority)}</dd>
          </div>
          <div>
            <dt>لغة التقديم</dt>
            <dd>العربية</dd>
          </div>
        </dl>
        <div className="readiness-checklist">
          <b>جاهز للخطوة التالية</b>
          <span>
            <Check size={13} /> تمت قراءة نص السيرة محلياً
          </span>
          <span>
            <Check size={13} /> تم تحديد موقع داخل السعودية
          </span>
          <span>
            <Check size={13} /> تم تحديد مسارات وظيفية
          </span>
        </div>
        <button className="readiness-share" type="button" onClick={shareArabicBrief} disabled={briefStatus === "submitting"}>
          {briefStatus === "submitting" ? "جارٍ تجهيز ملخصك…" : "أرسل هذا الملخص إلى حسن"} <MessageCircle size={16} />
        </button>
        {briefStatus === "submitting" && (
          <div className="readiness-handoff readiness-loading" role="status" aria-live="polite">
            <span className="readiness-spinner" aria-hidden="true" />
            <span>
              <b>جارٍ تجهيز ملخص حملتك</b>
              <small>نُنشئ تحويلاً واضحاً إلى WhatsApp…</small>
            </span>
          </div>
        )}
        {briefStatus === "success" && (
          <div className="readiness-handoff readiness-success" role="status" aria-live="polite">
            <Check size={17} aria-hidden="true" />
            <span>
              <b>ملخص الحملة جاهز.</b>
              <small>تم فتح WhatsApp مع اتجاهك الوظيفي السعودي المحدد. إذا لم يُفتح، استخدم الرابط أدناه.</small>
              <a href={makeArabicWhatsAppHref(selectedSuggestedRole ? [selectedSuggestedRole] : scanResult.roles)} target="_blank" rel="noreferrer">
                فتح WhatsApp
              </a>
            </span>
          </div>
        )}
        <small>
          {backendAvailable
            ? "تُقرأ سيرتك على جهازك. يُرسل النص المستخرج إلى الذكاء الاصطناعي لهذا الملخص لمرة واحدة فقط؛ لا يُحفظ ملف السيرة أو نصها."
            : "تُقرأ سيرتك على جهازك. لا يتم إرسال ملف السيرة أو نصها في هذه المعاينة الثابتة."}
        </small>
      </section>
    </div>
  );
}
