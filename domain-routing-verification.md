# Live Domain Routing Verification

## 2026-08-17 dashboard check

The browser reached `https://dashboard.hsndm.tech/dashboard` over HTTPS and rendered the intended private candidate dashboard entry screen rather than a GitHub Pages 404. The interface presents the passwordless authentication call to action, **“Email me a sign-in link,”** along with the existing privacy-choice and WhatsApp entry points.

This establishes that the `dashboard.hsndm.tech` route reaches the deployed portal and loads its Clerk-aware sign-in boundary. Completing an actual email-link authentication remains a separate user-controlled verification step because it sends a live sign-in email.

## 2026-08-17 routing status

Render now reports `hsndm.tech`, `www.hsndm.tech`, and `dashboard.hsndm.tech` as **verified** portal custom domains. Public DNS resolves `www` and `dashboard` to `hsndm-portal.onrender.com`; the dashboard health and database-readiness endpoints both return HTTP 200 over HTTPS.

`api.hsndm.tech` publicly resolves to `autoapply-sa.onrender.com`, and the direct backend health endpoint returns HTTP 200. However, the API service has no Render custom-domain claim. Render rejected creating that third claim with HTTP 400 and the explicit message that a payment method is required to add more than two custom domains. As a result, `https://api.hsndm.tech/healthz` remains an HTTP 403 Cloudflare response until the workspace enables an additional Render custom domain or the API is routed through a different verified service.
