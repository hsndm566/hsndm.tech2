import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  applicationEvidence,
  ApplicationEvidence,
  backupSnapshots,
  candidateCampaignApprovals,
  CandidateCampaignApproval,
  campaignEnquiries,
  campaignReadiness,
  CandidateProfile,
  candidateProfiles,
  InsertApplicationEvidence,
  InsertBackupSnapshot,
  InsertCandidateCampaignApproval,
  InsertCampaignReadiness,
  InsertCampaignEnquiry,
  InsertJobApplication,
  InsertCandidateProfile,
  InsertUser,
  JobApplication,
  jobApplications,
  systemJobs,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Performs a minimal query without returning or logging application data. */
export async function checkDatabaseConnection(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.warn("[Database] Readiness probe failed:", error);
    return false;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCampaignReadiness(record: InsertCampaignReadiness): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Campaign readiness] Database unavailable; preview was not persisted");
    return false;
  }

  await db.insert(campaignReadiness).values(record);
  return true;
}

/** Stores only the fields a visitor reviewed before choosing the secure web contact option. */
export async function createCampaignEnquiry(record: InsertCampaignEnquiry): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(campaignEnquiries).values(record);
    return new Date();
  } catch (error) {
    console.warn("[Campaign enquiry] Could not create secure enquiry:", error);
    return null;
  }
}

/**
 * Candidate isolation is enforced by server-scoped predicates because the active
 * TiDB engine does not provide native PostgreSQL-style RLS policies.
 */
export type ApplicationAccessScope =
  | { kind: "admin" }
  | { kind: "candidate"; candidateOpenId: string };

function applicationScopeWhere(id: number, scope: ApplicationAccessScope) {
  if (scope.kind === "admin") return eq(jobApplications.id, id);
  return and(eq(jobApplications.id, id), eq(jobApplications.candidateOpenId, scope.candidateOpenId));
}

export async function getCandidateJobApplications(candidateOpenId: string): Promise<JobApplication[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Application data is temporarily unavailable.");
  }
  try {
    return await db.select().from(jobApplications).where(eq(jobApplications.candidateOpenId, candidateOpenId)).orderBy(desc(jobApplications.createdAt));
  } catch (error) {
    console.warn("[Database] Failed to fetch job applications:", error);
    throw new Error("Application data is temporarily unavailable.");
  }
}

/** Returns only evidence rows belonging to the authenticated candidate. */
export async function getCandidateApplicationEvidence(candidateOpenId: string): Promise<ApplicationEvidence[]> {
  const db = await getDb();
  if (!db) throw new Error("Application evidence is temporarily unavailable.");
  try {
    return await db
      .select()
      .from(applicationEvidence)
      .where(eq(applicationEvidence.candidateOpenId, candidateOpenId))
      .orderBy(desc(applicationEvidence.capturedAt));
  } catch (error) {
    console.warn("[Database] Failed to fetch application evidence:", error);
    throw new Error("Application evidence is temporarily unavailable.");
  }
}

/** Admin-only callers must opt into the unscoped operational feed explicitly. */
export async function getAllJobApplications(): Promise<JobApplication[]> {
  const db = await getDb();
  if (!db) throw new Error("Application data is temporarily unavailable.");
  try {
    return await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  } catch (error) {
    console.warn("[Database] Failed to fetch job applications:", error);
    throw new Error("Application data is temporarily unavailable.");
  }
}

/**
 * Public live-status reads need only a timestamp. Do not fetch candidate,
 * company, role, or application metadata for the public activity indicator.
 */
export async function getLatestJobApplicationCreatedAt(): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [latest] = await db
      .select({ createdAt: jobApplications.createdAt })
      .from(jobApplications)
      .orderBy(desc(jobApplications.createdAt))
      .limit(1);
    return latest?.createdAt ?? null;
  } catch (error) {
    console.warn("[Database] Failed to fetch latest application activity:", error);
    return null;
  }
}

export async function insertJobApplication(data: InsertJobApplication): Promise<JobApplication | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [result] = await db.insert(jobApplications).values(data);
    const [inserted] = await db.select().from(jobApplications).where(eq(jobApplications.id, result.insertId));
    return inserted || null;
  } catch (error) {
    console.warn("[Database] Failed to insert job application:", error);
    return null;
  }
}

export async function getJobApplicationById(id: number, scope: ApplicationAccessScope): Promise<JobApplication | null> {
  const db = await getDb();
  if (!db) return null;
  const [application] = await db.select().from(jobApplications).where(applicationScopeWhere(id, scope)).limit(1);
  return application ?? null;
}

/** Records compact proof metadata only; duplicate evidence is rejected by the unique application key. */
export async function recordApplicationEvidence(data: InsertApplicationEvidence): Promise<ApplicationEvidence | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [result] = await db.insert(applicationEvidence).values(data);
    const [created] = await db.select().from(applicationEvidence).where(eq(applicationEvidence.id, result.insertId));
    return created ?? null;
  } catch (error) {
    console.warn("[Database] Failed to record application evidence:", error);
    return null;
  }
}

export async function getCandidateProfile(openId: string): Promise<CandidateProfile | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [profile] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.openId, openId));
    if (profile) return profile;
    
    // Default profile if none exists
    const defaultProfile: InsertCandidateProfile = {
      openId,
      fullName: null,
      phone: null,
      preferredSeniority: "Mid-level",
      preferredLanguage: "English",
      openToRemote: false,
      targetCity: "Jeddah",
      targetIndustry: "Technology & Engineering",
      salaryExpectation: "15,000 - 25,000 SAR",
      notifyWhatsApp: true,
      notifyEmail: true,
    };
    await db.insert(candidateProfiles).values(defaultProfile);
    const [created] = await db.select().from(candidateProfiles).where(eq(candidateProfiles.openId, openId));
    return created || null;
  } catch (error) {
    console.warn("[Database] Failed to get/create candidate profile:", error);
    return null;
  }
}

export type CandidateCampaignApprovalInput = Pick<
  InsertCandidateCampaignApproval,
  "openId" | "targetRoles" | "targetCity" | "targetIndustry" | "seniority" | "preferredLanguage" | "openToRemote" | "authorizationConfirmed"
>;

export async function getCandidateCampaignApproval(openId: string): Promise<CandidateCampaignApproval | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [approval] = await db.select().from(candidateCampaignApprovals).where(eq(candidateCampaignApprovals.openId, openId)).limit(1);
    return approval ?? null;
  } catch (error) {
    console.warn("[Database] Failed to fetch candidate campaign approval:", error);
    return null;
  }
}

export async function upsertCandidateCampaignApproval(input: CandidateCampaignApprovalInput): Promise<CandidateCampaignApproval | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const approvedAt = new Date();
    await db.insert(candidateCampaignApprovals).values({ ...input, approvedAt }).onDuplicateKeyUpdate({
      set: {
        targetRoles: input.targetRoles,
        targetCity: input.targetCity,
        targetIndustry: input.targetIndustry,
        seniority: input.seniority,
        preferredLanguage: input.preferredLanguage,
        openToRemote: input.openToRemote,
        authorizationConfirmed: input.authorizationConfirmed,
        approvedAt,
        updatedAt: approvedAt,
      },
    });
    return getCandidateCampaignApproval(input.openId);
  } catch (error) {
    console.warn("[Database] Failed to save candidate campaign approval:", error);
    return null;
  }
}

export type CandidateProfileUpdate = Partial<Omit<InsertCandidateProfile, "openId" | "createdAt" | "updatedAt">>;

export async function updateCandidateProfile(openId: string, data: CandidateProfileUpdate): Promise<CandidateProfile | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.update(candidateProfiles).set(data).where(eq(candidateProfiles.openId, openId));
    return await getCandidateProfile(openId);
  } catch (error) {
    console.warn("[Database] Failed to update candidate profile:", error);
    return null;
  }
}

export type DatabaseBackupPayload = {
  generatedAt: string;
  schemaVersion: 1;
  recordCounts: Record<string, number>;
  data: {
    users: unknown[];
    campaignReadiness: unknown[];
    jobApplications: unknown[];
    candidateProfiles: unknown[];
  };
};

export async function buildDatabaseBackupPayload(): Promise<DatabaseBackupPayload> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable; backup was not created");

  const [userRows, readinessRows, applicationRows, profileRows] = await Promise.all([
    db.select().from(users),
    db.select().from(campaignReadiness),
    db.select().from(jobApplications),
    db.select().from(candidateProfiles),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,
    recordCounts: {
      users: userRows.length,
      campaignReadiness: readinessRows.length,
      jobApplications: applicationRows.length,
      candidateProfiles: profileRows.length,
    },
    data: {
      users: userRows,
      campaignReadiness: readinessRows,
      jobApplications: applicationRows,
      candidateProfiles: profileRows,
    },
  };
}

export async function getBackupSnapshotForPeriod(scheduleTaskUid: string, periodKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable; backup snapshot could not be checked");
  const snapshots = await db
    .select()
    .from(backupSnapshots)
    .where(eq(backupSnapshots.scheduleTaskUid, scheduleTaskUid));
  return snapshots.find(snapshot => snapshot.periodKey === periodKey) ?? null;
}

export async function recordBackupSnapshot(data: InsertBackupSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable; backup snapshot could not be recorded");
  const [result] = await db.insert(backupSnapshots).values(data);
  const [snapshot] = await db.select().from(backupSnapshots).where(eq(backupSnapshots.id, result.insertId));
  return snapshot ?? null;
}

export async function getSystemJobByTaskUid(heartbeatTaskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable; scheduled job could not be checked");
  const [job] = await db.select().from(systemJobs).where(eq(systemJobs.heartbeatTaskUid, heartbeatTaskUid));
  return job ?? null;
}

export async function updateSystemJobRun(taskUid: string, status: "succeeded" | "failed") {
  const db = await getDb();
  if (!db) return;
  await db
    .update(systemJobs)
    .set({ lastRunAt: new Date(), lastStatus: status })
    .where(eq(systemJobs.heartbeatTaskUid, taskUid));
}

export async function updateJobApplication(id: number, scope: ApplicationAccessScope, data: Partial<Omit<InsertJobApplication, "candidateOpenId">>): Promise<JobApplication | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const scopeWhere = applicationScopeWhere(id, scope);
    const [existing] = await db.select().from(jobApplications).where(scopeWhere).limit(1);
    if (!existing) return null;
    await db.update(jobApplications).set({ ...data, updatedAt: new Date() }).where(scopeWhere);
    const [updated] = await db.select().from(jobApplications).where(scopeWhere).limit(1);
    return updated || null;
  } catch (error) {
    console.warn("[Database] Failed to update job application:", error);
    throw error;
  }
}

export async function deleteJobApplication(id: number, scope: ApplicationAccessScope): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const scopeWhere = applicationScopeWhere(id, scope);
    const [existing] = await db.select().from(jobApplications).where(scopeWhere).limit(1);
    if (!existing) return false;
    await db.delete(jobApplications).where(scopeWhere);
    return true;
  } catch (error) {
    console.warn("[Database] Failed to delete job application:", error);
    throw error;
  }
}
