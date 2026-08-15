# Railway & Subdomain Integration Audit Report

**Date:** August 15, 2026  
**Railway Project:** `gentle-nourishment` (`233206dc-650b-48a9-a693-b427aa5beb98`)  
**Backend Service:** `autoapply-sa` (`2b5b9da6-e667-47b4-baaa-3cc2afe0eda6`)  
**Public Railway URL:** `autoapply-sa-production.up.railway.app`

---

## Executive Summary

1. **Railway Backend Status:**
   - The Railway backend service `autoapply-sa` is fully deployed and active at **`https://autoapply-sa-production.up.railway.app`**.
   - Environment variables (including database storage, Notion token, Telegram bot token, Gmail credentials, and DeepSeek/Nvidia API keys) are fully provisioned.

2. **Subdomain Integration Strategy (`hsndm.tech`):**
   - **`www.hsndm.tech` / `hsndm.tech`:** Serves the lightning-fast static marketing frontend and CV scanner via GitHub Pages (`hsndm566/hsndm.tech`).
   - **`api.hsndm.tech`:** Should be configured in Cloudflare as a CNAME pointing to **`autoapply-sa-production.up.railway.app`** (with Cloudflare proxy enabled or DNS-only). This directly connects your custom domain API endpoint to your Railway backend server.
   - **`dashboard.hsndm.tech`:** Can be pointed via CNAME to your managed deployment (`hsndmstudio-lyaavagg.manus.space`) or hosted directly on Railway depending on preference.
   - **`clerk.hsndm.tech`:** Already correctly configured in Cloudflare and serving authentication traffic.

---

## Action Plan to Finalize Subdomain Connections
1. **Connect API:** In Cloudflare DNS, set **`api.hsndm.tech`** CNAME → **`autoapply-sa-production.up.railway.app`** (Proxied).
2. **Connect Dashboard:** In Cloudflare DNS, set **`dashboard.hsndm.tech`** CNAME → **`hsndmstudio-lyaavagg.manus.space`** (Proxied).
3. **Verify:** Once updated, `https://api.hsndm.tech/` will route directly to your Railway backend server.
