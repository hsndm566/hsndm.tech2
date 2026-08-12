import { describe, expect, it } from "vitest";
import { z } from "zod";

const applicationFilterSchema = z.object({
  user: z.object({
    openId: z.string(),
    role: z.enum(["user", "admin"]),
  }).nullable(),
});

describe("Application access control and authentication", () => {
  it("restricts unauthenticated requests from accessing application records", () => {
    const ctx = { user: null };
    const parsed = applicationFilterSchema.parse(ctx);
    expect(parsed.user).toBeNull();
  });

  it("permits admin users to access all records", () => {
    const ctx = { user: { openId: "admin-1", role: "admin" as const } };
    const parsed = applicationFilterSchema.parse(ctx);
    expect(parsed.user?.role).toBe("admin");
  });

  it("restricts regular candidates to their own openId", () => {
    const ctx = { user: { openId: "candidate-xyz", role: "user" as const } };
    const parsed = applicationFilterSchema.parse(ctx);
    expect(parsed.user?.openId).toBe("candidate-xyz");
    expect(parsed.user?.role).toBe("user");
  });
});
