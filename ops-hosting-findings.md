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


## 2026-08-15 Clerk custom-domain recheck

`clerk.hsndm.tech` now resolves through Cloudflare to Clerk infrastructure, returns HTTP 200 JSON at the root, and serves the Clerk browser JavaScript successfully after one expected HTTP 307 version redirect followed by HTTP 200 with `content-type: application/javascript` and a 237,761-byte payload. The previous custom-domain DNS failure is resolved at the DNS/asset-serving layer. A direct authenticated browser navigation timed out at the browser-extension layer, while the independent dashboard preview capture showed the expected Clerk-dependent loading/skeleton state; this does not invalidate the successful DNS and script checks, but a real email magic-link sign-in still needs one end-to-end browser test.


## 2026-08-15 production continuation check

The managed production homepage `https://hsndmstudio-lyaavagg.manus.space/` returns HTTP 200. Both production video paths return the expected managed-storage HTTP 307 redirect to CloudFront, and following the redirect with a byte-range request returns HTTP 206, `content-type: video/mp4`, and 1,024 streamed bytes for both the EA567831 hero asset and the DCF37916 explainer asset. This is the expected range-serving behavior for mobile playback. `https://dashboard.hsndm.tech` still returns the GitHub Pages HTTP 404, while `https://clerk.hsndm.tech` remains healthy.


Cloudflare dashboard access check on 2026-08-15: navigation reached `dash.cloudflare.com` and exposed the Cloudflare dashboard shell, but the follow-up page inspection timed out in the connected browser extension before account authentication or zone controls could be confirmed. No DNS mutation was performed.

## 2026-08-15 recovery and accessibility batch verification

Desktop and 390px phone-width captures of both `/` and `/ar` were reviewed after adding skip navigation, keyboard focus coverage for select/input controls, visible focus treatment for the CV drop zone, resilient English WhatsApp-popup recovery, and accessible video fallback semantics. The English and Arabic pages retained their established hierarchy, bilingual type treatment, responsive price cards, sticky mobile campaign action, and CV matcher layout without horizontal overflow in the captures.

The updated `/enquire` and `/ar/enquire` routes were also reviewed at desktop and 390px widths. Both retain readable headings, labeled controls, Saudi city and industry selectors, optional local file selection, and full-width WhatsApp CTAs without horizontal overflow. Their popup-block recovery is present in source and regression tests for both languages; browser automation did not submit the real form, so no message was sent externally.

Post-release external-domain recheck: `dashboard.hsndm.tech` resolves through Cloudflare but still returns HTTP 404 at its root, while the managed dashboard route returns HTTP 200. `clerk.hsndm.tech` continues to return HTTP 200. This confirms the remaining issue is dashboard-host routing/binding rather than the managed application or Clerk custom domain.

## 2026-08-15 Stage 2 ATS readiness verification

The updated `/ats` route was reviewed at desktop and 390px phone widths. The ATS upload control, target city/industry labels, target-role field, editable CV text area, minimum-text guidance, and disabled pre-analysis CTA all remained readable and vertically ordered without horizontal overflow. The new extraction-failure and retry messaging is covered by the ATS regression suite; the visual check intentionally did not upload a real CV or invoke the remote AI review.

## Managed custom-domain target blocker

The available project metadata confirms only the managed public hostname `hsndmstudio-lyaavagg.manus.space`; it does not provide an approved custom-domain verification record, CNAME target, or hostname-to-path routing target for `dashboard.hsndm.tech`. The managed domain page in the project interface must therefore supply the exact target before Cloudflare is changed. The recorded current Cloudflare dashboard CNAME remains the rollback point and must not be replaced by a guessed preview/share hostname.

## 2026-08-15 Final release verification

The final pre-release regression suite passed with 30 test files and 75 tests. TypeScript validation completed without errors, and `pnpm build` completed successfully. The build retains the existing non-blocking advisory that some optional document-processing and PDF-export chunks exceed the bundler's 500 kB recommendation; these features are already code-split and the advisory does not prevent deployment. English, Arabic RTL, and ATS review entry views were visually checked at 1280px desktop and 390px mobile widths. The managed hero and explainer MP4 routes remain configured through `/manus-storage/` and retain their existing browser-safe fallback behavior.

Managed production browser smoke verification after checkpoint `0e491952` loaded the complete public AutoApply SA homepage from `https://hsndmstudio-lyaavagg.manus.space/`, including the bilingual navigation, Saudi career-matching controls, pricing, enquiry links, and mobile-ready service content. The linked `user_github` main branch resolved to the same checkpoint commit. The managed public proxy returned 404 for `/healthz` even though the actual production server and local health route include it; this needs provider-level routing review before it is relied on as an external monitor, but it does not affect public homepage availability.

A no-cache public retrieval after the final release checkpoint again returned the complete managed production homepage with the Saudi-only positioning, bilingual navigation, CV matcher, pricing, WhatsApp campaign paths, and Jeddah service information. This confirms the managed production hostname is serving the current public site content.
