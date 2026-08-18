import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schemaSource = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("secure campaign enquiry privacy contract", () => {
  it("stores the reviewed contact and targeting fields but no CV artifact", () => {
    const table = schemaSource.slice(schemaSource.indexOf("campaignEnquiries"), schemaSource.indexOf("Job applications tracker"));
    expect(table).toContain("campaignAuthorizationConfirmed");
    expect(table).not.toMatch(/cvText|resume|fileName|document/i);
  });

  it("requires explicit authorization before creating a secure web enquiry", () => {
    expect(routerSource).toContain("campaignAuthorizationConfirmed: z.literal(true)");
    expect(routerSource).toContain("createCampaignEnquiry");
  });
});
