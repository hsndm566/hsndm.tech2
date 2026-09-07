import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken } from "@clerk/backend";
import { getUserByOpenId, upsertUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const productionAuthorizedParties = ["https://dashboard.hsndm.tech"];
const developmentAuthorizedParties = [
  ...productionAuthorizedParties,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export async function authenticateClerkRequest(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const authorization = req.headers.authorization;
  if (!secretKey || !authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const payload = await verifyToken(token, {
      secretKey,
      authorizedParties: process.env.NODE_ENV === "production"
        ? productionAuthorizedParties
        : developmentAuthorizedParties,
    });
    if (!payload.sub) return null;

    const openId = `clerk:${payload.sub}`.slice(0, 64);
    await upsertUser({ openId, loginMethod: "clerk" });
    return (await getUserByOpenId(openId)) ?? null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await authenticateClerkRequest(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

