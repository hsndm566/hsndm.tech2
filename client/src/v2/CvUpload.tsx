import { useRef, useState } from "react";
import { FileText, UploadCloud, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "./locale";
import { FIELD_MAP } from "@/lib/careerTaxonomy";
import { trackEngagement } from "@/lib/analytics";
import { supabase, useSession } from "./auth";

export type CvResult = {
  name: string;
  skills: string[];
  roles: string[];
  storagePath?: string;
  mimeType?: string;
  sizeBytes?: number;
};

function readDraft(): CvResult | null {
  try {
    const data = JSON.parse(sessionStorage.getItem("autoapply-cv-draft") || "null");
    return data && typeof data.name === "string" && Array.isArray(data.skills) && Array.isArray(data.roles) ? data : null;
  } catch {
    return null;
  }
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 160) || "cv.pdf";
}

function inferredMimeType(file: File) {
  if (file.type) return file.type;
  if (/\.pdf$/i.test(file.name)) return "application/pdf";
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export let cvDraft: CvResult | null = readDraft();

export function clearCvDraft() {
  cvDraft = null;
  try {
    sessionStorage.removeItem("autoapply-cv-draft");
  } catch {}
}

export function CvUpload({ onParsed }: { onParsed?: (result: CvResult) => void }) {
  const { t, path } = useLocale();
  const { session } = useSession();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CvResult | null>(cvDraft);

  async function parse(file?: File) {
    if (!file) return;
    setError("");
    trackEngagement("cv_upload_started", {
      extension: file.name.split(".").pop()?.toLowerCase() || "unknown",
      sizeBucket: file.size > 5 * 1024 * 1024 ? "5mb_to_10mb" : "under_5mb",
    });

    if (!/\.(pdf|docx)$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      setError(t("Choose a PDF or DOCX under 10 MB.", "اختر ملف PDF أو DOCX بحجم أقل من ١٠ ميجابايت."));
      trackEngagement("cv_upload_rejected", { reason: "format_or_size" });
      return;
    }

    setResult(null);
    setState("reading");

    try {
      const { readCvText } = await import("@/lib/careerMatcher");
      const text = await readCvText(file);
      if (!text) throw new Error("unreadable");

      const lower = text.toLowerCase();
      const matching = FIELD_MAP
        .map(field => ({ ...field, found: field.keywords.filter(keyword => lower.includes(keyword)) }))
        .filter(field => field.found.length > 0)
        .sort((a, b) => b.found.length - a.found.length);

      const next: CvResult = {
        name: file.name,
        skills: Array.from(new Set(matching.flatMap(field => field.found))).slice(0, 8),
        roles: matching.slice(0, 2).flatMap(field => field.items.slice(0, 1)),
      };

      if (onParsed && session?.user.id) {
        if (!supabase) throw new Error("storage-unavailable");
        const unique = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const storagePath = `${session.user.id}/${unique}-${safeFileName(file.name)}`;
        const mimeType = inferredMimeType(file);
        const { error: uploadError } = await supabase.storage
          .from("candidate-cvs")
          .upload(storagePath, file, { contentType: mimeType, upsert: false });
        if (uploadError) throw new Error("storage-upload-failed");

        next.storagePath = storagePath;
        next.mimeType = mimeType;
        next.sizeBytes = file.size;
      }

      cvDraft = next;
      try {
        sessionStorage.setItem("autoapply-cv-draft", JSON.stringify(next));
      } catch {}
      setResult(next);
      onParsed?.(next);
      setState("done");
      trackEngagement("cv_parsed", {
        skillCount: next.skills.length,
        roleCount: next.roles.length,
        persisted: Boolean(next.storagePath),
      });
    } catch (reason) {
      setState("error");
      const storageFailure =
        reason instanceof Error && ["storage-unavailable", "storage-upload-failed"].includes(reason.message);
      setError(
        storageFailure
          ? t(
              "We read the CV but could not store the original file securely. Try the upload again.",
              "تمت قراءة السيرة لكن تعذّر حفظ الملف الأصلي بشكل آمن. حاول الرفع مرة أخرى.",
            )
          : t(
              "We could not read this file. Try a text-based PDF or DOCX. Scanned images need OCR.",
              "تعذّرت قراءة الملف. جرّب PDF نصياً أو DOCX. الملفات الممسوحة تحتاج إلى تحويل النص.",
            ),
      );
      trackEngagement("cv_parse_failed", { reason: storageFailure ? "private_storage" : "unreadable" });
    }
  }

  const accountUpload = Boolean(onParsed && session?.user.id);

  return (
    <div className="cv-card" id="upload">
      <span className="eyebrow">{t("YOUR NEXT STEP STARTS HERE", "خطوتك القادمة تبدأ هنا")}</span>
      <h2>{t("Start with your CV.", "ابدأ بسيرتك الذاتية.")}</h2>
      <p>{t("Find the skills already in your experience.", "تعرّف على المهارات الموجودة في خبراتك.")}</p>
      <input ref={input} type="file" accept=".pdf,.docx" hidden onChange={event => parse(event.target.files?.[0])} />
      <button
        type="button"
        className="dropzone"
        disabled={state === "reading"}
        onClick={() => {
          trackEngagement("cv_picker_opened");
          input.current?.click();
        }}
        onDragOver={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault();
          if (state !== "reading") parse(event.dataTransfer.files[0]);
        }}
      >
        {state === "reading" ? <Loader2 className="spin" size={32} /> : result ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
        <strong>
          {state === "reading" ? t("Reading your CV…", "جارٍ قراءة سيرتك…") : result ? result.name : t("Drop your CV here", "اسحب سيرتك الذاتية هنا")}
        </strong>
        <span>{t("or click to browse · PDF / DOCX · 10 MB", "أو اضغط لاختيار الملف · PDF / DOCX · ١٠ ميجابايت")}</span>
      </button>
      <div role="status" aria-live="polite">
        {error && <p className="error">{error}</p>}
        {result && (
          <div className="cv-result">
            <small>{t("Keywords found in your CV", "كلمات مستخرجة من سيرتك")}</small>
            <div className="chips">{result.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
            <p>
              {result.roles.length
                ? t("Roles to explore", "مسميات تستحق البحث") + " · " + result.roles.join(" / ")
                : t("Your text is readable. Add your target role in the next step.", "النص مقروء. أضف المسمى المطلوب في الخطوة التالية.")}
            </p>
            <small>
              {accountUpload
                ? result.storagePath
                  ? t("Original CV stored privately in your account.", "تم حفظ ملف السيرة الأصلي بشكل خاص في حسابك.")
                  : t("Upload the CV again here to store the original file in your account.", "ارفع السيرة هنا مرة أخرى لحفظ الملف الأصلي في حسابك.")
                : t("Keyword-based suggestions, not live job matches.", "اقتراحات من كلمات السيرة، وليست وظائف شاغرة مؤكدة.")}
            </small>
          </div>
        )}
      </div>
      {!onParsed && (
        <Link
          className="button full"
          href={path("/sign-up")}
          onClick={() => trackEngagement("cta_clicked", { target: "sign_up", surface: "cv_card", hasParsedCv: !!result })}
        >
          {result ? t("Continue with your profile", "تابع إعداد ملفك") : t("Start free", "ابدأ مجاناً")}
        </Link>
      )}
      <small className="privacy">
        <LockKeyhole size={14} />
        {accountUpload
          ? t("Your original CV is stored in a private user-owned folder.", "يُحفظ ملف سيرتك الأصلي في مجلد خاص مملوك لحسابك.")
          : t("Text is read on your device. Your file is not uploaded here.", "تُقرأ السيرة على جهازك دون رفع الملف هنا.")}
      </small>
    </div>
  );
}
