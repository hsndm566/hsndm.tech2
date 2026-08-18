import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { candidateCampaignApprovals } from "../drizzle/schema";

describe("candidate campaign approval contract", () => {
  it("requires an account owner and explicit authorization", () => {
    expect(candidateCampaignApprovals.openId.notNull).toBe(true);
    expect(candidateCampaignApprovals.authorizationConfirmed.notNull).toBe(true);
  });

  it("keeps the reviewed additive migration free of CV and job-submission storage", () => {
    const migration = readFileSync(resolve(process.cwd(), "drizzle/0009_steady_ozymandias.sql"), "utf8");
    expect(migration).toContain("UNIQUE(`openId`)");
    expect(migration).toContain("candidate_campaign_approvals_updated_idx");
    expect(migration).not.toMatch(/cv|resume|document|file|employer|submission|applicationId/i);
  });
});
