import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("@clerk/backend", () => ({ verifyToken: mocks.verifyToken }));
vi.mock("./db", () => ({
  getUserByOpenId: mocks.getUserByOpenId,
  upsertUser: mocks.upsertUser,
}));

import { authenticateClerkRequest } from "./_core/context";

const originalEnv = { ...process.env };

function request(authorization?: string) {
  return { headers: authorization ? { authorization } : {} } as never;
}

describe("Clerk request authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = "sk_live_test";
    process.env.NODE_ENV = "production";
    mocks.verifyToken.mockResolvedValue({ sub: "user_123" });
    mocks.getUserByOpenId.mockResolvedValue({ id: 1, openId: "clerk:user_123" });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("accepts a valid Clerk bearer token for the production dashboard only", async () => {
    await expect(authenticateClerkRequest(request("Bearer session-token"))).resolves.toMatchObject({
      openId: "clerk:user_123",
    });

    expect(mocks.verifyToken).toHaveBeenCalledWith("session-token", {
      secretKey: "sk_live_test",
      authorizedParties: ["https://dashboard.hsndm.tech"],
    });
    expect(mocks.upsertUser).toHaveBeenCalledWith({
      openId: "clerk:user_123",
      loginMethod: "clerk",
    });
  });

  it("does not accept a legacy cookie or a request without Clerk configuration", async () => {
    await expect(authenticateClerkRequest(request())).resolves.toBeNull();
    expect(mocks.verifyToken).not.toHaveBeenCalled();

    delete process.env.CLERK_SECRET_KEY;
    await expect(authenticateClerkRequest(request("Bearer session-token"))).resolves.toBeNull();
    expect(mocks.verifyToken).not.toHaveBeenCalled();
  });

  it("fails closed when Clerk rejects the token", async () => {
    mocks.verifyToken.mockRejectedValueOnce(new Error("invalid token"));
    await expect(authenticateClerkRequest(request("Bearer invalid"))).resolves.toBeNull();
    expect(mocks.upsertUser).not.toHaveBeenCalled();
  });
});

