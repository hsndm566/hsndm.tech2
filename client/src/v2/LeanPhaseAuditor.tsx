import { CheckCircle2, CircleDashed, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { Application, Profile } from "./data";
import { useLocale } from "./locale";

export type LeanPhaseStatus = "passed" | "active" | "locked";

export type LeanAudit = {
  phases: Array<{ id: 1 | 2 | 3 | 4 | 5; status: LeanPhaseStatus; passed: boolean }>;
  currentPhase: 1 | 2 | 3 | 4 | 5;
  canTrack: boolean;
  canSend: boolean;
  sentCount: number;
  complete: boolean;
};

type AuditInput = {
  profile?: Partial<Profile> | null;
  applications: Array<Pick<Application, "status" | "appliedAt">>;
  backendOk: boolean;
};

export function auditLeanPhases({ profile, applications, backendOk }: AuditInput): LeanAudit {
  const sentCount = applications.filter((row) => row.status === "applied" || Boolean(row.appliedAt)).length;
  const checks = [
    Boolean(profile?.fullName && profile?.targetCity && profile?.targetIndustry && profile?.resumeFileName),
    applications.length > 0,
    backendOk,
    sentCount >= 1,
    sentCount >= 5,
  ];

  const phases = checks.map((check, index) => {
    const previousPassed = checks.slice(0, index).every(Boolean);
    const passed = previousPassed && check;
    return {
      id: (index + 1) as 1 | 2 | 3 | 4 | 5,
      passed,
      status: passed ? "passed" as const : previousPassed ? "active" as const : "locked" as const,
    };
  });

  const active = phases.find((phase) => phase.status === "active");

  return {
    phases,
    currentPhase: active?.id ?? 5,
    canTrack: phases[0].passed,
    canSend: phases[2].passed,
    sentCount,
    complete: phases[4].passed,
  };
}

export function LeanPhaseAuditor({
  profile,
  applications,
  backendOk,
}: AuditInput) {
  const { t, path } = useLocale();
  const audit = auditLeanPhases({ profile, applications, backendOk });

  const copy = [
    {
      title: t("Phase 1 · MVP ready", "المرحلة ١ · جاهزية الحد الأدنى"),
      requirement: t("Name, target city, target role and CV signal must exist.", "يجب توفر الاسم والمدينة والمسمى المستهدف وإشارة السيرة."),
      evidence: audit.phases[0].passed
        ? t("Auditor passed the candidate foundation.", "اجتاز المدقق أساس ملف المرشح.")
        : t("Complete the profile and add a readable CV before moving on.", "أكمل الملف وأضف سيرة مقروءة قبل الانتقال."),
    },
    {
      title: t("Phase 2 · Real opportunity", "المرحلة ٢ · فرصة حقيقية"),
      requirement: t("Track at least one job you would genuinely apply to.", "سجّل وظيفة واحدة على الأقل تنوي التقديم عليها فعلياً."),
      evidence: t(`${applications.length} tracked opportunit${applications.length === 1 ? "y" : "ies"}.`, `تم تسجيل ${applications.length} فرصة.`),
    },
    {
      title: t("Phase 3 · Delivery path", "المرحلة ٣ · مسار الإرسال"),
      requirement: t("The application backend must pass its health check.", "يجب أن يجتاز خادم التقديم فحص الصحة."),
      evidence: backendOk ? t("Backend health check passed.", "اجتاز الخادم فحص الصحة.") : t("Backend health check has not passed yet.", "لم يجتز الخادم فحص الصحة بعد."),
    },
    {
      title: t("Phase 4 · First validated application", "المرحلة ٤ · أول طلب موثّق"),
      requirement: t("Send one reviewed application and record it successfully.", "أرسل طلباً تمت مراجعته وسجّله بنجاح."),
      evidence: t(`${audit.sentCount} application${audit.sentCount === 1 ? "" : "s"} sent and recorded.`, `تم إرسال وتسجيل ${audit.sentCount} طلب.`),
    },
    {
      title: t("Phase 5 · Small batch", "المرحلة ٥ · دفعة صغيرة"),
      requirement: t("Reach five sent applications, then inspect delivery and response data before scaling.", "أكمل خمسة طلبات ثم افحص بيانات التسليم والردود قبل التوسع."),
      evidence: t(`${Math.min(audit.sentCount, 5)}/5 applications in the first batch.`, `${Math.min(audit.sentCount, 5)}/5 طلبات في الدفعة الأولى.`),
    },
  ];

  const nextAction = {
    1: t("Finish your profile and CV signal.", "أكمل ملفك وإشارة السيرة."),
    2: t("Save one real opportunity using Track a job.", "احفظ فرصة حقيقية واحدة من زر أضف وظيفة."),
    3: t("Do not advance until the backend health check passes.", "لا تنتقل قبل نجاح فحص الخادم."),
    4: t("Send one reviewed application and verify that it appears in the tracker.", "أرسل طلباً تمت مراجعته وتأكد من ظهوره في السجل."),
    5: audit.complete
      ? t("Batch passed. Review outcomes before increasing volume.", "اجتازت الدفعة الفحص. راجع النتائج قبل زيادة الحجم.")
      : t("Continue only until the first five-application batch is complete.", "استمر فقط حتى تكتمل أول دفعة من خمسة طلبات."),
  }[audit.currentPhase];

  return (
    <section className="lean-auditor" aria-label={t("Lean phase auditor", "مدقق مراحل لين")}>
      <div className="lean-auditor-head">
        <div>
          <span className="section-label">{t("LEAN AUDITOR", "مدقق لين")}</span>
          <h2>{t("One phase must pass before the next one opens.", "يجب أن تجتاز كل مرحلة الفحص قبل فتح التالية.")}</h2>
          <p>{t("The auditor uses stored profile data, application records and backend health. It does not accept self-reported completion.", "يعتمد المدقق على بيانات الملف وسجل الطلبات وصحة الخادم. لا يعتمد على تأكيد يدوي.")}</p>
        </div>
        <span className={audit.complete ? "auditor-verdict passed" : "auditor-verdict"}>
          <ShieldCheck size={16} />
          {audit.complete ? t("FIRST BATCH PASSED", "اجتازت الدفعة الأولى") : t(`PHASE ${audit.currentPhase} ACTIVE`, `المرحلة ${audit.currentPhase} نشطة`)}
        </span>
      </div>

      <div className="lean-phase-list">
        {audit.phases.map((phase, index) => {
          const item = copy[index];
          const Icon = phase.status === "passed" ? CheckCircle2 : phase.status === "locked" ? LockKeyhole : CircleDashed;
          return (
            <article key={phase.id} className={`lean-phase ${phase.status}`}>
              <div className="lean-phase-title">
                <Icon size={18} />
                <strong>{item.title}</strong>
                <span>{phase.status === "passed" ? t("Passed", "اجتازت") : phase.status === "active" ? t("Active", "نشطة") : t("Locked", "مقفلة")}</span>
              </div>
              <p>{item.requirement}</p>
              <small>{item.evidence}</small>
            </article>
          );
        })}
      </div>

      <div className="lean-next-action">
        <div>
          <strong>{t("Auditor next action", "الإجراء التالي من المدقق")}</strong>
          <p>{nextAction}</p>
        </div>
        {audit.currentPhase === 1 && <Link className="button small" href={path("/settings")}>{t("Complete phase 1", "أكمل المرحلة ١")}</Link>}
      </div>
    </section>
  );
}
