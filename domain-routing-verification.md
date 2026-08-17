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

## 2026-08-17 authoritative hostname review

Cloudflare now reports exactly one CNAME for each delegated hostname: `www.hsndm.tech` and `dashboard.hsndm.tech` are DNS-only CNAMEs to `hsndm-portal.onrender.com`, while `api.hsndm.tech` is a proxied CNAME to `autoapply-sa.onrender.com` with the isolated Worker route attached. Live checks returned HTTP 200 from the public frontend, dashboard health, database readiness, and API health respectively. The API response includes `X-API-Edge: hsndm`, proving it does not resolve to the public frontend or dashboard service.

The root `hsndm.tech` remains live and returns HTTP 200 from its GitHub Pages address set. Its four GitHub Pages A records have mixed Cloudflare proxy flags, so that existing root configuration was deliberately left unchanged to avoid disrupting a working public apex while the requested `www`, dashboard, and API routes were validated.

## 2026-08-17 campaign-client CORS correction

The first live browser-equivalent preflight to the edge route returned HTTP 204 but omitted the `Access-Control-Allow-*` headers required for the campaign client’s `X-Campaign-Token` request. The isolated Worker was updated to answer `OPTIONS` locally and to append CORS headers only for `https://hsndm.tech`, `https://www.hsndm.tech`, and `https://dashboard.hsndm.tech`.

Final verification returned HTTP 204 with the required origin, methods, headers, max-age, and `Vary: Origin` values for both public origins. An untrusted origin received no allow-origin header. A protected request from `www.hsndm.tech` retained both its allowed-origin header and the backend’s HTTP 403 response for an invalid campaign token, demonstrating that browser access was repaired without weakening campaign authorization.

## 2026-08-17 apex record audit

Cloudflare lists the four documented GitHub Pages A-record addresses for `hsndm.tech`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. Repeated public requests resolved through Cloudflare and returned HTTP 200, while direct tests of each configured address completed the expected redirect to the working `www.hsndm.tech` frontend.

GitHub’s official Pages guidance confirms that those four addresses are the supported apex A-record set and recommends configuring the `www` variant alongside the apex for HTTPS sites. Because the existing live root consistently redirects to the verified `www` frontend and the current address set matches GitHub’s required values, no DNS mutation was warranted merely to make the mixed Cloudflare proxy flags uniform. [GitHub Pages custom-domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## Current DNS restore baseline

The following exact Cloudflare records were captured after the direct routing repair. They are the current restore baseline for any future routing change.

| Hostname | Record ID | Type | Target | Proxied | TTL |
| --- | --- | --- | --- | --- | --- |
| `www.hsndm.tech` | `0fc06e92d4a7ed382169fd222e918593` | CNAME | `hsndm-portal.onrender.com` | No | Auto (`1`) |
| `dashboard.hsndm.tech` | `c9c3c61b80cc04e30b8dd7b458108976` | CNAME | `hsndm-portal.onrender.com` | No | Auto (`1`) |
| `api.hsndm.tech` | `4554ad3a8bd8aca94739c216f6d6a396` | CNAME | `autoapply-sa.onrender.com` | Yes | Auto (`1`) |

The remaining migration control-plane work was resolved directly through the refreshed Cloudflare connection. Therefore no DNS handoff remains pending.

## 2026-08-17 Render service separation check

Read-only Render API inspection confirms two distinct active web services: `hsndm-portal` (`srv-da12uke1egvs739s2jhg`) for the public site and candidate dashboard, and `autoapply-sa` (`srv-d9vm7ck9v7es73b6k78g`) for the separate automation backend. The portal serves the `www` and `dashboard` user experiences, while `api.hsndm.tech` reaches the separate backend only through its scoped Cloudflare edge route. No backend service configuration, deployment trigger, or Railway service was changed during this check.

The remaining unverified authentication boundary is intentional: the Clerk entry form is live, but a real magic-link request and completed candidate session require explicit approval to send a sign-in email and access to that mailbox.

## 2026-08-17 Railway read-only inventory

The configured Railway project token was verified as project-scoped to the production environment and used only for read-only metadata inspection. The production inventory contains the existing `hsndm.tech`, `saudi-whatsapp-chatbot`, `autoapply-sa`, and `kallas-site` services. None were redeployed, repointed, restarted, or otherwise modified. This preserves the established Railway chatbot and automation workloads while the public portal remains on the separate Render service.

## 2026-08-17 authoritative DNS and HTTPS target recheck

The Cloudflare DNS inventory confirms that `www.hsndm.tech` and `dashboard.hsndm.tech` each have one DNS-only CNAME to `hsndm-portal.onrender.com`. `api.hsndm.tech` has one proxied CNAME to `autoapply-sa.onrender.com`, with the scoped edge route still in place. `clerk.hsndm.tech` has one proxied CNAME to `frontend-api.clerk.services`. No records exist for `apply.hsndm.tech` or `content.hsndm.tech`, so neither is being represented as a live service endpoint.

HTTPS checks returned `200` for the public homepage, dashboard health, and Clerk hostname. The API health route returns `200` with the expected edge marker for a normal `GET` request; its `HEAD` response is `501`, so monitoring must use `GET` rather than header-only probes. No DNS or service mutation was performed during this audit.
