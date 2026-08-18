import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const mainSource = () => readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");

describe("global tRPC error recovery", () => {
  it("records background query and mutation failures without navigating into Manus OAuth", () => {
    const source = mainSource();

    expect(source).toContain('console.error("[API Query Error]", error)');
    expect(source).toContain('console.error("[API Mutation Error]", error)');
    expect(source).not.toContain("redirectToLoginIfUnauthorized");
    expect(source).not.toContain('from "./const"');
    expect(source).not.toContain("startLogin()");
    expect(source).not.toContain("TRPCClientError");
  });
});
