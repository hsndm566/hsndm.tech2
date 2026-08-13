import { createHash } from "node:crypto";
import type { Express, Request, Response } from "express";
import {
  buildDatabaseBackupPayload,
  getBackupSnapshotForPeriod,
  getSystemJobByTaskUid,
  recordBackupSnapshot,
  updateSystemJobRun,
} from "./db";
import { sdk } from "./_core/sdk";
import { storagePut } from "./storage";

export function getUtcPeriodKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function createDailyBackupForTask(taskUid: string, now = new Date()) {
  const job = await getSystemJobByTaskUid(taskUid);
  if (job?.name !== "daily-data-backup") {
    return { ok: true as const, skipped: "unrecognized-job" as const };
  }

  const periodKey = getUtcPeriodKey(now);
  const existing = await getBackupSnapshotForPeriod(taskUid, periodKey);
  if (existing) {
    return { ok: true as const, skipped: "already-backed-up" as const, backupId: existing.id, periodKey };
  }

  const payload = await buildDatabaseBackupPayload();
  const serialized = JSON.stringify(payload);
  const bytes = Buffer.byteLength(serialized, "utf8");
  const sha256 = createHash("sha256").update(serialized).digest("hex");
  const stored = await storagePut(
    `private-backups/autoapply-sa/database-${periodKey}.json`,
    serialized,
    "application/json"
  );
  const snapshot = await recordBackupSnapshot({
    scheduleTaskUid: taskUid,
    periodKey,
    storageKey: stored.key,
    sha256,
    byteSize: bytes,
    recordCounts: payload.recordCounts,
  });
  await updateSystemJobRun(taskUid, "succeeded");

  return { ok: true as const, backupId: snapshot?.id ?? null, periodKey, recordCounts: payload.recordCounts };
}

export function registerDataBackupRoutes(app: Express) {
  app.post("/api/scheduled/data-backup", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }

      return res.json(await createDailyBackupForTask(user.taskUid));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Data backup] Scheduled snapshot failed", { message });
      const cronUser = await sdk.authenticateRequest(req).catch(() => null);
      if (cronUser?.isCron && cronUser.taskUid) {
        await updateSystemJobRun(cronUser.taskUid, "failed").catch(() => undefined);
      }
      return res.status(500).json({ error: "data-backup-failed", message, timestamp: new Date().toISOString() });
    }
  });
}
