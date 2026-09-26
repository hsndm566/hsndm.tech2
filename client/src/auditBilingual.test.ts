import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..", "..");

describe("bilingual audit source coverage", () => {
  it("audits the deployed V2 English and Arabic surfaces", () => {
    const audit = readFileSync(resolve(root, "scripts/audit-bilingual.mjs"), "utf8");

    expect(audit).toContain("client/src/v2/Landing.tsx");
    expect(audit).toContain("client/src/v2/AuthPage.tsx");
    expect(audit).toContain("client/src/v2/Workspace.tsx");
    expect(audit).toContain("both public routes render the same V2 Landing component");
    expect(audit).toContain("Arabic dashboard status maps cover provider values");
    expect(audit).not.toContain("ArabicHome.tsx");
  });
});
