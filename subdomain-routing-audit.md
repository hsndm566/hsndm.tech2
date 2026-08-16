# Subdomain Routing & Credential Audit

**Date:** 16 August 2026  
**Status:** Main public frontend live and verified at `www.hsndm.tech` and `hsndm.tech` via GitHub Pages (`d93feeb`).

## Subdomain Status Summary

| Subdomain | Target Service | Current Status | Notes |
| --- | --- | --- | --- |
| `hsndm.tech` / `www.hsndm.tech` | GitHub Pages Frontend | **Operational (HTTP 200)** | Fully functional, bilingual, verified video looping & responsiveness. |
| `dashboard.hsndm.tech` | Candidate Portal / Managed App | **Pending DNS CNAME** | Resolves to Cloudflare edge; returns HTTP 404 pending DNS record mapping to managed deployment. |
| `api.hsndm.tech` | Railway Backend (`autoapply-sa-production.up.railway.app`) | **Configured on Railway / Pending DNS CNAME** | Railway custom domain is registered (`api.hsndm.tech`), awaiting CNAME pointing to `n3w5sp1z.up.railway.app`. |
| `clerk.hsndm.tech` | Clerk Authentication | **Operational (HTTP 200)** | Active authentication gateway. |

## Credential Diagnostic Findings

- All provided Cloudflare tokens successfully authenticate against `GET /zones` and discover the `hsndm.tech` zone (`f5249271f49ed2d34cb62a00d2ad078a`), confirming zone association.
- However, attempting DNS record reads or writes with these specific tokens returns `HTTP 403 Forbidden` ("Authentication error") because the tokens lack **Zone > DNS > Read/Edit** permissions in the Cloudflare dashboard.
- R2 S3 storage credentials and endpoint checks confirmed connection attempts, but DNS record manipulation requires DNS edit permissions on the Cloudflare token itself.

## Recommended Final Action

To instantly activate `dashboard.hsndm.tech` and `api.hsndm.tech`:
1. In the Cloudflare Dashboard for `hsndm.tech` under **API Tokens**, generate or edit a token with **Zone > DNS > Edit** permissions for the `hsndm.tech` zone.
2. Create two CNAME records:
   - `api` → `n3w5sp1z.up.railway.app` (DNS only or proxied)
   - `dashboard` → `hsndmstudio-lyaavagg.manus.space` (or verified managed deployment target)
