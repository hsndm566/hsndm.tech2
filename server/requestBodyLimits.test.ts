import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/_core/index.ts"), "utf8");

describe("request body limits", () => {
  it("keeps the global parser bounded to the supported CV-text request size", () => {
    expect(source).toContain('const requestBodyLimit = "512kb"');
    expect(source).toContain("express.json({ limit: requestBodyLimit })");
    expect(source).toContain("express.urlencoded({ limit: requestBodyLimit, extended: true })");
    expect(source).not.toContain('limit: "50mb"');
  });
});
