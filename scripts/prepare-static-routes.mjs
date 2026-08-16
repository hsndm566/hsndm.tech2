import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("dist/public");
const indexPage = resolve(output, "index.html");
const siteUrl = "https://hsndm.tech";
const pageMetadata = {
  ar: {
    title: "أوتوأبلاي السعودية | محرّك التقديم الوظيفي",
    description: "أوتوأبلاي السعودية ينظّم ويخصص طلبات التوظيف للباحثين عن عمل في المملكة العربية السعودية، من جدة إلى جميع أنحاء المملكة.",
    path: "/ar",
    lang: "ar",
    direction: "rtl",
    locale: "ar_SA",
  },
  "ar/enquire": {
    title: "ابدأ حملتك | أوتوأبلاي السعودية",
    description: "ابدأ حملة أوتوأبلاي السعودية وشارك المعلومات الأساسية لبحثك عن وظيفة داخل المملكة.",
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
    description: "Start an AutoApply SA campaign and share the essential details for your Saudi Arabia job search.",
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
  "how-it-works": { title: "How AutoApply SA Works | AutoApply SA", description: "Understand the Saudi-focused AutoApply SA campaign journey from role direction through candidate tracking.", path: "/how-it-works", lang: "en", direction: "ltr", locale: "en_SA" },
  support: { title: "Support | AutoApply SA", description: "Get campaign, dashboard, and privacy support for your Saudi Arabia job search with AutoApply SA.", path: "/support", lang: "en", direction: "ltr", locale: "en_SA" },
  "case-studies": { title: "KAIA Terminal 1 Case Study | AutoApply SA", description: "Read an owner-supplied operations-improvement case-study summary using DMAIC and value-stream mapping in Jeddah.", path: "/case-studies", lang: "en", direction: "ltr", locale: "en_SA" },
  privacy: { title: "Privacy Policy | AutoApply SA", description: "Read the AutoApply SA working privacy-policy draft for Saudi job-search campaign information, CV handling, and privacy rights.", path: "/privacy", lang: "en", direction: "ltr", locale: "en_SA" },
  terms: { title: "Terms & Conditions | AutoApply SA", description: "Read the AutoApply SA working terms for previews, campaign enquiries, candidate tracking, cancellation, and service boundaries.", path: "/terms", lang: "en", direction: "ltr", locale: "en_SA" },
  "ar/how-it-works": { title: "كيف تعمل أوتوأبلاي السعودية | AutoApply SA", description: "تعرّف على مسار حملة AutoApply SA للبحث عن عمل داخل السعودية.", path: "/ar/how-it-works", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/support": { title: "الدعم | أوتوأبلاي السعودية", description: "الدعم للحملة ولوحة التحكم وطلبات الخصوصية للباحثين عن عمل في السعودية.", path: "/ar/support", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/case-studies": { title: "دراسة حالة مبنى الركاب 1 | AutoApply SA", description: "اطلع على ملخص دراسة حالة في تحسين العمليات باستخدام DMAIC ورسم تدفق القيمة في جدة.", path: "/ar/case-studies", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/privacy": { title: "سياسة الخصوصية | أوتوأبلاي السعودية", description: "اطلع على مسودة سياسة الخصوصية في AutoApply SA لمعلومات حملة البحث عن عمل والسيرة الذاتية وحقوق الخصوصية.", path: "/ar/privacy", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/terms": { title: "الشروط والأحكام | أوتوأبلاي السعودية", description: "اقرأ مسودة الشروط والأحكام الخاصة بالمعاينة واستفسار الحملة وتتبع الطلبات وحدود الخدمة.", path: "/ar/terms", lang: "ar", direction: "rtl", locale: "ar_SA" },
  pricing: { title: "Pricing | AutoApply SA", description: "Review provisional Saudi job-application campaign plans and begin with a contact-only discussion.", path: "/pricing", lang: "en", direction: "ltr", locale: "en_SA" },
  services: { title: "Services | Hasan Adam", description: "Explore Saudi-focused job-application support and practical web and operations systems for small businesses.", path: "/services", lang: "en", direction: "ltr", locale: "en_SA" },
  "ar/pricing": { title: "الأسعار | أوتوأبلاي السعودية", description: "اطلع على خطط حملة التقديم الإرشادية وابدأ بمحادثة داخل السعودية.", path: "/ar/pricing", lang: "ar", direction: "rtl", locale: "ar_SA" },
  "ar/services": { title: "الخدمات | Hasan Adam", description: "اطلع على دعم التقديم للوظائف وأنظمة الويب والتشغيل العملية للشركات الصغيرة داخل السعودية.", path: "/ar/services", lang: "ar", direction: "rtl", locale: "ar_SA" },
  ats: { title: "ATS Review | AutoApply SA", description: "Review CV structure, keywords, and evidence for Saudi Arabia job applications with AutoApply SA.", path: "/ats", lang: "en", direction: "ltr", locale: "en_SA" },
};

const staticMeta = (indexHtml, metadata) => {
  const url = `${siteUrl}${metadata.path}`;
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
