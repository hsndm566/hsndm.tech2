import { describe, expect, it } from "vitest";
import { isClerkOriginAllowed } from "./clerkOrigin";

describe("Clerk origin allowlist", () => {
  it("permits the verified hsndm.tech production origins", () => {
    expect(isClerkOriginAllowed("hsndm.tech")).toBe(true);
    expect(isClerkOriginAllowed("www.hsndm.tech")).toBe(true);
    expect(isClerkOriginAllowed("dashboard.hsndm.tech")).toBe(true);
  });

  it("blocks managed previews and unrelated hosts from initializing Clerk", () => {
    expect(isClerkOriginAllowed("3000-example.manus.computer")).toBe(false);
    expect(isClerkOriginAllowed("hsndmstudio-lyaavagg.manus.space")).toBe(false);
    expect(isClerkOriginAllowed("example.com")).toBe(false);
  });
});
