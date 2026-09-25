import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, useSession } from "./auth";

export type Profile = {
  user_id: string;
  fullName: string;
  targetCity: string;
  targetRole?: string | null;
  targetIndustry: string;
  experienceLevel?: string | null;
  preferredLanguage: "English" | "Arabic";
  openToRemote: boolean;
  resumeFileName?: string | null;
  resumeSummary?: string | null;
  resumeStoragePath?: string | null;
  resumeMimeType?: string | null;
  resumeSizeBytes?: number | null;
};

export type Application = {
  id: string;
  user_id: string;
  companyName: string;
  roleTitle: string;
  city: string;
  status: "queued" | "applied" | "interview" | "offer" | "rejected" | "skipped";
  appliedAt: string | null;
  updatedAt: string;
  createdAt: string;
  recipientEmail?: string | null;
  deliveryStatus?: "unknown" | "sent" | "delivered" | "deferred" | "hard_bounce" | "soft_bounce" | "blocked" | string;
  responseStatus?: "none" | "action_required" | "out_of_office" | string;
  responseNote?: string | null;
  responseUrl?: string | null;
  source?: string;
  sourceUrl?: string | null;
  providerMessageId?: string | null;
  cvStoragePath?: string | null;
  jobId?: string | null;
};

function client() {
  if (!supabase) throw new Error("Account service unavailable");
  return supabase;
}

export function useWorkspaceData() {
  const { session } = useSession();
  const id = session?.user.id;
  const cache = useQueryClient();
  const profileKey = ["v2", id, "profile"];
  const appsKey = ["v2", id, "applications"];

  const profile = useQuery({
    queryKey: profileKey,
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const { data, error } = await client().from("v2_profiles").select("*").eq("user_id", id!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const apps = useQuery({
    queryKey: appsKey,
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const { data, error } = await client().from("v2_applications").select("*").eq("user_id", id!).order("updatedAt", { ascending: false });
      if (error) throw error;
      return data as Application[];
    },
  });

  const saveProfile = useMutation({
    mutationFn: async (input: Omit<Profile, "user_id">) => {
      if (!id) throw new Error("Sign in required");
      const { error } = await client().from("v2_profiles").upsert({ ...input, user_id: id }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => cache.invalidateQueries({ queryKey: profileKey }),
  });

  const create = useMutation({
    mutationFn: async (input: Pick<Application, "companyName" | "roleTitle" | "city"> & { status?: Application["status"] }) => {
      if (!id) throw new Error("Sign in required");
      const status = input.status || "queued";
      const { error } = await client().from("v2_applications").insert({
        ...input,
        user_id: id,
        status,
        ...(status === "applied" ? { appliedAt: new Date().toISOString() } : {}),
      });
      if (error) throw error;
    },
    onSuccess: () => cache.invalidateQueries({ queryKey: appsKey }),
  });

  const update = useMutation({
    mutationFn: async (input: { id: string; status: Application["status"] }) => {
      if (!id) throw new Error("Sign in required");
      const row = apps.data?.find(record => record.id === input.id);
      if (!row) throw new Error("Application unavailable");
      const { error } = await client()
        .from("v2_applications")
        .update({
          status: input.status,
          updatedAt: new Date().toISOString(),
          ...(input.status === "applied" && !row.appliedAt ? { appliedAt: new Date().toISOString() } : {}),
        })
        .eq("id", input.id)
        .eq("user_id", id);
      if (error) throw error;
    },
    onSuccess: () => cache.invalidateQueries({ queryKey: appsKey }),
  });

  const claimAccess = useMutation({
    mutationFn: async (code: string) => {
      if (!id) throw new Error("Sign in required");
      const { data, error } = await client().rpc("claim_candidate_access", { p_code: code.trim() });
      if (error) throw error;
      return data as { ok: boolean; applications: number; name: string };
    },
    onSuccess: async () => {
      await Promise.all([
        cache.invalidateQueries({ queryKey: profileKey }),
        cache.invalidateQueries({ queryKey: appsKey }),
      ]);
    },
  });

  return { profile, apps, saveProfile, create, update, claimAccess, clear: () => cache.clear() };
}

export function saudiWeekStart(now = new Date()) {
  const local = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  local.setUTCDate(local.getUTCDate() - local.getUTCDay());
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - 3 * 60 * 60 * 1000);
}
