import type { Request } from "express";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export type V2AuthenticatedRequest = {
  token: string;
  user: User;
  client: SupabaseClient;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function getBearerToken(req: Pick<Request, "headers">) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token || null;
}

export async function authenticateV2Request(req: Pick<Request, "headers">): Promise<V2AuthenticatedRequest | null> {
  const config = getSupabaseConfig();
  const token = getBearerToken(req);
  if (!config || !token) return null;

  try {
    const client = createClient(config.url, config.key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user || !data.user.email_confirmed_at) return null;
    return { token, user: data.user, client };
  } catch {
    return null;
  }
}

export function safeAttachmentName(name: string) {
  const cleaned = name.replace(/[\\/\r\n"]/g, "_").trim().slice(0, 180);
  return cleaned || "CV.pdf";
}
