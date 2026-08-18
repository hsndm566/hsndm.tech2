import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { candidateProfiles } from "../drizzle/schema";

describe("candidate profile timestamp contract", () => {
  it("defines a defaulted creation timestamp alongside the update timestamp", () => {
    expect(candidateProfiles.createdAt).toBeDefined();
    expect(candidateProfiles.updatedAt).toBeDefined();
  });

  it("backfills existing records from updatedAt before making creation time required", () => {
    const migration = readFileSync(resolve(process.cwd(), "drizzle/0005_legal_luke_cage.sql"), "utf8");

    expect(migration).toContain("ADD `createdAt` timestamp NULL");
    expect(migration).toContain("SET `createdAt` = `updatedAt`");
    expect(migration).toContain("MODIFY COLUMN `createdAt` timestamp DEFAULT (now()) NOT NULL");
  });
});
