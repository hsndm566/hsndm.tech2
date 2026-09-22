import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");

describe("first-paint reliability shell", () => {
  it("ships a branded immediate loading shell before React initializes", () => {
    const html = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");

    expect(html).toContain('id="app-loading-shell"');
    expect(html).toContain("A smarter way to run your job search in Saudi Arabia.");
    expect(html).toContain("Nothing is submitted until you approve it.");
  });

  it("keeps the public hero promise approval-led in both languages", () => {
    const hero = readFileSync(resolve(projectRoot, "client/src/components/SaudiHero.tsx"), "utf8");

    expect(hero).toContain("A smarter way to run your job search in");
    expect(hero).toContain("Built for focused candidates across Saudi Arabia");
    expect(hero).toContain("طريقة أذكى لإدارة بحثك عن عمل في");
    expect(hero).toContain("مصمّم للمرشحين المركّزين في أنحاء السعودية");
  });
});
