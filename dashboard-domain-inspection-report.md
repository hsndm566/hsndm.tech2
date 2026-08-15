# GitHub Pages Custom-Domain Inspection Report: dashboard.hsndm.tech

**Date:** August 15, 2026  
**Repository:** `hsndm566/hsndm.tech`  
**Scope:** Read-only inspection of GitHub Pages configuration, CNAME file, and custom domain bindings.

---

## Executive Summary

1. **GitHub Pages Custom Domain Setting:**
   - The GitHub Pages API for `hsndm566/hsndm.tech` currently has `"cname": "www.hsndm.tech"` registered.
   - The repository's `CNAME` file contains `www.hsndm.tech`.
   - GitHub Pages enforces a **one custom domain per repository** limit on standard GitHub Pages setups. Because `www.hsndm.tech` is registered as the custom domain for `hsndm.tech`, GitHub Pages rejects or drops traffic arriving at `dashboard.hsndm.tech` unless a separate repository or dedicated hosting service (such as the managed Manus deployment) handles the dashboard subdomain.

2. **Why `dashboard.hsndm.tech` Returns 404:**
   - When requests hit `dashboard.hsndm.tech`, GitHub Pages does not recognize `dashboard.hsndm.tech` as an authorized custom domain for this repository (since `www.hsndm.tech` is registered), resulting in a `404 Site not found` error.

---

## Recommended Resolution

If you want `dashboard.hsndm.tech` to serve the candidate dashboard:
1. **Managed Hosting Route (Recommended):** Point `dashboard.hsndm.tech` via CNAME directly to the managed deployment endpoint (`hsndmstudio-lyaavagg.manus.space`) rather than GitHub Pages. This keeps the marketing site on GitHub Pages (`www.hsndm.tech`) and the candidate dashboard on the full-stack server.
2. **Dedicated Repository Route:** Create a separate repository (e.g., `hsndm566/hsndm-dashboard`), configure its GitHub Pages custom domain to `dashboard.hsndm.tech`, and populate its CNAME file with `dashboard.hsndm.tech`.
