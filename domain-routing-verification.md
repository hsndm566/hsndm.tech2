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

## 2026-08-17 API health-method compatibility repair

The edge worker previously forwarded `HEAD /healthz` to the upstream automation service, which does not implement that method and returned `501`. The worker now handles only `HEAD /healthz` at the edge by checking the same upstream `GET /healthz` status while returning an empty response body. All other routes and methods retain their existing forwarding behavior.

Post-deployment verification returned `200` with the `X-API-Edge: hsndm` marker for both `HEAD` and `GET` health requests. The approved-origin campaign preflight remained `204` with the expected CORS policy, and a protected campaign request with an invalid token remained `403`, confirming that the repair did not bypass authorization.

## 2026-08-17 Clerk dashboard entry recheck

A fresh browser visit to `https://dashboard.hsndm.tech/dashboard` completed successfully and rendered the candidate dashboard boundary with the passwordless “Email me a sign-in link” action. No email identifier was entered and no Clerk request was submitted. This verifies that the dashboard portal and its Clerk-aware entry surface load on the configured custom hostname, while Clerk-side domain activation and the real magic-link session are retained as separate, user-controlled checks.

## 2026-08-17 authorized Clerk account-creation attempt

After explicit user authorization, the dashboard sign-in flow confirmed that `apply@hsndm.tech` did not yet have a Clerk account and offered the registered sign-up flow. The account form accepted the user-provided compliant credentials and the browser submitted the request. The Clerk control remained in its processing state without showing a completion or email-verification screen during the subsequent wait; no password or credential value is recorded here.

A browser-console check reported no client-side error. A further wait left the control in the same processing state, so the account request cannot yet be treated as completed or as an email-dispatch confirmation.

Resource inspection confirmed the configured custom Clerk host loaded its environment, client, and UI bundles successfully. It observed the sign-in endpoint request that produced the initial no-account response but no subsequent sign-up endpoint request. The sign-up control is currently disabled with Clerk’s loading state, indicating the stalled flow is client-side pending rather than a confirmed account-creation or verification-email result.

A controlled dashboard refresh cleared the stale loading state and restored the ordinary passwordless entry control. No additional account request or email dispatch occurred during the refresh itself.

One controlled fresh sign-up retry using the same user-authorized form data reproduced the same loading-only outcome. It did not advance to an email-verification screen or establish a session, so the account must still be treated as uncreated and no magic-link dispatch can be confirmed.

A final authorized retry was prepared with temporary browser instrumentation that records only Clerk request method, endpoint path, and response status. It does not record request bodies or credentials.

The final instrumented submission reproduced the loading-only UI state. The instrumentation recorded no Clerk request at all, and the Clerk client reported no sign-up object and no active session. After three controlled attempts, further retries were stopped to avoid duplicating account actions. This localizes the unresolved issue to the Clerk sign-up flow before an account-creation request is transmitted; it is not a failed email dispatch, because no dispatch was reached.

## 2026-08-17 production routing and cache-consistency review

Cloudflare’s authoritative records map the apex `hsndm.tech` to the existing GitHub Pages address set, `www.hsndm.tech` and `dashboard.hsndm.tech` to the Render portal, `api.hsndm.tech` through the scoped proxied AutoApply backend route, and `clerk.hsndm.tech` to Clerk’s frontend API hostname. `apply.hsndm.tech` and `content.hsndm.tech` have no DNS records and therefore are not live public hostnames.

Live checks showed the apex redirects with `301` to `https://www.hsndm.tech/`; the public and dashboard pages return `200` from the same Render application shell; the API health endpoint returns `200` with its `X-API-Edge: hsndm` marker; and the Clerk environment endpoint returns `200` with `Cache-Control: no-store`. Both the normal public request and an explicit no-cache request returned the same HTML digest and the same hashed public JavaScript asset. The public HTML uses `Cache-Control: public, max-age=0`, which requires revalidation rather than serving an unbounded stale document.

Render reports commit `71ecc658` as the live portal deployment. The current source head differs only by non-runtime documentation/checklist work; the runtime diff between it and that live release is empty. A cache-busting browser visit loaded the current AutoApply SA public experience with the updated Campaign Clarity section and `apply@hsndm.tech`, confirming the visitor-facing page is not an older cached frontend.

The follow-up deployment inspection still reports `71ecc658` as the active portal build. Later checkpoints are documentation and checklist evidence only, with no runtime public-code change to deploy. A second explicit `Cache-Control: no-cache` request returned the same `200` status, `public, max-age=0` revalidation policy, ETag, and public HTML digest as the prior review. The live visitor-facing release therefore remains current even though a documentation-only checkpoint is newer in source control.

## 2026-08-17 Clerk DNS-only experiment and rollback

Clerk’s production guidance cautions that a reverse-proxied Frontend API CNAME can prevent DNS validation, so the single `clerk.hsndm.tech` CNAME was briefly set to DNS-only and tested. Its endpoint remained reachable, but the live dashboard’s Clerk client timed out and displayed its existing unavailable-sign-in recovery state. The record was immediately restored to its prior proxied state using the same CNAME target, TTL, and record ID.

After the rollback, the Clerk environment endpoint returned `200` with `Cache-Control: no-store`, and the dashboard again loaded its `Email me a sign-in link` entry control without any submitted identifier. This establishes that the proxy-mode experiment is not a viable repair for the pre-request sign-up stall. The remaining fault is provider-side or instance-flow configuration and must be resolved before another account-creation attempt.
