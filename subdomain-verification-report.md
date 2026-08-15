# Subdomain & Cloudflare DNS Verification Report

**Date:** August 15, 2026  
**Domain:** `hsndm.tech`  
**Scope:** Verification of root, www, dashboard, API, and Clerk subdomains across Cloudflare DNS and service routing.

---

## Subdomain Status Table

| Subdomain | Target / Service | Public IP / Edge | HTTP Status | Routing Health & Notes |
|---|---|---|---|---|
| **`hsndm.tech`** (Root) | Main website redirect | `172.67.167.46` (Cloudflare) | **200 OK** | Correctly resolves and redirects/serves `https://www.hsndm.tech/`. |
| **`www.hsndm.tech`** | Main frontend (GitHub Pages) | `104.21.16.90` (Cloudflare) | **200 OK** | Serves the published AutoApply SA production release (`hsndm566/hsndm.tech`), bilingual routes, and cache-busted videos. |
| **`dashboard.hsndm.tech`** | Candidate Dashboard | `172.67.167.46` (Cloudflare) | **404 Not Found** | Resolves to Cloudflare but hits GitHub Pages (404 Site not found) because GitHub Pages expects `www.hsndm.tech`. To serve the dashboard here, its Cloudflare CNAME record should point directly to the managed deployment target (`hsndmstudio-lyaavagg.manus.space`) rather than sharing the root CNAME. |
| **`api.hsndm.tech`** | Backend API | `104.21.16.90` (Cloudflare) | **404 Not Found** | Resolves to Cloudflare but hits GitHub Pages (404). To serve backend API traffic, its DNS record should point to the backend server/service endpoint. |
| **`clerk.hsndm.tech`** | Authentication (Clerk) | `172.64.153.110` (Cloudflare) | **200 OK** | Fully operational and serving Clerk JavaScript assets correctly. |

---

## Action Plan for Subdomain Separation

To ensure `dashboard.hsndm.tech` and `api.hsndm.tech` do not point to GitHub Pages and correctly serve their respective services:
1. **Dashboard (`dashboard.hsndm.tech`):** Update its Cloudflare DNS record to a CNAME pointing to `hsndmstudio-lyaavagg.manus.space` (proxied with orange cloud).
2. **API (`api.hsndm.tech`):** Update its Cloudflare DNS record to point to your backend server/service IP or CNAME.
3. **Main Site (`hsndm.tech` / `www.hsndm.tech`):** Remain untouched and fully operational on GitHub Pages.
