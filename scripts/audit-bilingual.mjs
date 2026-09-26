import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourcePaths = {
  app: resolve(root, "client/src/App.tsx"),
  landing: resolve(root, "client/src/v2/Landing.tsx"),
  auth: resolve(root, "client/src/v2/AuthPage.tsx"),
  workspace: resolve(root, "client/src/v2/Workspace.tsx"),
};

const sources = Object.fromEntries(await Promise.all(
  Object.entries(sourcePaths).map(async ([name, path]) => [name, await readFile(path, "utf8")]),
));
const all = Object.values(sources).join("\n");
const has = (value) => all.includes(value);

const checks = [
  {
    name: "both public routes render the same V2 Landing component",
    pass: sources.app.includes("['','/ar'].flatMap") && sources.app.includes("component={Landing}"),
    details: "App.tsx maps both / and /ar to v2/Landing.tsx.",
  },
  {
    name: "V2 source is audited instead of legacy marketing pages",
    pass: sources.landing.includes("export function Landing") && sources.auth.includes("export function AuthPage") && sources.workspace.includes("export function Workspace") && !sources.app.includes("ArabicHome"),
    details: Object.keys(sourcePaths),
  },
  {
    name: "Saudi-localized Arabic hero and search copy is present",
    pass: ["مسيرتك المهنية. ووجهتك بيدك.", "كل وظيفة تناسبك.", "كل خطواتك في مكان واحد.", "استخرج الكلمات المفتاحية من خبراتك على جهازك.", "مصمّم لبحثك الوظيفي", "بحثك بيدك", "ما وتيرة"].every(has),
    details: "Checks the high-priority landing-page terminology.",
  },
  {
    name: "Arabic dashboard status maps cover provider values",
    pass: ["تم الإرسال", "تم التسليم", "مؤجل", "ارتداد نهائي", "ارتداد مؤقت", "محظور", "إجراء مطلوب", "رد غياب تلقائي"].every(has),
    details: "Dynamic backend enums must not leak into Arabic UI copy.",
  },
  {
    name: "RTL directional arrows are mirrored",
    pass: all.includes("-scale-x-100") && sources.landing.includes("className={ar ? '-scale-x-100' : ''}") && sources.auth.includes("className={ar ? '-scale-x-100' : ''}"),
    details: "Arabic CTAs mirror directional lucide icons.",
  },
  {
    name: "reset-password copy uses a native Arabic action",
    pass: sources.auth.includes("أعد تعيين كلمة المرور."),
    details: "Avoids the literal translated phrase استعد كلمة المرور.",
  },
];

const report = { generatedAt: new Date().toISOString(), passed: checks.every((check) => check.pass), checks };
await writeFile(resolve(root, "bilingual-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
