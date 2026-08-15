# Hosting and Azure Findings

- Current session config has no Render or Azure connector. The only Render text matches are unrelated tools; no Azure match exists.
- The project repository has a GitHub remote (`user_github`) but no `render.yaml`, `railway.json`, Dockerfile, or docker-compose file at the project root.
- The project uses a full-stack Express/tRPC server and the managed WebDev deployment. A separate Render deployment would need an explicit API origin, CORS, authentication, and environment-variable strategy.
- Current task guidance recommends one primary production backend rather than running Railway and Render as active peers. GitHub should be the source of code; the chosen host should be the source of runtime configuration and deployment.
- Render documentation indicates linked-branch auto-deploys are available, including deployment after CI checks. Railway documentation indicates health checks and restart policy controls are available.
- Azure federated identity credentials are the missing piece in the prior migration attempt. A usable Azure workflow needs the subscription ID, tenant ID, application/client ID or managed identity ID, target resource group, and a federated credential matching the CI issuer/subject/audience—or a service-principal secret as a less-preferred alternative.
- A Chrome tab or Manus schedule every 15 minutes is not the right keep-awake mechanism. Use native health checks and restart policies first; if external uptime monitoring is required, use a deterministic HTTP monitor or provider-native scheduled check rather than an AI session.

Sources reviewed:
- https://render.com/docs/deploys
- https://docs.railway.com/deployments
- https://learn.microsoft.com/en-us/graph/api/resources/federatedidentitycredentials-overview?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/azure/devops/pipelines/release/configure-workload-identity?view=azure-devops

## Final operational decision

The application now exposes `GET /healthz`, returning a small JSON payload with `status`, `service`, `timestamp`, and `uptime`. Render or Railway can use this deterministic endpoint for native health checks and restart decisions; a Chrome tab or AI schedule is unnecessary.

The current session still has no Render API connector or service identifiers, so no claim is made that Render and Railway are synchronized. GitHub remains the code source of truth, while the user must designate exactly one production backend before configuring auto-deploy. Azure remains optional; the missing federated-identity configuration is still the only blocking migration input identified in this project.

The built production entry was smoke-tested on a clean port after confirming that `dist/index.js` is generated from `server/_core/index.ts`. `GET /healthz` returned HTTP 200 JSON with `status: "healthy"`, `service: "AutoApply SA"`, a timestamp, and process uptime. The initial smoke attempt hit a stale process and was discarded; the clean-port verification is the authoritative result.

Browser verification on 2026-08-15: `https://dashboard.hsndm.tech` resolves to GitHub Pages and returns GitHub’s “Site not found” 404, so the subdomain is not yet bound to the managed dashboard deployment. The frontend now contains subdomain-aware dashboard routing, but DNS/host binding remains an external configuration step.

Dashboard feature verification on 2026-08-15: desktop and 390px mobile captures were taken for `/dashboard` and `/dashboard/settings`. The settings route renders its responsive skeleton correctly while Clerk is unreachable in preview; the dashboard remains on the existing secure-auth loading screen until Clerk resolves, so authenticated dashboard cards/activity could not be visually exercised without a live Clerk session. TypeScript and the full test suite passed before capture.

Preview verification after the Clerk integration: `/dashboard` loads the Clerk provider, and when the custom Clerk domain is unreachable it now displays a visible “Sign-in is temporarily unavailable” card with a retry button rather than an endless blank spinner. The browser console identifies the remaining external blocker as `clerk.hsndm.tech` not serving Clerk JS.

Clerk scope regression check on 2026-08-15: the public preview home page at `/?from_webdev=1` extracted and rendered the full AutoApply SA landing page after Clerk was moved out of the root provider. A follow-up My Browser view request timed out at the extension layer, so the extracted public-page result is the authoritative smoke evidence; no new Clerk error was present in that result. A subsequent dashboard navigation also timed out at the browser extension layer, while a browser-independent preview screenshot successfully rendered the public home page with its hero and navigation after Clerk was removed from the root provider. After a clean dev-server restart, a second preview screenshot again rendered the public home page successfully, with no Clerk initialization required on `/`.

Candidate notification usability simulation on 2026-08-15: the intended flow is direct and discoverable once authenticated—header control is labeled `Activity`, includes an accessible unread-count label, and jumps directly to the `Recent activity` feed while persisting the seen timestamp locally. In the current preview, My Browser navigation to `/dashboard` timed out at the browser extension layer and the independent screenshot showed the expected Clerk loading state, so an authenticated click-through could not be completed until the external Clerk custom domain is live. The remaining usability risk is authentication availability, not the notification control itself.


## 2026-08-15 video and notification release verification

- Managed hero MP4 `/manus-storage/gemini_generated_video_EA567831_5f93d04f.mp4` returned HTTP 206 with `content-type: video/mp4` and range bytes from the preview storage route.
- Managed explainer MP4 `/manus-storage/gemini_generated_video_DCF37916_a9fca67a.mp4` returned HTTP 206 with `content-type: video/mp4` and range bytes from the preview storage route.
- Desktop screenshots of `/` and `/ar` show the approved dark hero media surface and readable hero content with the active campaign CTA.
- Phone screenshots at 390x844 of `/` and `/ar` show the hero media surface, navigation, CTA, stats, and sticky/mobile campaign action without horizontal overflow.
- HeroMedia now renders the managed video without the prior `prefers-reduced-motion` gate, uses muted looping inline playback, and falls back to a dark branded surface on media error. English and Arabic explainer videos use the same explicit error fallback.
- Dashboard preview authentication remains externally blocked by Clerk DNS; public homepage verification is independent and passed.

Subdomain recommendation: keep `dashboard.hsndm.tech` as the single candidate-facing subdomain. Do not add separate API, auth, or media subdomains now; the managed deployment already serves the frontend/backend boundary and storage redirects, while extra subdomains would add DNS, CORS, cookie, and Clerk verification complexity without improving the current candidate flow. Add another subdomain only for a genuinely separate product or independently hosted service.

