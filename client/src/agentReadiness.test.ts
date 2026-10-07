import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { onRequest as markdownMiddleware } from "../../functions/_middleware.js";
import { onRequest as publicApi } from "../../functions/api/v1/[[path]].js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const openapi = JSON.parse(readFileSync(new URL("../public/openapi.json", import.meta.url), "utf8"));
const developerDocs = readFileSync(new URL("../public/developers/index.html", import.meta.url), "utf8");
const deprecationDocs = readFileSync(new URL("../public/developers/deprecation/index.html", import.meta.url), "utf8");

describe("agent readiness content and public API", () => {
  it("provides meaningful homepage copy in the HTML response without JavaScript", () => {
    const fallback = html.match(/<main id="agent-html-fallback"[\s\S]*?<\/main>/)?.[0] || "";
    const text = fallback.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    expect(text.length).toBeGreaterThan(500);
    expect(fallback).toContain("<h1");
    expect(fallback).toContain("<h2");
    expect(fallback).toContain('href="/developers/"');
    expect(app).toContain('href="/developers/"');
  });

  it("publishes accurate organization schema and complete sitemap metadata", () => {
    const schemaText = html.match(/<script type="application\/ld\+json" data-autoapply-schema="site">([\s\S]*?)<\/script>/)?.[1] || "";
    const schema = JSON.parse(schemaText);
    const organization = schema["@graph"].find((entity) => entity["@type"] === "Organization");
    expect(organization.description).toContain("Saudi Arabia");
    expect(organization.address["@type"]).toBe("PostalAddress");
    expect(organization.contactPoint.email).toBeTruthy();
    expect(organization.contactPoint.telephone).toBeTruthy();
    expect(sitemap).toContain("<lastmod>2026-10-07</lastmod>");
    expect(sitemap).toContain("https://www.hsndm.tech/developers/");
    expect(sitemap).not.toMatch(/\/(pricing|services|ats|enquire|how-it-works|support|case-studies|campaign-report-sample)\//);
  });

  it("gives agents specific use guidance and links discoverable developer resources", () => {
    expect(llms).toContain("## When to use AutoApply SA");
    expect(llms).toContain("## Agent guidance");
    expect(llms).toContain("https://www.hsndm.tech/openapi.json");
    expect(developerDocs).toContain('href="/openapi.json"');
    expect(developerDocs).toContain("/api/v1/product");
    expect(developerDocs).toContain("read-only");
    expect(deprecationDocs).toContain("six months");
    expect(deprecationDocs).toContain("Sunset");
  });

  it("publishes a typed, described OpenAPI operation for every public endpoint", () => {
    const operations = Object.values(openapi.paths).map((path) => path.get);
    const operationIds = operations.map((operation) => operation.operationId);
    expect(new Set(operationIds).size).toBe(operationIds.length);
    expect(operations).toHaveLength(3);
    for (const operation of operations) {
      expect(operation.description.length).toBeGreaterThan(30);
      expect(operation.responses["200"].content["application/json"].schema.$ref).toContain("#/components/schemas/");
      expect(operation.responses["200"].headers["RateLimit-Limit"]).toBeTruthy();
    }
  });

  it("negotiates Markdown on the homepage and returns an informative Markdown 404", async () => {
    const htmlResponse = await markdownMiddleware({
      request: new Request("https://www.hsndm.tech/", { headers: { Accept: "text/html" } }),
      next: async () => new Response("<html>home</html>", { headers: { "Content-Type": "text/html", Vary: "Accept-Encoding" } }),
    });
    expect(htmlResponse.headers.get("content-type")).toContain("text/html");
    expect(htmlResponse.headers.get("vary")).toContain("Accept");

    const markdownResponse = await markdownMiddleware({
      request: new Request("https://www.hsndm.tech/", { headers: { Accept: "text/markdown" } }),
      next: async () => new Response("<html>home</html>", { headers: { "Content-Type": "text/html" } }),
    });
    expect(markdownResponse.headers.get("content-type")).toContain("text/markdown");
    expect(markdownResponse.headers.get("vary")).toContain("Accept");
    expect(await markdownResponse.text()).toContain("# AutoApply SA");

    const notFound = await markdownMiddleware({
      request: new Request("https://www.hsndm.tech/not-a-real-page", { headers: { Accept: "text/markdown" } }),
      next: async () => new Response("missing", { status: 404 }),
    });
    expect(notFound.status).toBe(404);
    expect(notFound.headers.get("content-type")).toContain("text/markdown");
    const notFoundText = await notFound.text();
    expect(notFoundText.length).toBeGreaterThan(20);
    expect(notFoundText).toContain("/sitemap.xml");
  });

  it("serves JSON public endpoints with headers and throttles at the documented limit", async () => {
    const request = () => new Request("https://www.hsndm.tech/api/v1/product", { headers: { "cf-connecting-ip": "203.0.113.41" } });
    const first = await publicApi({ request: request() });
    expect(first.status).toBe(200);
    expect(first.headers.get("content-type")).toContain("application/json");
    expect(first.headers.get("ratelimit-limit")).toBe("60");
    expect(JSON.parse(await first.text()).name).toBe("AutoApply SA");
    for (let i = 1; i < 60; i += 1) await publicApi({ request: request() });
    const limited = await publicApi({ request: request() });
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    expect(limited.headers.get("ratelimit-remaining")).toBe("0");
  });

  it("makes the CLI help command executable without a network request", () => {
    const cliPath = new URL("../../packages/autoapply-cli/bin/autoapply.mjs", import.meta.url);
    const result = spawnSync(process.execPath, [cliPath.pathname, "--help"], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("autoapply-sa api product");
  });
});
