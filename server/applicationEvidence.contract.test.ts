import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { applicationEvidence } from "../drizzle/schema";

describe("application evidence contract", () => {
  it("requires both an application reference and candidate owner", () => {
    expect(applicationEvidence.applicationId.notNull).toBe(true);
    expect(applicationEvidence.candidateOpenId.notNull).toBe(true);
  });

  it("uses a single compact evidence record per tracked application", () => {
    const migration = readFileSync(resolve(process.cwd(), "drizzle/0008_flippant_trish_tilby.sql"), "utf8");
    expect(migration).toContain("UNIQUE(`applicationId`)");
    expect(migration).toContain("application_evidence_candidate_idx");
    expect(migration).not.toMatch(/cv|resume|document|file|payload/i);
  });
});
