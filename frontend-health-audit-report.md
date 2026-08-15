# Comprehensive Frontend Health Check Report: hsndm.tech & dashboard.hsndm.tech

**Date:** August 15, 2026  
**Scope:** Read-only inspection of frontend hosting, DNS, TLS termination, response codes, page payloads, and subdomain routing.

---

## Executive Summary

1. **`hsndm.tech` & `www.hsndm.tech` (Main Public Website):** **FULLY HEALTHY & SERVING**
   - Resolves via Cloudflare and successfully serves the published AutoApply SA production bundle from GitHub Pages (`hsndm566/hsndm.tech`).
   - Returns HTTP 200 with complete HTML, valid meta tags, bilingual support, and cache-busted video streaming assets (`video/mp4`).
   - Apex domain `hsndm.tech` correctly redirects/resolves to `www.hsndm.tech`.

2. **`dashboard.hsndm.tech` (Candidate Dashboard):** **PENDING CUSTOM DOMAIN BINDING**
   - Resolves through Cloudflare, but currently points to the same GitHub Pages target as the root domain (returning HTTP 404 "Site not found" from GitHub Pages).
   - As documented in previous sessions, the candidate dashboard frontend is built and routed within the managed application (`hsndmstudio-lyaavagg.manus.space/dashboard`), but `dashboard.hsndm.tech` requires its custom CNAME target configured in the platform's Domain Settings to serve live traffic independently of GitHub Pages.

---

## Detailed Probing Results

| Hostname | Target / Service | HTTP Status | Response Type / Snippet | Status |
|---|---|---|---|---|
| **`https://hsndm.tech`** | Apex Root | **200 OK** | Redirects to `https://www.hsndm.tech/`, serving full AutoApply SA landing page HTML. | ✅ **Operational** |
| **`https://www.hsndm.tech`** | GitHub Pages (`hsndm566/hsndm.tech`) | **200 OK** | Serves full landing page bundle, bilingual routes (`/ar/`, `/ats/`, `/enquire/`), and cache-busted MP4 videos. | ✅ **Operational** |
| **`https://dashboard.hsndm.tech`** | Candidate Portal Subdomain | **404 Not Found** | Returns GitHub Pages 404 ("Site not found") because CNAME/hosting target is not yet bound on the managed deployment. | ⚠️ **Pending External Binding** |

---

## Next Steps for Dashboard Subdomain
To bring `dashboard.hsndm.tech` live:
1. Open the managed project dashboard settings (or platform custom-domain configuration).
2. Enter `dashboard.hsndm.tech` as the custom domain.
3. Update the DNS CNAME record for `dashboard` in Cloudflare to point to the exact target provided by the platform.
