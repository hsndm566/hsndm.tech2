import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LogOut,
  MailCheck,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { trackEngagement } from "@/lib/analytics";
import { CvUpload, clearCvDraft, cvDraft } from "./CvUpload";
import { sendApplicationEmail, useApplicationDeliveryReadiness, useBackendHealth, useRecommendedJobs, type RecommendedJob } from "./backend";
import { type Application, saudiWeekStart, useWorkspaceData } from "./data";
import { cities, useLocale } from "./locale";
import { supabase, useSession } from "./auth";
import { LeanPhaseAuditor } from "./LeanPhaseAuditor";

export function SessionGate({ children }: { children: ReactNode }) {
  const { session, loading, error } = useSession();
  const { t, path } = useLocale();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !session && supabase && !error) navigate(path("/sign-in"));
  }, [loading, session, error, path, navigate]);

  if (loading) return <State title={t("Opening your workspace…", "جارٍ فتح مساحة العمل…")} />;
  if (!supabase || error) return <State title={t("Account service is unavailable", "خدمة الحسابات غير متاحة")} detail={t("Your session could not be opened. Please try again.", "تعذّر فتح جلستك. يرجى المحاولة مجدداً.")} retry />;
  if (!session) return <State title={t("Redirecting to sign in…", "جارٍ الانتقال لتسجيل الدخول…")} />;
  return <>{children}</>;
}

export function State({ title, detail, retry }: { title: string; detail?: string; retry?: boolean }) {
  const { t, path } = useLocale();
  return (
    <main className="state wrap">
      <FileText size={36} />
      <h1>{title}</h1>
      <p>{detail}</p>
      {retry && <button className="button" onClick={() => location.reload()}>{t("Retry", "إعادة المحاولة")}</button>}
      <Link href={path("/")}>{t("Back to home", "العودة للرئيسية")}</Link>
    </main>
  );
}

export function Workspace() {
  const { t, path } = useLocale();
  const [route, navigate] = useLocation();
  const { profile, apps, create, update, claimAccess, clear } = useWorkspaceData();
  const backend = useBackendHealth();
  const delivery = useApplicationDeliveryReadiness();
  const jobs = useRecommendedJobs({ city: profile.data?.targetCity, role: profile.data?.targetRole || profile.data?.targetIndustry });
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);

  useEffect(() => {
    if (profile.data?.fullName && route.endsWith("/auth/callback")) navigate(path("/dashboard"));
  }, [profile.data, route, navigate, path]);

  if (profile.isLoading) return <State title={t("Loading your workspace…", "جارٍ تحميل مساحة العمل…")} />;
  if (profile.isError) return <State title={t("Your account is signed in. Your workspace is not available yet.", "تم تسجيل دخولك، لكن مساحة العمل غير متاحة بعد.")} detail={t("We could not reach your profile service. Please try again shortly.", "تعذّر الوصول إلى خدمة ملفك. حاول مجدداً لاحقاً.")} retry />;
  const normalizedRoute = route.replace(/\/+$/, "") || "/";
  if (normalizedRoute.endsWith("/onboarding") || normalizedRoute.endsWith("/settings")) return <ProfileForm existing={profile.data} settings={normalizedRoute.endsWith("/settings")} />;
  if (profile.isSuccess && !profile.data?.fullName) return <CandidateAccess claimAccess={claimAccess} />;

  const rows = apps.data ?? [];
  const weekly = rows.filter((row) => row.appliedAt && new Date(row.appliedAt) >= saudiWeekStart()).length;
  const delivered = rows.filter((row) => row.deliveryStatus === "delivered").length;
  const needsAttention = rows.filter((row) => row.responseStatus === "action_required" || ["deferred","hard_bounce","soft_bounce","blocked"].includes(row.deliveryStatus || "")).length;
  const completed = [profile.data?.fullName, profile.data?.targetCity, profile.data?.targetRole, profile.data?.targetIndustry, profile.data?.experienceLevel, profile.data?.resumeStoragePath].filter(Boolean).length;

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    create.mutate({ companyName: String(form.get("company")), roleTitle: String(form.get("role")), city: String(form.get("city")) }, {
      onSuccess: () => {
        setAdding(false);
        trackEngagement("application_saved", { city: String(form.get("city")) });
      },
      onError: () => {
        setMessage(t("Could not save. Try again.", "تعذّر الحفظ. حاول مجدداً."));
        trackEngagement("application_save_failed", { reason: "supabase" });
      },
    });
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedJob) {
      setMessage(t("Choose a verified job before sending.", "اختر وظيفة موثقة قبل الإرسال."));
      return;
    }
    if (!profile.data?.resumeStoragePath) {
      setMessage(t("Upload and save your original CV before sending.", "ارفع ملف سيرتك الأصلي واحفظه قبل الإرسال."));
      return;
    }
    if (!profile.data?.targetRole || !profile.data?.targetIndustry || !profile.data?.experienceLevel) {
      setMessage(t("Complete your role, industry, and experience preferences first.", "أكمل المسمى والمجال ومستوى الخبرة أولاً."));
      return;
    }

    setSending(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const result = await sendApplicationEmail({
        toEmail: String(form.get("recipientEmail")),
        jobId: selectedJob.id,
      });

      if (!result.ok) {
        const failureCopy: Record<string, string> = {
          "brevo-not-configured": t("Email delivery is not configured on the backend.", "خدمة إرسال البريد غير مهيأة على الخادم."),
          "brevo-missing-message-id": t("The provider did not return submission evidence, so this was not marked sent.", "لم يُرجع مزود البريد دليلاً على الإرسال، لذلك لم يُسجل الطلب كمرسل."),
          "duplicate-application": t("This verified job is already in your application history.", "هذه الوظيفة الموثقة موجودة بالفعل في سجل طلباتك."),
          "cv-required": t("Your original CV is missing. Upload it again in Profile & settings.", "ملف سيرتك الأصلي غير موجود. ارفعه مرة أخرى من الملف والإعدادات."),
          "preferences-required": t("Complete your role, industry, and experience preferences first.", "أكمل المسمى والمجال ومستوى الخبرة أولاً."),
          "verified-job-not-found": t("This job is no longer in the verified job feed. Refresh the recommendations.", "لم تعد هذه الوظيفة موجودة في قائمة الوظائف الموثقة. حدّث الاقتراحات."),
          "application-email-endpoint-missing": t("The V2 application route is not live on the production API.", "مسار التقديم V2 غير متاح على واجهة الإنتاج."),
        };
        setMessage(failureCopy[result.error] || t("The application was not verified as sent. Nothing has been marked as applied.", "لم يتم التحقق من إرسال الطلب، ولم يتم تسجيله كطلب مرسل."));
        trackEngagement("application_email_failed", { status: result.status, error: result.error, jobId: selectedJob.id });
        return;
      }

      await apps.refetch();
      formElement.reset();
      setMessage(t(
        `Application sent and recorded. Provider evidence: ${result.messageId}`,
        `تم إرسال الطلب وتسجيله. دليل مزود البريد: ${result.messageId}`,
      ));
      trackEngagement("application_email_sent", { city: selectedJob.city, jobId: selectedJob.id, providerEvidence: true });
    } finally {
      setSending(false);
    }
  }

  async function signOut() {
    const result = await supabase?.auth.signOut();
    if (result?.error) {
      setMessage(t("Could not sign out. Try again.", "تعذّر تسجيل الخروج. حاول مجدداً."));
      return;
    }
    trackEngagement("signed_out");
    clearCvDraft();
    clear();
    navigate(path("/"));
  }

  return (
    <main className="workspace">
      <aside>
        <Link className="side-link" href={path("/dashboard")}><LayoutDashboard />{t("Overview", "نظرة عامة")}</Link>
        <Link className="side-link" href={path("/applications")}><Briefcase />{t("Applications", "الطلبات")}</Link>
        <Link className="side-link" href={path("/settings")}><Settings />{t("Profile & settings", "الملف والإعدادات")}</Link>
        <div className="sidebar-bottom">
          <small>{t("Saudi Arabia", "السعودية")}<br />Asia/Riyadh · SAR</small>
          <button className="side-link" onClick={() => void signOut()}><LogOut />{t("Sign out", "تسجيل الخروج")}</button>
        </div>
      </aside>

      <div className="workspace-main">
        <div className="workspace-heading">
          <div>
            <span className="section-label">{t("YOUR WORKSPACE", "مساحة عملك")}</span>
            <h1>{t("Welcome, ", "مرحباً، ")}{profile.data?.fullName}</h1>
            <p>{t("Review matches, send applications, and keep every step recorded.", "راجع المطابقات، أرسل الطلبات، وسجّل كل خطوة.")}</p>
            <div className="onboarding-rail" aria-label={t("Workspace setup progress", "تقدم إعداد مساحة العمل")}>
              {[[t("Profile", "الملف"), !!profile.data?.fullName], [t("Location", "المدينة"), !!profile.data?.targetCity], [t("CV signal", "إشارة السيرة"), !!profile.data?.resumeFileName]].map(([label, done]) => (
                <span key={String(label)} className={done ? "done" : ""}><CheckCircle2 size={14} />{label}</span>
              ))}
            </div>
          </div>
          <button className="button" onClick={() => { setAdding(!adding); trackEngagement("track_job_toggled", { open: !adding }); }}><Plus size={18} />{t("Track a job", "أضف وظيفة")}</button>
        </div>

        {import.meta.env.VITE_SHOW_LEAN_AUDITOR === "true" && <LeanPhaseAuditor profile={profile.data} applications={rows} deliveryReady={delivery.data?.ok === true} />}

        <div className="metrics">
          {[
            [rows.filter((row) => row.status === "applied" || !!row.appliedAt).length, t("Applications sent", "طلبات تم إرسالها"), t(`${weekly} sent this Saudi week`, `${weekly} أُرسلت هذا الأسبوع`)],
            [delivered, t("Confirmed delivered", "تم التسليم"), t("Employer mail server accepted them", "قبلها خادم بريد جهة التوظيف")],
            [needsAttention, t("Needs attention", "تحتاج متابعة"), t("Forms, deferrals or delivery issues", "نماذج أو تأجيلات أو مشاكل تسليم")],
            [rows.filter((row) => row.status === "interview").length, t("Interviews", "المقابلات"), t("Your recorded activity", "نشاطك المسجل")],
          ].map(([number, label, hint], index) => (
            <article key={String(label)} className={index === 0 ? "metric-primary" : ""}><span>{label}</span><strong>{number}</strong><small>{hint}</small></article>
          ))}
        </div>

        {message && <p role="alert" className="error">{message}</p>}

        {adding && (
          <form onSubmit={add} className="panel add-form">
            <h2>{t("Save an opportunity", "احفظ فرصة")}</h2>
            <label>{t("Company", "الشركة")}<input name="company" minLength={2} maxLength={150} required /></label>
            <label>{t("Role", "المسمى")}<input name="role" minLength={2} maxLength={150} required /></label>
            <label>{t("City", "المدينة")}<select name="city">{cities.map(([en, ar]) => <option key={en} value={en}>{t(en, ar)}</option>)}</select></label>
            <button className="button" disabled={create.isPending}>{t("Save job", "حفظ الوظيفة")}</button>
            <button type="button" className="text-link" onClick={() => { setAdding(false); trackEngagement("track_job_cancelled"); }}>{t("Cancel", "إلغاء")}</button>
          </form>
        )}

        <div className="workspace-grid">
          <section className="panel tracker">
            <div className="panel-heading">
              <h2>{t("Your application activity", "نشاط طلباتك")}</h2>
              <button className="icon-button" aria-label={t("Refresh applications", "تحديث الطلبات")} onClick={() => { apps.refetch(); trackEngagement("applications_refreshed"); }}><RefreshCw size={17} /></button>
            </div>
            {apps.isError ? (
              <p role="alert">{t("Applications could not be loaded. Use refresh to retry.", "تعذّر تحميل الطلبات. اضغط التحديث للمحاولة.")}</p>
            ) : !rows.length ? (
              <div className="empty">
                <Briefcase size={32} />
                <h3>{t("Your next opportunity starts here.", "فرصتك القادمة تبدأ هنا.")}</h3>
                <p>{t("Save a job or send an application to build your tracker.", "احفظ وظيفة أو أرسل طلباً لبناء السجل.")}</p>
                <button className="button" onClick={() => { setAdding(true); trackEngagement("track_first_job_clicked"); }}>{t("Track your first job", "أضف أول وظيفة")}</button>
              </div>
            ) : (
              <div className="job-list">{rows.map((row) => <ApplicationRow key={row.id} row={row} update={update} setMessage={setMessage} />)}</div>
            )}
          </section>

          <div>
            <section className="panel sender-panel">
              <span className="tag"><MailCheck size={14} />{t("Verified email application", "طلب بريد موثّق")}</span>
              <h2>{t("Send an application", "إرسال طلب تقديم")}</h2>
              <p>{t("Choose a verified job first. AutoApply uses your saved profile and private CV to prepare a grounded message, then records provider evidence.", "اختر وظيفة موثقة أولاً. يستخدم AutoApply ملفك وسيرتك الخاصة لإعداد رسالة مبنية على بياناتك ثم يسجل دليل مزود البريد.")}</p>
              <form key={selectedJob?.id || "no-selected-job"} onSubmit={send}>
                <label>{t("Employer name", "اسم جهة التوظيف")}<input value={selectedJob?.companyName || ""} readOnly required /></label>
                <label>{t("Position title", "مسمى الوظيفة")}<input value={selectedJob?.roleTitle || ""} readOnly required /></label>
                <label>{t("Application location", "موقع التقديم")}<input value={selectedJob?.city || ""} readOnly required /></label>
                <label>{t("Recipient email", "بريد المستلم")}<input name="recipientEmail" type="email" placeholder="hiring@company.com" required dir="ltr" /></label>
                <label>{t("Generated application message", "رسالة التقديم المولّدة")}<textarea
                  aria-label={t("Generated application message", "رسالة التقديم المولّدة")}
                  readOnly
                  value={selectedJob ? [
                    `Hello ${selectedJob.companyName} team,`,
                    "",
                    `I am applying for the ${selectedJob.roleTitle} role in ${selectedJob.city}.`,
                    profile.data?.resumeSummary
                      ? `The CV keywords identified during my profile setup include: ${profile.data.resumeSummary}.`
                      : "Please find my CV attached for your review.",
                    "",
                    "I would appreciate the opportunity to discuss the role.",
                  ].join("\n") : ""}
                /></label>
                {selectedJob && <a href={selectedJob.url} target="_blank" rel="noreferrer">{t("Open original job posting", "افتح إعلان الوظيفة الأصلي")} <ArrowUpRight size={14} /></a>}
                {!profile.data?.resumeStoragePath && <p className="error">{t("Your original CV must be stored before sending.", "يجب حفظ ملف سيرتك الأصلي قبل الإرسال.")}</p>}
                <button className="button full" disabled={sending || !backend.data?.ok || !selectedJob || !profile.data?.resumeStoragePath}>
                  <Send size={17} />{sending ? t("Sending…", "جارٍ الإرسال…") : t("Send and record application", "إرسال وتسجيل الطلب")}
                </button>
              </form>
            </section>

            <section className="panel recommended-panel">
              <span className="tag"><ShieldCheck size={14} />{jobs.data?.mode === "live" ? t("Verified live jobs", "وظائف مباشرة موثّقة") : t("Verified feed unavailable", "قائمة الوظائف الموثقة غير متاحة")}</span>
              <h2>{t("Jobs to check now", "وظائف يمكن فحصها الآن")}</h2>
              {jobs.isError || jobs.data?.mode !== "live" ? (
                <p role="alert">{t("Verified jobs are unavailable right now. AutoApply will not substitute generic search links.", "الوظائف الموثقة غير متاحة حالياً. لن يستبدلها AutoApply بروابط بحث عامة.")}</p>
              ) : !(jobs.data?.jobs ?? []).length ? (
                <p>{t("No verified matches are available for these preferences right now.", "لا توجد مطابقات موثقة لهذه التفضيلات حالياً.")}</p>
              ) : (
                <div className="job-suggestions">
                  {(jobs.data?.jobs ?? []).slice(0, 8).map((job) => (
                    <article key={job.id} className="suggestion">
                      <a href={job.url} target="_blank" rel="noreferrer" onClick={() => trackEngagement("recommended_job_opened", { source: job.source, city: job.city })}>
                        <strong>{job.roleTitle}</strong>
                        <span>{job.companyName} · {job.city}</span>
                        <small>{job.matchReason}</small>
                      </a>
                      <button type="button" className="text-link" onClick={() => {
                        setSelectedJob(job);
                        setMessage("");
                        trackEngagement("verified_job_selected", { jobId: job.id, source: job.source });
                      }}>{selectedJob?.id === job.id ? t("Selected", "تم الاختيار") : t("Use this job", "استخدم هذه الوظيفة")}</button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="panel">
              <span className="tag">{t("Manual mode", "الوضع اليدوي")}</span>
              <h2>{t("AutoApply status", "حالة AutoApply")}</h2>
              <p>{t("Submissions only send when you press the send button. Saving or updating a job does not send an application.", "ترسل الطلبات فقط عندما تضغط زر الإرسال. حفظ الوظيفة أو تحديثها لا يرسل طلباً.")}</p>
              <small className={backend.data?.ok ? "health-ok" : "health-warn"}>{backend.isLoading ? t("Checking backend…", "جارٍ فحص الخادم…") : backend.data?.ok ? t("Backend connected", "الخادم متصل") : t("Backend check failed", "فشل فحص الخادم")}</small>
            </section>

            <section className="panel">
              <h2>{t("Profile completeness", "اكتمال الملف")}</h2>
              <progress max={6} value={completed} />
              <p>{completed === 6 ? t("Your essentials are ready for a verified application.", "أساسياتك جاهزة لطلب تقديم موثّق.") : t("Complete your profile, preferences, and private CV.", "أكمل ملفك وتفضيلاتك وسيرتك الخاصة.")}</p>
              <Link className="next-action" href={path("/settings")} onClick={() => trackEngagement("profile_review_clicked")}><FileText size={18} />{t("Review your profile", "راجع ملفك")}<ArrowUpRight size={17} /></Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function ApplicationRow({ row, update, setMessage }: { row: Application; update: ReturnType<typeof useWorkspaceData>["update"]; setMessage: (message: string) => void }) {
  const { t } = useLocale();
  return (
    <article className="job-row">
      <div className="company-monogram">{row.companyName.charAt(0)}</div>
      <div>
        <strong>{row.roleTitle}</strong>
        <p>{row.companyName} · {row.city}</p>
        <small>{new Intl.DateTimeFormat(t("en-SA", "ar-SA"), { timeZone: "Asia/Riyadh", dateStyle: "medium" }).format(new Date(row.updatedAt))}</small>
        {(row.deliveryStatus || row.responseStatus !== "none") && <small className="application-signal">
          {row.deliveryStatus ? t(`Delivery: ${row.deliveryStatus.replaceAll("_"," ")}`, `التسليم: ${row.deliveryStatus.replaceAll("_"," ")}`) : ""}
          {row.responseStatus === "action_required" ? t(" · Action required", " · إجراء مطلوب") : ""}
          {row.responseStatus === "out_of_office" ? t(" · Automatic out-of-office reply", " · رد غياب تلقائي") : ""}
        </small>}
        {row.responseNote && <small className="application-note">{row.responseNote}</small>}
        {row.responseUrl && <a className="text-link" href={row.responseUrl} target="_blank" rel="noreferrer">{t("Complete employer step", "أكمل خطوة جهة التوظيف")}<ArrowUpRight size={13} /></a>}
      </div>
      <label className="status-select">
        <span className="sr-only">{t("Application status", "حالة الطلب")}</span>
        <select value={row.status} disabled={update.isPending} onChange={(event) => {
          const status = event.target.value as Application["status"];
          update.mutate({ id: row.id, status }, {
            onSuccess: () => trackEngagement("application_status_updated", { status }),
            onError: () => setMessage(t("Could not update the application.", "تعذّر تحديث الطلب.")),
          });
        }}>
          {[["queued", t("Saved", "محفوظ")], ["applied", t("Applied", "تم التقديم")], ["interview", t("Interview", "مقابلة")], ["offer", t("Offer", "عرض")], ["rejected", t("Rejected", "مرفوض")], ["skipped", t("Archived", "مؤرشف")]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </article>
  );
}

function CandidateAccess({ claimAccess }: { claimAccess: ReturnType<typeof useWorkspaceData>["claimAccess"] }) {
  const { t, path } = useLocale();
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  async function claim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await claimAccess.mutateAsync(code);
      trackEngagement("candidate_access_claimed");
      navigate(path("/dashboard"));
    } catch {
      setError(t("That code does not belong to this signed-in email. Check the account and code, then try again.", "هذا الرمز لا يخص البريد المسجل حالياً. تحقق من الحساب والرمز ثم حاول مجدداً."));
    }
  }
  return (
    <main className="onboarding wrap">
      <div>
        <span className="section-label">{t("PRIVATE CANDIDATE WORKSPACE", "مساحة مرشح خاصة")}</span>
        <h1>{t("Connect your application history.", "اربط سجل طلباتك.")}</h1>
        <p>{t("Enter the private access code you received. The code is also locked to your signed-in email, so another candidate cannot open your records.", "أدخل رمز الوصول الخاص الذي استلمته. الرمز مرتبط أيضاً ببريدك المسجل، لذلك لا يستطيع مرشح آخر فتح سجلك.")}</p>
      </div>
      <form className="panel" onSubmit={claim}>
        <h2>{t("Candidate access code", "رمز دخول المرشح")}</h2>
        <label>{t("Private code", "الرمز الخاص")}<input value={code} onChange={(event)=>setCode(event.target.value)} autoComplete="one-time-code" required minLength={8} maxLength={40} dir="ltr" /></label>
        <p className="error" role="alert">{error}</p>
        <button className="button full" disabled={claimAccess.isPending}>{claimAccess.isPending ? t("Connecting…", "جارٍ الربط…") : t("Open my dashboard", "افتح لوحة التحكم")}</button>
        <Link href={path("/onboarding")}>{t("I am a new user without a code", "أنا مستخدم جديد بدون رمز")}</Link>
      </form>
    </main>
  );
}

function ProfileForm({ existing, settings }: { existing: any; settings?: boolean }) {
  const { t, path } = useLocale();
  const [, navigate] = useLocation();
  const { saveProfile } = useWorkspaceData();
  const [cv, setCv] = useState(cvDraft);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await saveProfile.mutateAsync({
        fullName: String(form.get("name")),
        targetCity: String(form.get("city")),
        targetRole: String(form.get("role")),
        targetIndustry: String(form.get("industry")),
        experienceLevel: String(form.get("experience")),
        preferredLanguage: t("English", "Arabic") as "English" | "Arabic",
        openToRemote: form.get("remote") === "on",
        ...(cv ? { resumeSummary: cv.skills.join(", ").slice(0, 500) } : {}),
        ...(cv?.storagePath ? {
          resumeFileName: cv.name,
          resumeStoragePath: cv.storagePath,
          resumeMimeType: cv.mimeType || null,
          resumeSizeBytes: cv.sizeBytes || null,
        } : {}),
      });
      trackEngagement("profile_saved", { settings: !!settings, hasCv: !!cv, city: String(form.get("city")) });
      navigate(path("/dashboard"));
    } catch {
      setError(t("Could not save your profile. Your entries are still here.", "تعذّر حفظ ملفك. ما زالت بياناتك في النموذج."));
      trackEngagement("profile_save_failed", { settings: !!settings });
    }
  }

  return (
    <main className="onboarding wrap">
      <div>
        <span className="section-label">{settings ? t("YOUR PROFILE", "ملفك") : t("LET’S SET YOUR DIRECTION", "لنحدد وجهتك")}</span>
        <h1>{settings ? t("Make it yours.", "ملفك يعكسك.") : t("A few details. A clearer search.", "تفاصيل قليلة. وبحث أوضح.")}</h1>
        <p>{t("Start with the essentials. You can edit these at any time.", "ابدأ بالأساسيات. يمكنك تعديلها في أي وقت.")}</p>
        <div className="setup-preview">
          <span>{t("Premium setup", "إعداد مميز")}</span>
          <strong>{t("CV signal + city + role focus", "إشارة السيرة + المدينة + التوجه")}</strong>
          <p>{t("These details shape the first dashboard view without sending applications automatically.", "تشكّل هذه التفاصيل أول عرض في لوحة التحكم دون إرسال طلبات تلقائياً.")}</p>
        </div>
        <CvUpload onParsed={setCv} />
      </div>
      <form className="panel" onSubmit={save}>
        <h2>{t("Your preferences", "تفضيلاتك")}</h2>
        <div className="form-steps" aria-hidden="true"><span className="done">1</span><span>2</span><span>3</span></div>
        <label>{t("Full name", "الاسم الكامل")}<input name="name" defaultValue={existing?.fullName || ""} required minLength={2} maxLength={120} /></label>
        <label>{t("Preferred city", "المدينة المفضلة")}<select name="city" defaultValue={existing?.targetCity || "Jeddah"}>{cities.map(([en, ar]) => <option key={en} value={en}>{t(en, ar)}</option>)}</select></label>
        <label>{t("Target role", "المسمى المطلوب")}<input name="role" defaultValue={existing?.targetRole || cv?.roles[0] || existing?.targetIndustry || ""} required minLength={2} maxLength={120} /></label>
        <label>{t("Target industry", "المجال المطلوب")}<input name="industry" defaultValue={existing?.targetIndustry || ""} required minLength={2} maxLength={64} /></label>
        <label>{t("Experience level", "مستوى الخبرة")}<select name="experience" defaultValue={existing?.experienceLevel || "Entry level"}>
          <option value="Entry level">{t("Entry level", "مبتدئ")}</option>
          <option value="Mid-level">{t("Mid-level", "متوسط")}</option>
          <option value="Senior">{t("Senior", "متقدم")}</option>
          <option value="Executive">{t("Executive", "تنفيذي")}</option>
        </select></label>
        <label className="checkbox"><input name="remote" type="checkbox" defaultChecked={existing?.openToRemote} />{t("Open to remote work", "أقبل العمل عن بُعد")}</label>
        <div className="notice"><CheckCircle2 size={18} /><p>{t("Applications send only after you choose a verified job and press Send.", "لا تُرسل الطلبات إلا بعد اختيار وظيفة موثقة والضغط على إرسال.")}</p></div>
        <small>{t("Your original CV is stored privately when you upload it here. Profile preferences persist with your account.", "يُحفظ ملف سيرتك الأصلي بشكل خاص عند رفعه هنا، وتبقى تفضيلاتك محفوظة في حسابك.")}</small>
        <p className="error" role="alert">{error}</p>
        <button className="button full" disabled={saveProfile.isPending}>{saveProfile.isPending ? t("Saving…", "جارٍ الحفظ…") : t("Save and open dashboard", "حفظ وفتح لوحة التحكم")}</button>
        {settings && <Link href={path("/dashboard")}>{t("Back to dashboard", "العودة للوحة التحكم")}</Link>}
      </form>
    </main>
  );
}
