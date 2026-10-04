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

try {
  await writeFile(join(output, "index.html"), index);
  await run(process.execPath, [fileURLToPath(new URL("./prepare-static-routes.mjs", import.meta.url))], {
    env: { ...process.env, AUTOAPPLY_STATIC_OUTPUT_DIR: output },
  });

  const english = await readFile(join(output, "enquire", "index.html"), "utf8");
  const arabic = await readFile(join(output, "ar", "index.html"), "utf8");

  assert.match(english, /<html lang="en" dir="ltr">/);
  assert.match(english, /Start a Campaign \| AutoApply SA/);
  assert.match(arabic, /<html lang="ar" dir="rtl">/);
  assert.match(arabic, /أخبرنا بالوظائف التي تريدها/);
  assert.doesNotMatch(arabic, /Organise your Saudi job search/);

  console.log("Static English/Arabic route fallbacks verified.");
} finally {
  await rm(output, { recursive: true, force: true });
}
