import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const mainSource = () => readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
const providerSource = () => readFileSync(resolve(process.cwd(), "client/src/components/DataClientProviders.tsx"), "utf8");

describe("global tRPC error recovery", () => {
  it("records background query and mutation failures without navigating into Manus OAuth", () => {
    const source = mainSource();
    const provider = providerSource();

    expect(provider).toContain('console.error("[API Query Error]", event.query.state.error)');
    expect(provider).toContain('console.error("[API Mutation Error]", event.mutation.state.error)');
    expect(provider).not.toContain("redirectToLoginIfUnauthorized");
    expect(provider).not.toContain("startLogin()");
    expect(provider).not.toContain("TRPCClientError");
    expect(source).toContain('lazy(() => import("./components/DataClientProviders")');
  });
});
