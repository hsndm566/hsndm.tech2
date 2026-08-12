import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { campaignReadiness, InsertCampaignReadiness, InsertUser, users } from "../drizzle/schema";
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

import { jobApplications, InsertJobApplication, JobApplication } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export async function getJobApplications(candidateOpenId?: string): Promise<JobApplication[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    if (candidateOpenId) {
      return await db.select().from(jobApplications).where(eq(jobApplications.candidateOpenId, candidateOpenId)).orderBy(desc(jobApplications.createdAt));
    }
    return await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  } catch (error) {
    console.warn("[Database] Failed to fetch job applications:", error);
    return [];
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
