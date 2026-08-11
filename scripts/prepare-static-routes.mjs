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
