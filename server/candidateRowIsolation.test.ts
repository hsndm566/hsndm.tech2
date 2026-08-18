import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { jobApplications } from "../drizzle/schema";

describe("candidate row-isolation contract", () => {
  it("requires every job application to have an authenticated candidate owner", () => {
    expect(jobApplications.candidateOpenId.notNull).toBe(true);
  });

  it("keeps the ownership constraint and candidate lookup index in the reviewed migration", () => {
    const migration = readFileSync(resolve(process.cwd(), "drizzle/0006_happy_radioactive_man.sql"), "utf8");

    expect(migration).toContain("MODIFY COLUMN `candidateOpenId` varchar(64) NOT NULL");
    expect(migration).toContain("CREATE INDEX `job_applications_candidate_open_id_created_at_idx`");
  });

  it("keeps all-candidate reads behind a separate explicit server helper", () => {
    const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

    expect(dbSource).toContain("getCandidateJobApplications(candidateOpenId: string)");
    expect(dbSource).toContain("getAllJobApplications()");
    expect(dbSource).not.toContain("getJobApplications(candidateOpenId?: string)");
  });
});
