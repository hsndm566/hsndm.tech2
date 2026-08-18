import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getPathnameFromRequestUrl, isKnownPublicRoute } from "./publicRoutes";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      const status = isKnownPublicRoute(getPathnameFromRequestUrl(url)) ? 200 : 404;
      res.status(status).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // Serve the SPA shell only for a registered client route. This prevents
  // mistyped pages from looking successful to browsers, crawlers, and monitors.
  app.use("*", (req, res) => {
    const pathname = getPathnameFromRequestUrl(req.originalUrl);
    if (pathname.startsWith("/api/") || pathname.startsWith("/v1/")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const status = isKnownPublicRoute(pathname) ? 200 : 404;
    res.status(status).setHeader("Cache-Control", "no-store");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
