#!/usr/bin/env node
const API_BASE = (process.env.AUTOAPPLY_API_URL || "https://www.hsndm.tech/api/v1").replace(/\/+$/, "");
const HELP = `AutoApply SA CLI (public, read-only)

Usage:
  autoapply-sa api health
  autoapply-sa api product
  autoapply-sa api plans
  autoapply-sa --help

Options:
  --base-url URL   Use another compatible API base URL
  --help           Show this help
`;
const args = process.argv.slice(2);
let baseUrl = API_BASE;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--base-url" && args[i + 1]) {
    baseUrl = args[i + 1].replace(/\/+$/, "");
    args.splice(i, 2);
    i -= 1;
  }
}
if (args.includes("--help") || args[0] === "help" || args.length === 0) {
  process.stdout.write(HELP);
  process.exit(0);
}
const endpoint = args[0] === "api" ? args[1] : undefined;
if (!["health", "product", "plans"].includes(endpoint)) {
  process.stderr.write("Unknown command. Run autoapply-sa --help.\n");
  process.exit(2);
}
try {
  const response = await fetch(`${baseUrl}/${endpoint}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
  const body = await response.text();
  if (!response.ok) {
    process.stderr.write(`API request failed with HTTP ${response.status}: ${body}\n`);
    process.exit(1);
  }
  process.stdout.write(body.endsWith("\n") ? body : `${body}\n`);
} catch (error) {
  process.stderr.write(`Could not reach the AutoApply SA public API: ${error.message}\n`);
  process.exit(1);
}
