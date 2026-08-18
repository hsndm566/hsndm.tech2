import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("dashboard route registration", () => {
  it("registers each dashboard route exactly once", () => {
    expect(source.match(/path="\/dashboard"/g)).toHaveLength(1);
    expect(source.match(/path="\/dashboard\/settings"/g)).toHaveLength(1);
  });
});
