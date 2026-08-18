import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A voluntary campaign-preview record. It intentionally excludes CV file bytes and CV text:
 * document extraction remains in the visitor's browser unless they separately choose WhatsApp.
 */
export const campaignReadiness = mysqlTable("campaign_readiness", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 64 }).notNull(),
  industry: varchar("industry", { length: 64 }).notNull(),
  seniority: varchar("seniority", { length: 32 }).notNull(),
  language: varchar("language", { length: 16 }).notNull(),
  targetRoles: json("targetRoles").$type<string[]>().notNull(),
  primaryField: varchar("primaryField", { length: 100 }).notNull(),
  cvReadable: boolean("cvReadable").notNull(),
  consented: boolean("consented").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InsertCampaignReadiness = typeof campaignReadiness.$inferInsert;

/**
 * Job applications tracker for monitoring submissions made on behalf of candidates.
 */
export const jobApplications = mysqlTable("job_applications", {
  id: int("id").autoincrement().primaryKey(),
  candidateOpenId: varchar("candidateOpenId", { length: 64 }),
  candidateName: varchar("candidateName", { length: 120 }).notNull(),
  candidateEmail: varchar("candidateEmail", { length: 320 }),
  candidatePhone: varchar("candidatePhone", { length: 64 }),
  companyName: varchar("companyName", { length: 150 }).notNull(),
  roleTitle: varchar("roleTitle", { length: 150 }).notNull(),
  city: varchar("city", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["queued", "applied", "interview", "offer", "skipped"]).default("applied").notNull(),
  channel: varchar("channel", { length: 64 }).default("email-portal").notNull(),
  notes: text("notes"),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;

export const campaignSignals = mysqlTable("campaign_signals", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  signalType: varchar("signalType", { length: 64 }).notNull(),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  message: text("message").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
});

export type CampaignSignal = typeof campaignSignals.$inferSelect;
export type InsertCampaignSignal = typeof campaignSignals.$inferInsert;

/**
 * Candidate profile settings for Saudi target cities, salary, and notifications.
 */
export const candidateProfiles = mysqlTable("candidate_profiles", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  fullName: varchar("fullName", { length: 120 }),
  phone: varchar("phone", { length: 64 }),
  preferredSeniority: varchar("preferredSeniority", { length: 32 }).default("Mid-level").notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 16 }).default("English").notNull(),
  openToRemote: boolean("openToRemote").default(false).notNull(),
  targetCity: varchar("targetCity", { length: 64 }).default("Jeddah").notNull(),
  targetIndustry: varchar("targetIndustry", { length: 64 }).default("Technology & Engineering").notNull(),
  salaryExpectation: varchar("salaryExpectation", { length: 64 }).default("15,000 - 25,000 SAR").notNull(),
  resumeFileName: varchar("resumeFileName", { length: 255 }),
  resumeSummary: text("resumeSummary"),
  notifyWhatsApp: boolean("notifyWhatsApp").default(true).notNull(),
  notifyEmail: boolean("notifyEmail").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type InsertCandidateProfile = typeof candidateProfiles.$inferInsert;

/**
 * Metadata for private, application-controlled database snapshots. The JSON
 * payload itself is stored in private object storage, never in a database row.
 */
export const backupSnapshots = mysqlTable("backup_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  scheduleTaskUid: varchar("scheduleTaskUid", { length: 65 }).notNull(),
  periodKey: varchar("periodKey", { length: 10 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  byteSize: int("byteSize").notNull(),
  recordCounts: json("recordCounts").$type<Record<string, number>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  backupSnapshotSchedulePeriodIdx: uniqueIndex("backup_snapshot_schedule_period_idx").on(table.scheduleTaskUid, table.periodKey),
}));

export type BackupSnapshot = typeof backupSnapshots.$inferSelect;
export type InsertBackupSnapshot = typeof backupSnapshots.$inferInsert;

/** Durable ownership record for project-level scheduled operations. */
export const systemJobs = mysqlTable("system_jobs", {
  name: varchar("name", { length: 100 }).primaryKey(),
  heartbeatTaskUid: varchar("heartbeatTaskUid", { length: 65 }).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  lastStatus: varchar("lastStatus", { length: 32 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemJob = typeof systemJobs.$inferSelect;
