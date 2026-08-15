import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const settingsSource = readFileSync(resolve(process.cwd(), "client/src/pages/ProfileSettings.tsx"), "utf8");

describe("candidate profile settings feedback", () => {
  it("provides an explicit Save Changes action and successful-save toast", () => {
    expect(settingsSource).toContain("Save Changes");
    expect(settingsSource).toContain("Save Changes successful");
    expect(settingsSource).toContain("Your candidate preferences are now updated.");
    expect(settingsSource).toContain('label: "Undo"');
    expect(settingsSource).toContain("previousDraftRef.current");
  });
});
