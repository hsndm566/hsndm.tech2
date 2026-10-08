import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const output = await mkdtemp(join(tmpdir(), "autoapply-static-routes-"));
const index = await readFile(new URL("../client/index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../client/src/App.tsx", import.meta.url), "utf8");

try {
  await writeFile(join(output, "index.html"), index);
  await run(process.execPath, [fileURLToPath(new URL("./prepare-static-routes.mjs", import.meta.url))], {
    env: { ...process.env, AUTOAPPLY_STATIC_OUTPUT_DIR: output },
  });

  const english = await readFile(join(output, "enquire", "index.html"), "utf8");
  const arabic = await readFile(join(output, "ar", "index.html"), "utf8");
  const about = await readFile(join(output, "about", "index.html"), "utf8");
  const contact = await readFile(join(output, "contact", "index.html"), "utf8");

  assert.match(english, /<html lang="en" dir="ltr">/);
  assert.match(english, /Start a Campaign \| AutoApply SA/);
  assert.match(arabic, /<html lang="ar" dir="rtl">/);
  assert.match(arabic, /أخبرنا بالوظائف التي تريدها/);
  assert.doesNotMatch(arabic, /Organise your Saudi job search/);
  assert.doesNotMatch(app, /https:\/\/app\.hsndm\.tech\/login/);
  assert.match(app, /https:\/\/app\.hsndm\.tech\/sign-in/);
  assert.match(app, /\/about/);
  assert.match(app, /\/contact/);
  assert.match(about, /About AutoApply SA \| Saudi Job Search Workspace/);
  assert.match(contact, /Contact AutoApply SA \| Account and Privacy Help/);
  const visibleText = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  assert.ok(visibleText(about).length > 500, "About fallback should remain useful without JavaScript");
  assert.ok(visibleText(contact).length > 500, "Contact fallback should remain useful without JavaScript");

  console.log("Static English/Arabic route fallbacks verified.");
} finally {
  await rm(output, { recursive: true, force: true });
}
