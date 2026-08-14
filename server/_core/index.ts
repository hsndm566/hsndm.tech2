import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { registerDataBackupRoutes } from "../dataBackup";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS middleware for production API boundary (Railway & hsndm.tech)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://hsndm.tech",
      "https://www.hsndm.tech",
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

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
