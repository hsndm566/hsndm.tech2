# Comprehensive Health Check Report: api.hsndm.tech

**Date:** August 15, 2026  
**Target:** `api.hsndm.tech`  
**Scope:** Read-only inspection of DNS resolution, TLS termination, HTTP response payloads, headers, latency, and service routing.

---

## Executive Summary

The health check confirms that **`api.hsndm.tech`** currently points to Cloudflare proxy IPs (`172.67.167.46` / `104.21.16.90`) sharing the same DNS configuration as `hsndm.tech` and `dashboard.hsndm.tech`. Consequently, requests to `https://api.hsndm.tech/` are being routed to **GitHub Pages** (returning `x-github-request-id` and the standard GitHub Pages 404 "Site not found" page). 

The backend API service (Express/tRPC) is active and healthy on the managed development and server environment, but it has **not** been assigned a dedicated DNS record or reverse-proxy routing rule pointing to a cloud backend provider (such as Railway, Render, or a VM IP). 

---

## Detailed Probing Results

| Check / Probe | Result | Details |
|---|---|---|
| **DNS Resolution** | **Resolved** | Resolves to Cloudflare Anycast IPs (`172.67.167.46`, `104.21.16.90`), matching the root and dashboard domains. |
| **TLS / SSL** | **Valid (Google Trust Services)** | Valid wildcard/apex certificate for `hsndm.tech`, valid through November 13, 2026. Handshake negotiated successfully over TLS v1.3. |
| **HTTP Routing** | **Misrouted (GitHub Pages 404)** | Returns HTTP 404 with GitHub Pages headers (`x-github-request-id: 4F18...`, title: "Site not found · GitHub Pages"). |
| **API Endpoints (`/healthz`, `/api/trpc/...`)** | **Unreachable via `api.hsndm.tech`** | Returns GitHub Pages 404 because no backend server is bound to this subdomain in DNS. |
| **Latency** | **~1.7s to 2.2s** | Cloudflare edge response latency. |

---

## Architectural Finding & Recommendation

1. **Service Separation Requirement:** As noted in the prompt, the backend API (`api.hsndm.tech`) and dashboard (`dashboard.hsndm.tech`) must be separate services and must **not** serve the same frontend or default to GitHub Pages.
2. **Action Required:** 
   - Deploy or designate the persistent backend server (e.g., on Railway, Render, or a dedicated VPS).
   - Create a dedicated DNS record in Cloudflare for **`api.hsndm.tech`** pointing to that backend's public IP or CNAME target (with DNS-only or proxied mode configured correctly for API traffic).
   - Verify that `https://api.hsndm.tech/healthz` returns the JSON health payload (`{ "status": "healthy", "service": "AutoApply SA", ... }`) rather than a GitHub Pages 404 page.
