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
import { sendApplicationEmail, useApplicationDeliveryReadiness, useBackendHealth, useRecommendedJobs } from "./backend";
import { type Application, saudiWeekStart, useWorkspaceData } from "./data";
import { cities, useLocale } from "./locale";
import { supabase, useSession } from "./auth";
import { LeanPhaseAuditor, auditLeanPhases } from "./LeanPhaseAuditor";

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
  const { session } = useSession();
  const backend = useBackendHealth();
  const delivery = useApplicationDeliveryReadiness();
  const jobs = useRecommendedJobs({ city: profile.data?.targetCity, role: profile.data?.targetIndustry });
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (profile.data?.fullName && route.endsWith("/auth/callback")) navigate(path("/dashboard"));
  }, [profile.data, route, navigate, path]);

  if (profile.isLoading) return <State title={t("Loading your workspace…", "جارٍ تحميل مساحة العمل…")} />;
  if (profile.isError) return <State title={t("Your account is signed in. Your workspace is not available yet.", "تم تسجيل دخولك، لكن مساحة العمل غير متاحة بعد.")} detail={t("We could not reach your profile service. Please try again shortly.", "تعذّر الوصول إلى خدمة ملفك. حاول مجدداً لاحقاً.")} retry />;
  if (route.endsWith("/onboarding") || route.endsWith("/settings")) return <ProfileForm existing={profile.data} settings={route.endsWith("/settings")} />;
  if (profile.isSuccess && !profile.data?.fullName) return <CandidateAccess claimAccess={claimAccess} />;

  const rows = apps.data ?? [];
  const weekly = rows.filter((row) => row.appliedAt && new Date(row.appliedAt) >= saudiWeekStart()).length;
  const delivered = rows.filter((row) => row.deliveryStatus === "delivered").length;
  const needsAttention = rows.filter((row) => row.responseStatus === "action_required" || ["deferred","hard_bounce","soft_bounce","blocked"].includes(row.deliveryStatus || "")).length;
  const completed = [profile.data?.fullName, profile.data?.targetCity, profile.data?.resumeFileName].filter(Boolean).length;
  const leanAudit = auditLeanPhases({ profile: profile.data, applications: rows, deliveryReady: delivery.data?.ok === true });

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
    setSending(true);
    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("senderCompany"));
    const roleTitle = String(form.get("senderRole"));
    const city = String(form.get("senderCity"));
    const candidateEmail = session?.user.email || String(form.get("candidateEmail"));
    const payload = {
      toEmail: String(form.get("recipientEmail")),
      companyName,
      roleTitle,
      city,
      candidateName: profile.data?.fullName || String(form.get("candidateName")),
      candidateEmail,
      message: String(form.get("applicationMessage")),
      cvSummary: profile.data?.resumeSummary || "",
    };

    try {
      const result = await sendApplicationEmail(payload);
      if (!result.ok) {
        setMessage(result.error === "brevo-not-configured"
          ? t("Email sending is not configured yet. Add BREVO_API_KEY and BREVO_SENDER_EMAIL on the backend.", "إرسال البريد غير مهيأ بعد. أضف BREVO_API_KEY و BREVO_SENDER_EMAIL في الخادم.")
          : result.error === "application-email-endpoint-missing"
            ? t("The application email route is not live on the API yet. The tracker still works; connect the V2 backend route before sending.", "مسار إرسال طلبات التوظيف غير مفعل على واجهة API بعد. لا يزال السجل يعمل؛ اربط مسار الخادم V2 قبل الإرسال.")
          : result.error === "auditor-package-required"
            ? t("The API is connected. Live email sending now needs the approved application package before Brevo dispatch.", "واجهة API متصلة. إرسال البريد الحي يحتاج الآن إلى حزمة طلب معتمدة قبل الإرسال عبر Brevo.")
          : t("Could not send this application. Check the backend connection and try again.", "تعذّر إرسال هذا الطلب. تحقق من اتصال الخادم وحاول مجدداً."));
        trackEngagement("application_email_failed", { status: result.status, error: result.error });
        return;
      }
      create.mutate({ companyName, roleTitle, city, status: "applied" }, {
        onSuccess: () => {
          event.currentTarget.reset();
          setMessage(t("Application sent and recorded.", "تم إرسال الطلب وتسجيله."));
          trackEngagement("application_email_sent", { city });
        },
        onError: () => {
          setMessage(t("Application email was sent, but the tracker could not be updated. Refresh and add it manually if needed.", "تم إرسال البريد، لكن تعذّر تحديث السجل. حدّث الصفحة وأضفه يدوياً عند الحاجة."));
          trackEngagement("application_email_record_failed");
        },
      });
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
          <button className="button" disabled={!leanAudit.canTrack} onClick={() => { setAdding(!adding); trackEngagement("track_job_toggled", { open: !adding }); }}><Plus size={18} />{t("Track a job", "أضف وظيفة")}</button>
        </div>

        <LeanPhaseAuditor profile={profile.data} applications={rows} deliveryReady={delivery.data?.ok === true} />

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
              <span className="tag"><MailCheck size={14} />{t("Brevo sender", "مرسل Brevo")}</span>
              <h2>{t("Send an application", "إرسال طلب تقديم")}</h2>
              <p>{t("Write the message, review the recipient, then send through the backend. Nothing leaves automatically.", "اكتب الرسالة، راجع المستلم، ثم أرسل عبر الخادم. لا يخرج شيء تلقائياً.")}</p>
              {!leanAudit.canSend && <div className="phase-lock-note"><ShieldCheck size={16} /><span>{t("Lean Auditor locked sending until phases 1–3 pass.", "أوقف مدقق لين الإرسال حتى تجتاز المراحل ١–٣.")}</span></div>}
              <form onSubmit={send}>
                <input type="hidden" name="candidateName" value={profile.data?.fullName || ""} readOnly />
                <input type="hidden" name="candidateEmail" value={session?.user.email || ""} readOnly />
                <label>{t("Employer name", "اسم جهة التوظيف")}<input name="senderCompany" minLength={2} maxLength={150} required /></label>
                <label>{t("Position title", "مسمى الوظيفة")}<input name="senderRole" defaultValue={profile.data?.targetIndustry || ""} minLength={2} maxLength={150} required /></label>
                <label>{t("Application location", "موقع التقديم")}<select name="senderCity" defaultValue={profile.data?.targetCity || "Riyadh"}>{cities.map(([en, ar]) => <option key={en} value={en}>{t(en, ar)}</option>)}</select></label>
                <label>{t("Recipient email", "بريد المستلم")}<input name="recipientEmail" type="email" placeholder="hiring@company.com" required dir="ltr" /></label>
                <label>{t("Application message", "رسالة التقديم")}<textarea name="applicationMessage" minLength={20} maxLength={3000} required defaultValue={t("Hello, I am interested in this role and believe my experience is a strong match. I would appreciate the chance to discuss how I can contribute.", "مرحباً، أنا مهتم بهذا الدور وأرى أن خبرتي مناسبة له. يسعدني أن أتاح لي المجال لمناقشة كيف يمكنني المساهمة.")} /></label>
                <button className="button full" disabled={sending || !backend.data?.ok || !leanAudit.canSend}><Send size={17} />{sending ? t("Sending…", "جارٍ الإرسال…") : t("Send and record application", "إرسال وتسجيل الطلب")}</button>
              </form>
            </section>

            <section className="panel recommended-panel">
              <span className="tag"><ShieldCheck size={14} />{jobs.data?.mode === "live" ? t("Live jobs", "وظائف مباشرة") : t("Review queue", "قائمة مراجعة")}</span>
              <h2>{t("Jobs to check now", "وظائف يمكن فحصها الآن")}</h2>
              {jobs.isError ? <p role="alert">{t("Job suggestions could not load. The tracker still works.", "تعذّر تحميل الاقتراحات. لا يزال السجل يعمل.")}</p> : (
                <div className="job-suggestions">
                  {(jobs.data?.jobs ?? []).slice(0, 3).map((job) => (
                    <a key={job.id} className="suggestion" href={job.url} target="_blank" rel="noreferrer" onClick={() => trackEngagement("recommended_job_opened", { source: job.source, city: job.city })}>
                      <strong>{job.roleTitle}</strong>
                      <span>{job.companyName} · {job.city}</span>
                      <small>{job.matchReason}</small>
                    </a>
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
              <progress max={3} value={completed} />
              <p>{completed === 3 ? t("Your essentials are ready. Keep your tracker moving.", "أساسياتك جاهزة. واصل تحديث سجل الطلبات.") : t("Name, location and CV summary", "الاسم والمدينة وملخص السيرة")}</p>
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
        targetIndustry: String(form.get("industry")),
        preferredLanguage: t("English", "Arabic") as "English" | "Arabic",
        openToRemote: form.get("remote") === "on",
        ...(cv ? { resumeFileName: cv.name, resumeSummary: cv.skills.join(", ").slice(0, 500) } : {}),
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
        <label>{t("Target role or field", "المسمى أو المجال المطلوب")}<input name="industry" defaultValue={existing?.targetIndustry || cv?.roles[0] || ""} required maxLength={64} /></label>
        <label className="checkbox"><input name="remote" type="checkbox" defaultChecked={existing?.openToRemote} />{t("Open to remote work", "أقبل العمل عن بُعد")}</label>
        <div className="notice"><CheckCircle2 size={18} /><p>{t("Manual mode is active. No applications will be sent automatically.", "الوضع اليدوي مفعّل. لن تُرسل طلبات تلقائياً.")}</p></div>
        <small>{t("Saving stores these preferences and, if selected, your CV filename and keyword summary. The original file is not uploaded.", "يحفظ هذا الإجراء تفضيلاتك واسم ملف السيرة وملخص كلماتها إن اخترتها. لا يتم رفع الملف الأصلي.")}</small>
        <p className="error" role="alert">{error}</p>
        <button className="button full" disabled={saveProfile.isPending}>{saveProfile.isPending ? t("Saving…", "جارٍ الحفظ…") : t("Save and open dashboard", "حفظ وفتح لوحة التحكم")}</button>
        {settings && <Link href={path("/dashboard")}>{t("Back to dashboard", "العودة للوحة التحكم")}</Link>}
      </form>
    </main>
  );
}
