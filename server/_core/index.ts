import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { registerDataBackupRoutes } from "../dataBackup";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createDatabaseHealthPayload, createHealthPayload } from "../health";

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https:; script-src 'self' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; form-action 'self' https://wa.me");
    }
    if (process.env.NODE_ENV === "production" && (req.secure || req.headers["x-forwarded-proto"] === "https")) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS middleware for production API boundary (Railway & hsndm.tech)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://hsndm.tech",
      "https://www.hsndm.tech",
      "https://dashboard.hsndm.tech",
    ];
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".manus.space") || origin.endsWith(".manus.computer") || origin.startsWith("http://localhost:"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json(createHealthPayload());
  });

  // Database readiness is a separate probe so the ordinary liveness endpoint
  // remains lightweight and no application records are ever exposed.
  app.get("/healthz/db", async (_req, res) => {
    const { checkDatabaseConnection } = await import("../db");
    const connected = await checkDatabaseConnection();
    res.status(connected ? 200 : 503).json(createDatabaseHealthPayload(connected));
  });

  app.get("/v1/campaigns/latest-activity", async (_req, res) => {
    try {
      const { getJobApplications } = await import("../db");
      const apps = await getJobApplications();
      const latest = apps[0];
      if (latest && latest.createdAt) {
        res.status(200).json({ timestamp: new Date(latest.createdAt).getTime() });
        return;
      }
      res.status(200).json({ timestamp: null });
    } catch {
      res.status(200).json({ timestamp: null });
    }
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerDataBackupRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Managed platforms such as Railway route traffic only to their assigned
  // PORT. Do not probe alternate ports in production or the router will see
  // an unhealthy deployment even when this process starts successfully.
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
