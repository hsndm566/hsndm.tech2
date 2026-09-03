const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
 const browser = await chromium.launch({ channel: "msedge", headless: true });
 const page = await browser.newPage();
 for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ["/", "/ar"]) {
   await page.goto("http://127.0.0.1:5173" + route);
   await page.locator(".saudi-workspace").waitFor();
   await page.screenshot({ path: "redesign-" + width + (route === "/" ? "-en" : "-ar") + ".png" });
   const state = await page.evaluate(() => ({
    lang: document.documentElement.lang, dir: document.documentElement.dir,
    overflow: document.documentElement.scrollWidth > innerWidth,
    heading: document.querySelector("h1")?.textContent,
    background: getComputedStyle(document.querySelector(".saudi-hero")).backgroundColor
   }));
   if (state.overflow) throw new Error("Horizontal overflow: " + width + route);
   console.log(JSON.stringify({ width, route, ...state }));
   await page.locator(".saudi-primary").click();
   if (!page.url().endsWith("#pricing")) throw new Error("Pricing link failed");
  }
 }
 await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
