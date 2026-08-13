import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  buildDatabaseBackupPayload: vi.fn(),
  getBackupSnapshotForPeriod: vi.fn(),
  getSystemJobByTaskUid: vi.fn(),
  recordBackupSnapshot: vi.fn(),
  storagePut: vi.fn(),
  updateSystemJobRun: vi.fn(),
}));

vi.mock("./db", () => ({
  buildDatabaseBackupPayload: mocks.buildDatabaseBackupPayload,
  getBackupSnapshotForPeriod: mocks.getBackupSnapshotForPeriod,
  getSystemJobByTaskUid: mocks.getSystemJobByTaskUid,
  recordBackupSnapshot: mocks.recordBackupSnapshot,
  updateSystemJobRun: mocks.updateSystemJobRun,
}));

vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: vi.fn() } }));

import { createDailyBackupForTask, getUtcPeriodKey } from "./dataBackup";

describe("data backup snapshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSystemJobByTaskUid.mockResolvedValue({ name: "daily-data-backup" });
  });

  it("uses a stable UTC period key", () => {
    expect(getUtcPeriodKey(new Date("2026-08-13T23:59:59.000Z"))).toBe("2026-08-13");
  });

  it("creates one private snapshot per task and calendar day", async () => {
    mocks.getBackupSnapshotForPeriod.mockResolvedValue(null);
    mocks.buildDatabaseBackupPayload.mockResolvedValue({
      generatedAt: "2026-08-13T03:00:00.000Z",
      schemaVersion: 1,
      recordCounts: { users: 2, campaignReadiness: 1, jobApplications: 0, candidateProfiles: 0 },
      data: { users: [], campaignReadiness: [], jobApplications: [], candidateProfiles: [] },
    });
    mocks.storagePut.mockResolvedValue({ key: "private-backups/snapshot.json" });
    mocks.recordBackupSnapshot.mockResolvedValue({ id: 42 });

    const result = await createDailyBackupForTask("task-1", new Date("2026-08-13T03:00:00.000Z"));

    expect(result).toMatchObject({ ok: true, backupId: 42, periodKey: "2026-08-13" });
    expect(mocks.storagePut).toHaveBeenCalledWith(
      "private-backups/autoapply-sa/database-2026-08-13.json",
      expect.any(String),
      "application/json"
    );
    expect(mocks.recordBackupSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      scheduleTaskUid: "task-1",
      periodKey: "2026-08-13",
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
    expect(mocks.updateSystemJobRun).toHaveBeenCalledWith("task-1", "succeeded");
  });

  it("does not create a second snapshot for an already-backed-up day", async () => {
    mocks.getBackupSnapshotForPeriod.mockResolvedValue({ id: 9 });

    const result = await createDailyBackupForTask("task-1", new Date("2026-08-13T04:00:00.000Z"));

    expect(result).toMatchObject({ ok: true, skipped: "already-backed-up", backupId: 9 });
    expect(mocks.storagePut).not.toHaveBeenCalled();
    expect(mocks.recordBackupSnapshot).not.toHaveBeenCalled();
  });
});
