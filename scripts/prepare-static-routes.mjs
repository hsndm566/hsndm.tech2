import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("dist/public");
const indexPage = resolve(output, "index.html");
const directRoutes = ["ar", "enquire", "thank-you"];

await Promise.all(directRoutes.map(async (route) => {
  const routeDirectory = resolve(output, route);
  await mkdir(routeDirectory, { recursive: true });
  await cp(indexPage, resolve(routeDirectory, "index.html"));
}));

await cp(indexPage, resolve(output, "404.html"));
