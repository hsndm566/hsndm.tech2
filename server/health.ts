export type HealthPayload = {
  status: "healthy";
  service: "AutoApply SA";
  timestamp: number;
  uptime: number;
};

export function createHealthPayload(now = Date.now(), uptime = process.uptime()): HealthPayload {
  return {
    status: "healthy",
    service: "AutoApply SA",
    timestamp: now,
    uptime,
  };
}
