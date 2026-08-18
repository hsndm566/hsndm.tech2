import { describe, expect, it } from "vitest";
import { isTrustedCorsOrigin } from "./cors";

describe("credentialed CORS origin policy", () => {
  it("allows only the verified public origins in production", () => {
    expect(isTrustedCorsOrigin("https://www.hsndm.tech", "production")).toBe(true);
    expect(isTrustedCorsOrigin("https://dashboard.hsndm.tech", "production")).toBe(true);
    expect(isTrustedCorsOrigin("https://untrusted.manus.space", "production")).toBe(false);
    expect(isTrustedCorsOrigin("https://evil.example", "production")).toBe(false);
  });

  it("permits managed previews and localhost only outside production", () => {
    expect(isTrustedCorsOrigin("https://3000-example.manus.computer", "development")).toBe(true);
    expect(isTrustedCorsOrigin("http://localhost:3000", "development")).toBe(true);
    expect(isTrustedCorsOrigin("https://evil.example", "development")).toBe(false);
  });
});
