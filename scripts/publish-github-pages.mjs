import { copyFile, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { relative, resolve } from "node:path";

const repository = "hsndm566/hsndm.tech";
const buildRoot = resolve("dist/public");
const managedVideo = resolve("/home/ubuntu/upload/Generate_a_short_looping_backg.mp4");
const publishedVideo = resolve(buildRoot, "manus-storage", "autoapply-sa-loop-bg_7ecfd5bb.mp4");

function ghApi(args, payload) {
  const result = spawnSync("gh", ["api", ...args], {
    encoding: "utf8",
    input: payload ? JSON.stringify(payload) : undefined,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `GitHub API command failed: ${args.join(" ")}`);
  }

  const cleanOutput = result.stdout
    .replace(/\u001B\][^\u0007]*(?:\u0007|\u001B\\)/g, "")
    .replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "")
    .trim();

  return cleanOutput ? JSON.parse(cleanOutput) : null;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(absolutePath);
    return [absolutePath];
  }));

  return files.flat();
}

const branch = ghApi([`repos/${repository}/git/ref/heads/main`]);
await mkdir(resolve(buildRoot, "manus-storage"), { recursive: true });
await copyFile(managedVideo, publishedVideo);
try {
  const files = await collectFiles(buildRoot);
  const tree = [];

  for (const absolutePath of files) {
    const buffer = await readFile(absolutePath);
    const blob = ghApi(
      [`repos/${repository}/git/blobs`, "--method", "POST", "--input", "-"],
      { content: buffer.toString("base64"), encoding: "base64" },
    );

    tree.push({
      path: relative(buildRoot, absolutePath).replaceAll("\\", "/"),
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  const createdTree = ghApi(
    [`repos/${repository}/git/trees`, "--method", "POST", "--input", "-"],
    { base_tree: branch.object.sha, tree },
  );
  const commit = ghApi(
    [`repos/${repository}/git/commits`, "--method", "POST", "--input", "-"],
    {
      message: "feat: publish verified AutoApply SA release assets",
      tree: createdTree.sha,
      parents: [branch.object.sha],
    },
  );

  ghApi(
    [`repos/${repository}/git/refs/heads/main`, "--method", "PATCH", "--input", "-"],
    { sha: commit.sha, force: false },
  );

  console.log(JSON.stringify({ repository, commit: commit.sha, files: files.length }, null, 2));
} finally {
  await rm(publishedVideo, { force: true });
}
