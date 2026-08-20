import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("dist/public");
const indexPage = resolve(output, "index.html");
const siteUrl = "https://www.hsndm.tech";
const canonicalPath = (path) => path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
const pageMetadata = {
  ar: {
    title: "أوتوأبلاي السعودية | دعم حملات التقديم للوظائف",
    description: "دعم منظّم لحملات التقديم للوظائف داخل السعودية: راجع سيرتك، حدّد أدوارك، واعتمد اتجاه حملتك مع AutoApply SA من جدة.",
    path: "/ar",
    lang: "ar",
    direction: "rtl",
    locale: "ar_SA",
  },
  "ar/enquire": {
    title: "ابدأ حملتك | أوتوأبلاي السعودية",
    description: "ابدأ حملة AutoApply SA للبحث عن وظيفة داخل السعودية وشارك الأدوار المستهدفة وتفضيلاتك قبل اعتماد اتجاه الحملة.",
    path: "/ar/enquire",
    lang: "ar",
    direction: "rtl",
    locale: "ar_SA",
  },
  "ar/thank-you": {
    title: "ملخص الحملة جاهز | أوتوأبلاي السعودية",
    description: "تم تجهيز ملخص حملتك للخطوة التالية في أوتوأبلاي السعودية.",
    path: "/ar/thank-you",
    lang: "ar",
    direction: "rtl",
    locale: "ar_SA",
    robots: "noindex, follow",
  },
  enquire: {
    title: "Start a Campaign | AutoApply SA",
    description: "Start an AutoApply SA job-application campaign for Saudi Arabia. Share your target roles and preferences before any campaign direction is confirmed.",
    path: "/enquire",
    lang: "en",
    direction: "ltr",
    locale: "en_SA",
  },
  "thank-you": {
    title: "Campaign Brief Sent | AutoApply SA",
    description: "Your AutoApply SA campaign brief is ready for the next step.",
    path: "/thank-you",
    lang: "en",
    direction: "ltr",
    locale: "en_SA",
    robots: "noindex, follow",
  },
  "how-it-works": { title: "How AutoApply SA Works | Saudi Job Search", description: "How AutoApply SA works: review your CV, set Saudi role targets, confirm your campaign direction, and track applications in your dashboard.", path: "/how-it-works", lang: "en", direction: "ltr", locale: "en_SA" },
  support: { title: "Saudi Job Campaign Support | AutoApply SA", description: "Get help with your AutoApply SA campaign, dashboard access, or privacy requests for Saudi Arabia job seekers.", path: "/support", lang: "en", direction: "ltr", locale: "en_SA" },
  "case-studies": { title: "KAIA Terminal 1 Case Study | AutoApply SA", description: "Read an owner-supplied operations-improvement case-study summary using DMAIC and value-stream mapping in Jeddah.", path: "/case-studies", lang: "en", direction: "ltr", locale: "en_SA" },
  "campaign-report-sample": { title: "Illustrative Campaign Report Format | AutoApply SA", description: "See the fields, cadence, and limits of an illustrative AutoApply SA campaign update format.", path: "/campaign-report-sample", lang: "en", direction: "ltr", locale: "en_SA" },
  privacy: { title: "Privacy Policy | AutoApply SA", description: "Learn how AutoApply SA handles Saudi job-search campaign information, CVs, contact details, and privacy requests.", path: "/privacy", lang: "en", direction: "ltr", locale: "en_SA" },
  terms: { title: "Terms & Conditions | AutoApply SA", description: "Read the AutoApply SA service terms for previews, campaign enquiries, candidate tracking, cancellation, and service boundaries.", path: "/terms", lang: "en", direction: "ltr", locale: "en_SA" },
  "ar/how-it-works": { title: "كيف تعمل أوتوأبلاي السعودية | البحث عن عمل", description: "كيف تعمل AutoApply SA: راجع سيرتك، حدّد أدوارك المستهدفة داخل السعودية، واعتمد اتجاه الحملة، ثم تابع الطلبات في لوحتك.", path: "/ar/how-it-works", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/support": { title: "دعم حملات التقديم في السعودية | AutoApply SA", description: "احصل على المساعدة في حملة AutoApply SA أو دخول لوحة المرشح أو طلبات الخصوصية للباحثين عن عمل في السعودية.", path: "/ar/support", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/case-studies": { title: "دراسة حالة مبنى الركاب 1 | AutoApply SA", description: "اطلع على ملخص دراسة حالة في تحسين العمليات باستخدام DMAIC ورسم تدفق القيمة في جدة.", path: "/ar/case-studies", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/campaign-report-sample": { title: "نموذج تقرير الحملة التوضيحي | أوتوأبلاي السعودية", description: "اطلع على الحقول والوتيرة والحدود في نموذج توضيحي لتحديث الحملة.", path: "/ar/campaign-report-sample", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/privacy": { title: "سياسة الخصوصية | أوتوأبلاي السعودية", description: "تعرّف على كيفية تعامل AutoApply SA مع معلومات حملة البحث عن عمل والسيرة الذاتية وطلبات الخصوصية.", path: "/ar/privacy", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/terms": { title: "الشروط والأحكام | أوتوأبلاي السعودية", description: "اقرأ شروط خدمة AutoApply SA للمعاينة واستفسار الحملة وتتبع الطلبات وحدود الخدمة.", path: "/ar/terms", lang: "ar", direction: "rtl", locale: "ar_SA" },
  pricing: { title: "Saudi Job-Application Plans | AutoApply SA", description: "Saudi job-application campaign plans from 99 SAR/month. Review scope, compare plans, and start with a conversation.", path: "/pricing", lang: "en", direction: "ltr", locale: "en_SA" },
  services: { title: "Services | AutoApply SA", description: "AutoApply SA — Saudi-focused job-application campaign support and practical web systems for small businesses in Jeddah.", path: "/services", lang: "en", direction: "ltr", locale: "en_SA" },
  "ar/pricing": { title: "خطط حملات التقديم في السعودية | AutoApply SA", description: "خطط لحملات التقديم للوظائف في السعودية تبدأ من 99 ريالاً شهرياً. راجع النطاق وقارن الخطط وابدأ بمحادثة.", path: "/ar/pricing", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/services": { title: "الخدمات | AutoApply SA", description: "AutoApply SA: دعم لحملات التقديم للوظائف في السعودية وأنظمة ويب عملية للشركات الصغيرة في جدة.", path: "/ar/services", lang: "ar", direction: "rtl", locale: "ar_SA" },
  ats: { title: "ATS CV Review for Saudi Jobs | AutoApply SA", description: "Check your CV's ATS readiness for Saudi Arabia job applications — free browser-based preview, no file upload required.", path: "/ats", lang: "en", direction: "ltr", locale: "en_SA" },
};

const staticMeta = (indexHtml, metadata) => {
  const url = `${siteUrl}${canonicalPath(metadata.path)}`;
  const withMetadata = indexHtml
    .replace('<html lang="en">', `<html lang="${metadata.lang}"${metadata.direction === "rtl" ? ' dir="rtl"' : ""}>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${metadata.description}" />`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${metadata.robots || "index, follow"}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${metadata.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${metadata.description}" />`)
    .replace(/<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${metadata.locale}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${metadata.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${metadata.description}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${metadata.title}</title>`);

  return withMetadata;
};

const rootHtml = await readFile(indexPage, "utf8");
await Promise.all(Object.entries(pageMetadata).map(async ([route, metadata]) => {
  const routeDirectory = resolve(output, route);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(resolve(routeDirectory, "index.html"), staticMeta(rootHtml, metadata));
}));

await cp(indexPage, resolve(output, "404.html"));

const fallbackContent = (arabic) => `<!doctype html><html lang="${arabic ? "ar" : "en"}"${arabic ? " dir=\"rtl\"" : ""}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${arabic ? "صفحة مساعدة آمنة | أوتوأبلاي السعودية" : "Safe fallback | AutoApply SA"}</title><style>body{margin:0;background:#f3f0e9;color:#151515;font:16px/1.55 system-ui,sans-serif}main{max-width:44rem;margin:8vh auto;padding:2rem;background:#fff;border:1px solid #ddd}a{color:#151515}small{color:#b43b28;text-transform:uppercase;letter-spacing:.08em}</style></head><body><main><small>AutoApply SA · ${arabic ? "مساعدة آمنة" : "safe fallback"}</small><h1>${arabic ? "تعذّر تحميل واجهة التطبيق." : "We could not load the application interface."}</h1><p>${arabic ? "لم تُرفع أي سيرة ذاتية، ولم يُرسل أي نموذج من هذه الصفحة. يمكنك إعادة المحاولة عندما تكون الواجهة متاحة أو التواصل معنا بأمان." : "No CV has been uploaded and no form has been sent from this page. You can retry when the interface is available or contact us safely."}</p><p><a href="${arabic ? "/ar" : "/"}">${arabic ? "إعادة المحاولة" : "Try again"}</a> · <a href="mailto:apply@hsndm.tech">apply@hsndm.tech</a> · <a href="https://wa.me/966571448656">WhatsApp</a></p><p><a href="${arabic ? "/fallback" : "/fallback/ar"}">${arabic ? "English" : "العربية"}</a></p></main></body></html>`;
await Promise.all([
  ["fallback", false],
  ["fallback/enquire", false],
  ["fallback/privacy", false],
  ["fallback/terms", false],
  ["fallback/ar", true],
  ["fallback/ar/enquire", true],
  ["fallback/ar/privacy", true],
  ["fallback/ar/terms", true],
].map(async ([route, arabic]) => {
  const directory = resolve(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), fallbackContent(arabic));
}));
