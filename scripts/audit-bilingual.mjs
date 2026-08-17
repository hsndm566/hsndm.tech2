import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourcePaths = {
  english: [resolve(root, "client/src/pages/Home.tsx")],
  arabic: [
    resolve(root, "client/src/pages/ArabicHome.tsx"),
    resolve(root, "client/src/components/arabic/ArabicIntakeSection.tsx"),
    resolve(root, "client/src/components/arabic/ArabicMatchedResults.tsx"),
  ],
};

const readSources = async (paths) => (await Promise.all(paths.map((path) => readFile(path, "utf8")))).join("\n");
const [english, arabic] = await Promise.all([readSources(sourcePaths.english), readSources(sourcePaths.arabic)]);
const sectionIds = (source) => [...source.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]).sort();
const prices = (source) => [...source.matchAll(/price: "(\d+)"/g)].map((match) => match[1]).sort((a, b) => Number(a) - Number(b));
const legacyTerms = /\b(Gulf|UAE|Dubai|Kuwait|Qatar|Bahrain|Oman)\b|three languages|3 languages/i;
const publicValues = ["966571448656", "apply@hsndm.tech", "Jeddah", "Riyadh", "Dammam", "Makkah", "Madinah"];
const containsAll = (source, values) => values.filter((value) => !source.includes(value));

const checks = [
  { name: "matching public section anchors", pass: JSON.stringify(sectionIds(english)) === JSON.stringify(sectionIds(arabic)), details: { english: sectionIds(english), arabic: sectionIds(arabic) } },
  { name: "matching published prices", pass: JSON.stringify(prices(english)) === JSON.stringify(prices(arabic)) && JSON.stringify(prices(english)) === JSON.stringify(["99", "149", "249"]), details: { english: prices(english), arabic: prices(arabic) } },
  { name: "shared Saudi contact and city values", pass: containsAll(english, publicValues).length === 0 && containsAll(arabic, publicValues).length === 0, details: { englishMissing: containsAll(english, publicValues), arabicMissing: containsAll(arabic, publicValues) } },
  { name: "no legacy Gulf-wide geography", pass: !legacyTerms.test(english) && !legacyTerms.test(arabic), details: { englishMatch: english.match(legacyTerms)?.[0] ?? null, arabicMatch: arabic.match(legacyTerms)?.[0] ?? null } },
  { name: "localized Arabic readiness flow", pass: arabic.includes("makeArabicWhatsAppHref") && arabic.includes("لغة التقديم: العربية") && arabic.includes("ملخص الحملة جاهز."), details: "Arabic CV readiness, WhatsApp prefill, and success feedback are present." },
  { name: "private browser-only CV handling", pass: english.includes("readCvText") && arabic.includes("readCvText") && english.includes("Your CV is read on your device") && english.includes("no CV file or text is stored") && arabic.includes("تُقرأ سيرتك على جهازك") && arabic.includes("لا يتم إرسال ملف السيرة أو نصها"), details: "Both routes use local text extraction and communicate the file-privacy boundary." },
];

const report = {
  generatedAt: new Date().toISOString(),
  passed: checks.every((check) => check.pass),
  checks,
};

await writeFile(resolve(root, "bilingual-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
