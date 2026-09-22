import { describe, expect, it } from "vitest";
import packageJson from "../../package.json";

describe("Clerk React runtime compatibility", () => {
  it("keeps React at Clerk's required 19.2 compatibility floor", () => {
    expect(packageJson.dependencies.react).toBe("^19.2.3");
    expect(packageJson.dependencies["react-dom"]).toBe("^19.2.3");
    expect(packageJson.dependencies["@clerk/clerk-react"]).toBe("^5.61.3");
  });
});
