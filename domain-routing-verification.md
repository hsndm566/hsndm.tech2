# Live Domain Routing Verification

## 2026-08-17 dashboard check

The browser reached `https://dashboard.hsndm.tech/dashboard` over HTTPS and rendered the intended private candidate dashboard entry screen rather than a GitHub Pages 404. The interface presents the passwordless authentication call to action, **“Email me a sign-in link,”** along with the existing privacy-choice and WhatsApp entry points.

This establishes that the `dashboard.hsndm.tech` route reaches the deployed portal and loads its Clerk-aware sign-in boundary. Completing an actual email-link authentication remains a separate user-controlled verification step because it sends a live sign-in email.

## 2026-08-17 routing status

Render now reports `hsndm.tech`, `www.hsndm.tech`, and `dashboard.hsndm.tech` as **verified** portal custom domains. Public DNS resolves `www` and `dashboard` to `hsndm-portal.onrender.com`; the dashboard health and database-readiness endpoints both return HTTP 200 over HTTPS.

`api.hsndm.tech` publicly resolves to `autoapply-sa.onrender.com`, and the direct backend health endpoint returns HTTP 200. However, the API service has no Render custom-domain claim. Render rejected creating that third claim with HTTP 400 and the explicit message that a payment method is required to add more than two custom domains. As a result, `https://api.hsndm.tech/healthz` remains an HTTP 403 Cloudflare response until the workspace enables an additional Render custom domain or the API is routed through a different verified service.

## 2026-08-17 authentication and release follow-up

Selecting **“Email me a sign-in link”** on the live dashboard opens the configured Clerk sign-in modal with an email-address field and a continuation control. A real email-link request was not sent because no candidate email address was provided after the modal opened.

The source checkout and `user_github` `main` both resolve to `84f3cd12511c221be3193389122aa4dbaae89534`. After Render completed the matching deployment, the managed project origin, `www.hsndm.tech`, dashboard health, and database-readiness endpoints each returned HTTP 200. The public and managed frontend HTML no longer reference the removed external animation runtime.

## 2026-08-17 no-cost API edge route

The refreshed Cloudflare connection was used to preserve the existing `api.hsndm.tech` CNAME target (`autoapply-sa.onrender.com`) while enabling Cloudflare proxying. An isolated `hsndm-api-edge-proxy` Worker now owns only the `api.hsndm.tech/*` route and forwards requests to the verified AutoApply SA Render backend, retaining request path, query parameters, and request headers while removing the upstream `Host` header.

Live verification confirms `https://api.hsndm.tech/healthz` returns HTTP 200 with `X-API-Edge: hsndm` and the AutoApply SA backend health payload. The protected `https://api.hsndm.tech/v1/campaigns/latest-activity` route returns HTTP 403 from the backend with the same edge marker, demonstrating that authorization semantics were preserved rather than bypassed.
