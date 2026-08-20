export type HealthPayload = {
  status: "healthy";
  service: "AutoApply SA";
  timestamp: number;
  uptime: number;
};

export type DatabaseHealthPayload = {
  status: "healthy" | "unhealthy";
  dependency: "database";
  timestamp: number;
};

export type AuthenticationReadinessPayload = {
  status: "healthy" | "unhealthy";
  dependency: "dashboard-auth-configuration";
  timestamp: number;
};

export function createHealthPayload(now = Date.now(), uptime = process.uptime()): HealthPayload {
  return {
    status: "healthy",
    service: "AutoApply SA",
    timestamp: now,
    uptime,
  };
}

export function createDatabaseHealthPayload(connected: boolean, now = Date.now()): DatabaseHealthPayload {
  return {
    status: connected ? "healthy" : "unhealthy",
    dependency: "database",
    timestamp: now,
  };
}

export function createAuthenticationReadinessPayload(configured: boolean, now = Date.now()): AuthenticationReadinessPayload {
  return {
    status: configured ? "healthy" : "unhealthy",
    dependency: "dashboard-auth-configuration",
    timestamp: now,
  };
}
