import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const partsDir = path.join(root, "client", "public", "manus-storage", "hero-gemini");
const output = path.join(root, "client", "public", "manus-storage", "autoapply-hero-gemini-clean.mp4");

const partNames = Array.from({ length: 8 }, (_, index) =>
  `part${String(index).padStart(2, "0")}.txt`,
);

const chunks = await Promise.all(
  partNames.map((name) => readFile(path.join(partsDir, name), "utf8")),
);

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, Buffer.from(chunks.join("").replace(/\s+/g, ""), "base64"));

console.log("Built AutoApply hero video:", path.relative(root, output));
