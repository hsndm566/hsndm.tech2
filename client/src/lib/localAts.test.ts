import { describe, expect, it } from "vitest";
import { createLocalAtsReview } from "./localAts";

describe("local ATS fallback", () => {
  it("returns an evidence-based bounded review without inventing credentials", () => {
    const review = createLocalAtsReview(
      "Amina@example.com. Experience: Software Engineer. Skills: TypeScript, React, SQL. Improved response time by 25%.",
      "Software Engineer · Technology · Jeddah",
    );

    expect(review.score).toBeGreaterThanOrEqual(35);
    expect(review.score).toBeLessThanOrEqual(92);
    expect(review.strengths.join(" ")).toMatch(/email|section|skill|target/i);
    expect(review.disclaimer).toMatch(/local, rule-based preview/i);
    expect(review.optimizedBullets).toHaveLength(3);
  });
});
