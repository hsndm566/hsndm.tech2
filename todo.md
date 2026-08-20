- [x] Choose one primary backend between Render and Railway and document GitHub-to-host synchronization; no production host was switched without Render service access.
- [x] Configure a deterministic uptime strategy using the new `/healthz` endpoint with provider health checks or an external HTTP monitor instead of a browser wake-up job.
- [x] Clarify Azure workload-identity inputs and decide whether Azure migration remains necessary; Azure remains optional and federated identity is still the blocker.

# System Audit & Bilingual User Simulation Checklist

- [x] Phase 1: Audit routing, tRPC endpoints, client state, localization strings, and media assets.
- [x] Phase 2: Simulate English user journey (CV drop, local scan, adrenaline progress, AI skill extraction with tooltip/error states, WhatsApp enquiry handoff, map, mobile CTA).
- [x] Phase 3: Simulate Arabic user journey (RTL navigation, Arabic CV drop, local scan, Arabic AI skill extraction, WhatsApp prefill, localized map, mobile CTA).
- [x] Phase 4: Fix any isolated bugs found during simulation while preserving privacy and architecture.
- [x] Phase 5: Run tests, type checks, build, visual verification, and publish the verified release.

- [x] Configure passwordless email authentication for client dashboard sessions.
- [x] Bind and verify dashboard.hsndm.tech for private candidate access.
- [x] External setup required: point dashboard.hsndm.tech to the managed deployment and complete the Clerk custom-domain DNS verification for clerk.hsndm.tech before live passwordless sign-in can be tested
- [x] Implement candidate profile settings page and database persistence
- [x] Replace dashboard spinner with skeleton loading UI during data fetch
- [x] Build recent activity feed for application status updates and notifications
- [x] Add candidate-owned job application edit and delete controls with protected backend mutations, optimistic updates, and regression coverage
- [x] Fix Clerk JS timeout error on public home page without affecting dashboard authentication
- [x] Add dashboard activity notification badge for new feed updates
- [x] Add profile settings Save Changes success toast feedback
- [x] Simulate candidate notification discovery and usability on desktop and mobile
- [x] Add notification preview dropdown for latest activity updates
- [x] Add Mark all as read control to recent activity feed
- [x] Add undo action to profile Save Changes toast
- [x] Diagnose and fix homepage video rendering with phone-safe fallback
- [x] Assess whether additional subdomains are useful for the current architecture
- [x] Inspect Cloudflare zone and existing DNS records for hsndm.tech
- [x] Bind dashboard.hsndm.tech and clerk.hsndm.tech using verified Cloudflare targets
- [x] Verify DNS propagation, HTTP responses, and Clerk authentication dependency after Cloudflare changes
- [ ] Test the full Clerk magic-link login flow in the browser
- [x] Bind dashboard.hsndm.tech to the managed production deployment
- [x] Publish the latest project state and verify the production homepage video on mobile
- [x] Audit and improve bilingual recovery states for public conversion flows
- [x] Improve phone-first accessibility, keyboard focus, and responsive interaction affordances
- [x] Create verified operator documentation for Clerk sign-in and DNS completion
- [x] Run full regression, mobile visual, keyboard, and reduced-motion checks for the approved quality batch
- [x] Superseded: prepare a minimal Cloudflare dashboard-domain handoff for Hermes and validate its returned evidence; direct Cloudflare control already verified the live Render target
- [x] Implement the next safe Stage 2 conversion-clarity and candidate-readiness improvements without external configuration changes
- [x] Run regression, mobile visual, and production-build verification for the Stage 2 batch
- [x] Confirm the managed project's exact custom-domain target without guessing a DNS record
- [x] Superseded: provide Hermes with verified dashboard-domain target instructions and validate its DNS evidence; direct Cloudflare control already verified the live Render target
- [x] Automate discovery of the managed platform's custom-domain verification record or identify the unavoidable confirmation step
- [x] Run final regression, type, and production-build verification for the requested release
- [x] Save the verified current project state to GitHub and the managed live deployment
- [x] Directly verify the live managed origin and linked GitHub remote heads for the final checkpoint, rather than relying only on local tracking references
- [x] Verify the managed production hostname serves the final release after the checkpoint
- [x] Confirm the linked user GitHub remote contains the final release checkpoint commit
- [x] Push the validated static release package to the user-requested hsndm.tech GitHub Pages repository once its connected account has write permission
- [x] Preserve the existing www.hsndm.tech CNAME and current media assets in the validated static release package
- [x] Diagnose and attempt automated repair of the GitHub integration write-permission gap for hsndm566/hsndm.tech
- [x] Retry publication of the validated release to hsndm566/hsndm.tech and verify the target commit
- [x] Verify refreshed GitHub App access, publish to hsndm566/hsndm.tech, and validate www.hsndm.tech with its hero and explainer media
- [x] Recheck the newly authorized all-repository GitHub connector scope and complete the requested hsndm.tech release push
- [x] Retest the refreshed GitHub authorization and publish hsndm.tech when the connector scope is active
- [x] Recheck the GitHub App installation scope until hsndm566/hsndm.tech has active push access
- [x] Push the validated static release commit to hsndm566/hsndm.tech and verify remote main matches the staged release
- [x] Verify www.hsndm.tech serves the updated release and both configured video paths respond successfully
- [x] Diagnose and resolve the GitHub connector propagation failure before publishing the preserved hsndm.tech release
- [x] Audit and correct only the root, dashboard, and API DNS records for hsndm.tech using Cloudflare, then verify service routing
- [x] Diagnose Cloudflare API token delivery and validation after the newly supplied credential update
- [x] Add cache-busted hero and explainer video references, rebuild, and verify them through www.hsndm.tech
- [x] Correct the opening hero video's crop, transparency, and contrast without changing the public conversion flow
- [x] Repair Arabic RTL spacing, alignment, and copy-level redundancy or typographic defects while preserving the approved content
- [x] Verify both website videos render, loop, and remain legible on desktop and phone-sized viewports
- [x] Perform a final multi-area frontend quality sweep covering accessibility, responsive layout, routes, media, and bilingual UI
- [x] Run regression tests, type checks, and production build for the verified frontend release
- [x] Consolidate dashboard mobile regression assertions under their intended test suite
- [x] Complete the remaining Arabic copy pass, including the concise CV privacy line and final terminology checks
- [x] Refactor the dense Arabic CV intake and readiness markup into maintainable blocks without changing its behavior
- [x] Re-verify RTL spacing across the Arabic hero, intake, readiness, pricing, FAQ, and footer on desktop and mobile
- [x] Replace the legacy Arabic CV privacy sentence directly in the dense source markup and remove the CSS-only presentation override
- [x] Export every current Arabic visitor-facing string and provide a Claude-ready linguistic review prompt
- [x] Inspect the configured Railway, Cloudflare, Clerk, and managed-deployment targets without modifying DNS
- [x] Route api.hsndm.tech and dashboard.hsndm.tech only after their exact provider targets are verified
- [x] Import the user-approved Arabic revision and run bilingual regression and layout verification
- [x] Replace current Arabic landing-page copy with the user-approved reviewed Arabic source
- [x] Validate the reviewed Arabic page on desktop and mobile before publication
- [x] Add an accessible footer enquiry form with validated WhatsApp handoff in English and Arabic
- [x] Add refined hover feedback to pricing cards and workflow steps without affecting keyboard or touch interactions
- [x] Add an accessible English–Arabic transition that respects reduced-motion preferences
- [x] Verify the new enquiry, interaction, and transition behavior with bilingual automated and visual checks
- [x] Recompose the opening hero on a clean white surface so the full video and all primary first-screen content are visible
- [x] Verify the bright hero’s readability and video framing on English and Arabic desktop and mobile pages
- [x] Add source-level regression coverage for the white hero surface, full video framing, and first-screen content hierarchy
- [x] Preserve explicit desktop and mobile English/Arabic hero evidence in the final verification record
- [x] Add an animated accessible success checkmark and bilingual thank-you message after footer enquiry submission
- [x] Verify the footer success state, WhatsApp handoff, reduced-motion behavior, and responsive presentation
- [x] Publish the verified footer success-state update
- [x] Add an explicit reduced-motion regression assertion for the footer success animation fallback
- [x] Capture and record post-submission desktop English and Arabic footer-success verification
- [x] Publish the verified footer success-state update
- [x] Verify the exact provider targets and credential path for root, api, dashboard, clerk, apply, and content subdomains without guessing DNS records
- [x] Add English and Arabic legal pages as working drafts for Privacy Policy and Terms & Conditions, pending qualified legal review
- [x] Add a consent-aware cookie banner that gates optional analytics until an affirmative choice
- [x] Add llms.txt, sitemap coverage, JSON-LD, page-specific sharing metadata, and security-header configuration where compatible
- [x] Add a persistent WhatsApp Business contact entry point and a Saudi payment-gateway placeholder that does not process payments
- [x] Add a non-fabricated Saudi-context case-study framework without inventing customer reviews or results
- [x] Superseded: create minimal real subdomain landing content only after DNS targets are verified; dashboard is a protected portal and the API hostname intentionally is not a public landing page
- [x] Extend each approved addition with equal-depth Arabic content, proper RTL behavior, and locale-preserving navigation
- [x] Run staged mobile, accessibility, bilingual, and production verification without altering existing public conversion flows
- [x] Test user-supplied Cloudflare tokens against Cloudflare API endpoint (tokens list zones successfully, but lack DNS Edit permissions resulting in HTTP 403)
- [x] Inspect zone ID for hsndm.tech using authenticated token (zone ID found: f5249271f49ed2d34cb62a00d2ad078a; DNS record inspection returned HTTP 403 due to token permissions)
- [x] Create or update CNAME record for dashboard.hsndm.tech pointing to managed deployment or Vercel/Railway target
- [x] Superseded: create or update CNAME record for api.hsndm.tech pointing to the Railway backend; the verified Cloudflare Worker intentionally routes api.hsndm.tech to the protected Render AutoApply SA backend
- [x] Consolidate the public, dashboard, API, and Clerk subdomain routes into one verified AutoApply SA architecture without disrupting the live site; public and dashboard share the Render portal, API uses the Cloudflare edge route, and Clerk remains on its verified proxy domain
- [x] Superseded: connect verified dashboard and Clerk routes before applying a Railway API DNS route; the production API route is deliberately Render-backed rather than Railway-backed
- [x] Superseded: validate the earlier user-supplied Cloudflare administrator credential; the active Cloudflare control path and live records have since been verified directly
- [x] Superseded: validate the earlier user-supplied Cloudflare access credential; the active Cloudflare control path and live records have since been verified directly
- [x] Superseded: validate the earlier supplied Cloudflare R2 credential; R2 is not required for the verified live DNS or portal architecture
- [x] Consolidate legacy Cloudflare, R2, Railway, GitHub Pages, and browser-session troubleshooting; the active Render/Cloudflare/Clerk architecture is verified and remaining browser-auth tasks are explicitly tracked below
- [x] Diagnose and fix ATS review flow uploading, parsing, analysis, and error recovery states
- [x] Superseded: verify and repair Railway API health routing, frontend API configuration, and dashboard hostname delivery; the verified full-stack dashboard portal is Render-hosted
- [x] Superseded: provision an isolated Railway service from hsndm566/hsndm.tech2; the approved architecture keeps the dedicated automation service untouched and serves the portal from Render
- [x] Superseded: repoint the unused Railway static service to hsndm566/hsndm.tech2; this would not improve the current verified Render portal architecture
- [x] Superseded: verify health and tRPC endpoints on a new full-stack Railway deployment; the live full-stack deployment is Render-hosted
- [x] Verify the reported Railway hsndm.tech2 source connection: it remains unchanged, so ATS/API cannot be tested from Railway
- [x] Superseded: complete Railway browser authentication and static-service migration; no Railway source migration is needed for the active portal architecture
- [x] Verify the configured Railway API connector cannot complete the service-source migration without browser authentication: the project token is denied for `serviceConnect`
- [x] Research and verify August 2026 GitHub Student Developer Pack backend and hosting offers suited to the AutoApply SA stack
- [x] Add CDN-loaded anime.js hero, card, section, and button motion without changing content, layout, video behavior, or responsive functionality
- [x] Verify the anime.js enhancement with automated, reduced-motion, desktop, and phone checks before publication
- [x] Run a runtime reduced-motion verification proving the anime.js layer leaves hero text and interactions visible and stable
- [x] Reinitialize anime.js motion safely after client-side route and language changes
- [x] Refactor dense Arabic CV intake and readiness markup into maintainable sub-components without changing behavior
- [x] Verify Render identifier tea-d9v4c83jgndc73akurl0: no Render connector is configured and unauthenticated API access returns HTTP 401
- [x] Obtain a Render API key or authenticated Render connector before inspecting or modifying service tea-d9v4c83jgndc73akurl0
- [ ] Complete reliable public and dashboard authentication verification with the supplied Clerk production credentials; domain loading is verified, but a real passwordless session remains blocked on a valid user-controlled account below
- [x] Prevent Clerk from initializing on unmanaged preview origins and eliminate their Clerk origin-invalid requests
- [ ] Verify the guarded Clerk provider establishes passwordless sessions on a real verified hsndm.tech dashboard hostname
- [x] Create a secure Render API connection and verify that workspace tea-d9v4c83jgndc73akurl0 hosts the separate AutoApply SA Python service without changing Railway
- [x] Research and configure the free repository-managed GitHub Actions health ping for the verified Render AutoApply SA `/healthz` endpoint
- [x] Keep all existing Railway services unchanged while using only the verified AutoApply SA workload on Render until a future Heroku migration
- [x] Research GitHub and Reddit practitioner evidence for free external Render keep-awake patterns before creating any scheduler
- [x] Configure the live Render portal service with a compatible database and production environment contract before routing dashboard or API traffic to it
- [ ] Original separate-Render-target objective remains deferred: the verified architecture uses one shared portal service for public frontend and dashboard plus a separate AutoApply SA backend; create distinct public/dashboard services only if the user later requests that architectural split
- [x] Document the verified shared Render portal topology: www.hsndm.tech and dashboard.hsndm.tech share the portal service, while api.hsndm.tech routes separately to the AutoApply SA backend
- [x] Verify DNS, TLS, redirect, and HTTP behavior for hsndm.tech, www, dashboard, api, and Clerk hostnames: dashboard remains GitHub Pages 404 and API TLS is invalid
- [x] Validate Clerk production credentials and prevent invalid initialization on unmanaged preview origins
- [ ] Verify a real browser-level Clerk passwordless handoff and established dashboard session after dashboard DNS reaches the deployed portal
- [x] Replace the dashboard GitHub Pages CNAME with Render’s verified portal target and repair the API hostname certificate before live passwordless sign-up testing
- [x] Attempt all available provider and route-level workarounds to connect the public, dashboard, API, and Clerk domains without falsely claiming DNS success
- [x] Verify the connected Cloudflare integration’s effective Zone DNS read/write permission for hsndm.tech before routing changes
- [x] Refresh the reconnected Cloudflare MCP runtime and capture explicit rollback entries for www.hsndm.tech, dashboard.hsndm.tech, and api.hsndm.tech, including record ID, type, target, proxy state, and TTL
- [x] Route dashboard.hsndm.tech and www.hsndm.tech to the verified hsndm-portal Render service and api.hsndm.tech to the verified AutoApply SA Render backend
- [x] Verify Render custom-domain claims, public HTTPS routing, and the live Clerk dashboard entry point after DNS propagation
- [x] Run project checks, update the campaign API hostname, and publish the verified domain-routing release
- [x] Verify Render health and custom-domain claim status while retaining the Cloudflare DNS control-plane evidence
- [x] Update the campaign dashboard to use the verified api.hsndm.tech hostname when the Render route is ready
- [x] Complete type checks, automated tests, production build, and public endpoint verification for the migration release
- [x] Replace the obsolete DNS-handoff record with evidence that direct Cloudflare control resolved the prior control-plane mutation and no handoff remains
- [x] Make Cloudflare DNS and R2 live credential probes opt-in so unavailable external credentials do not block deterministic release validation
- [x] Add a database-aware Render readiness probe that returns no candidate data and proves DATABASE_URL connectivity
- [x] Verify the live Render portal database path after deployment and record the result before treating its runtime contract as complete
- [x] Provide Hermes with the verified three-record Cloudflare DNS repair handoff and require complete before-and-after evidence
- [ ] Independently verify Hermes’s reported DNS changes against Cloudflare resolution, Render custom-domain claims, HTTPS endpoints, and Clerk dashboard access if Hermes later provides before-and-after evidence
- [x] Validate the supplied Railway web-chat endpoint and required allowed-origin configuration for hsndm.tech
- [x] Evaluate the existing chat component and implement an AutoApply SA branded bilingual mobile-first chat widget
- [x] Add focused chat-widget tests covering safe reply rendering, session persistence, loading, and error states
- [x] Verify chat widget keyboard access and phone layout, then publish the validated integration
- [x] Restore the Railway chatbot deployment and reconfigure its active tenant from Perfect Smile Clinic to AutoApply SA before exposing it to visitors
- [x] Capture the chatbot repository and Railway deployment rollback state before replacing the Perfect Smile Clinic tenant configuration
- [x] Reconfigure chatbot identity, FAQs, intake, lead capture, bilingual replies, and human handoff for AutoApply SA
- [x] Repair and verify the Railway chatbot deployment with hsndm.tech CORS and a persisted web lead
- [x] Add and verify an electric-blue AutoApply SA chat widget only after the backend passes live integration checks
- [x] Replace the failing Railway Railpack build path with a minimal Python Dockerfile and validate the chatbot deployment from source
- [x] Verify and publish the AutoApply SA chat widget to the active public hsndm.tech frontend while preserving the current GitHub Pages deployment contract
- [x] Restart and inspect the local development service after prior hot-reload and database-connection warnings, confirming the current project state is clean
- [x] Fix the observed Google Maps script load failure and verify the localized English and Arabic map experience with a resilient fallback
- [x] Resolve the Render custom-domain limit for api.hsndm.tech or select a no-cost verified API-routing alternative; Render rejected the third custom-domain claim because the workspace has no payment method
- [x] Add subtle native 300ms fade-up scroll reveals for public section headings and cards, respecting reduced-motion preferences
- [x] Normalize public-section spacing rhythm and connected black-section treatment without changing layout structure or copy
- [x] Strengthen Pro pricing-card hierarchy and CSS-only button/CV-drop-zone interaction feedback without changing pricing or colors
- [x] Add a subtle native live-status pulse to the application-engine panel without changing its copy or layout
- [x] Add visual-polish regression coverage and validate English and Arabic public pages at a 375px mobile viewport
- [x] Diagnose and repair live hero and explainer video delivery failures on www.hsndm.tech, then reverify desktop and 375px mobile playback in English and Arabic
- [x] Retry Cloudflare DNS and Worker access after the user refreshed connectors, then create and verify a no-cost api.hsndm.tech edge route if authorized
- [x] Add and verify narrowly scoped CORS preflight handling at the api.hsndm.tech edge proxy for the public campaign client’s X-Campaign-Token requests
- [x] Audit the mixed Cloudflare proxy states on the hsndm.tech GitHub Pages A records and normalize them only if live reliability evidence warrants a safe change
- [x] Reproduce and repair the live ATS checker failure on hsndm.tech, including its upload-to-analysis request path and public recovery state
- [x] Reproduce and repair the AutoApply SA public chat bubble failure, including the browser-to-Railway endpoint contract and mobile behavior
- [x] Replace the incorrect public contact email with apply@hsndm.tech across the footer and all user-facing contact surfaces, then verify the deployed result
- [ ] Retry the live Clerk dashboard flow with apply@hsndm.tech after confirming the existing supplied Clerk credentials remain configured
- [x] Verify the live Clerk dashboard email-entry experience with apply@hsndm.tech without requesting a magic link or creating an account
- [x] Repair the bilingual audit so extracted Arabic intake and readiness components are assessed as part of the public parity check
- [x] Remove unverified public testimonial content and retain a bilingual non-testimonial service-information section
- [x] Wait for Render to deploy the newest checkpoint, then verify the active production commit matches the current project source
- [x] Re-run the live mobile homepage video verification after the newest Render deployment is active
- [x] Complete Clerk-side custom-domain verification for clerk.hsndm.tech and capture activation evidence
- [ ] Establish and document a full browser passwordless session on dashboard.hsndm.tech after explicit approval to send a magic link
- [ ] Submit the user-authorized Clerk magic-link request for apply@hsndm.tech and capture the dispatch confirmation without opening the mailbox link
- [ ] Resolve the Clerk sign-up flow that stalls before emitting any account-creation request, then repeat the user-authorized passwordless dispatch once
- [ ] Verify Clerk sign-in eligibility and authorized passwordless dispatch for hasanadam506@gmail.com without opening the mailbox link
- [ ] Create the user-authorized Clerk candidate account for hasanadam506@gmail.com and capture verification-email dispatch without opening the mailbox link
- [x] Continue safe non-Clerk production hardening: investigate the next reproducible frontend or runtime reliability risk and add regression coverage before release
- [x] Replace same-origin-only public activity polling with the configured API contract and verify its safe fallback behavior
- [x] Verify short-viewport cookie-consent stacking does not compete with public chat or WhatsApp fixed controls
- [x] Add focused regression coverage and full release verification for the activity-polling and short-viewport hardening
- [x] Correct activity polling to the verified portal-owned endpoint after confirming api.hsndm.tech intentionally rejects the route
- [x] Prevent global tRPC authorization observers from redirecting Clerk dashboard sessions into Manus OAuth, with query-boundary regression coverage
- [x] Separate mobile cookie-settings and WhatsApp fixed controls so both remain independently tappable after consent
- [x] Verify the tRPC SuperJSON client/server contract and dashboard timestamp behavior; installed tRPC v11 accepts the existing link transformer and the server contract already matches, so no speculative rewrite was applied
- [x] Normalize dashboard application timestamps so legacy or malformed dates cannot destabilize sorting, activity ordering, or date displays
- [x] Add and validate a candidate-profile creation timestamp through a safe schema migration for accurate profile activity chronology
- [x] Make cookie-consent persistence protocol-aware so local HTTP environments retain choices without reducing HTTPS security
- [x] Isolate the consent-cookie helper from the React component module so development hot reload remains stable
- [x] Verify AI CV skill extraction requests the active language: EnglishHome explicitly requests English and ArabicHome explicitly requests Arabic, so no speculative behavior change was applied
- [x] Test Clerk frontend DNS-only mode, observe the dashboard timeout, and restore the verified proxied CNAME baseline without submitting an account request
- [x] Audit authoritative DNS, redirect chains, live service ownership, and cache freshness for all public hsndm.tech hostnames
- [x] Return a standards-compatible HEAD response for api.hsndm.tech/healthz at the Cloudflare edge without changing backend health semantics
- [x] Align the live Railway AutoApply SA chatbot with the supplied bilingual FAQ, campaign-intake, privacy, handoff, CORS, and persistent-log specification
- [x] Restore Railway source access and deploy the chatbot source chain containing the campaign-intake and Groq repairs without changing unrelated Railway services
- [x] Align the public AutoApplyChatWidget starter prompts, quick actions, and service footer with the approved campaign-intake specification
- [x] Add or update focused widget regression coverage for the approved bilingual campaign-intake prompts
- [x] Run the full web test suite, type check, and production build for the widget-alignment release; live chatbot integration remains blocked by Railway repository authorization
- [x] Inspect the supplied first-login dashboard HTML and existing authenticated dashboard route without altering public landing pages
- [x] Implement the approved first-login dashboard locally with Clerk-backed identity personalization and a truthful zero-data campaign view model
- [x] Add focused dashboard regression coverage for authenticated identity, generic fallback, zero-state metrics, and proof-first labels
- [x] Validate the local desktop and mobile dashboard without deploying or changing production configuration
- [x] Audit the authenticated dashboard for runtime, route, candidate-data, and visual-system issues before publishing
- [x] Align the first-login dashboard palette and typography with the established bright AutoApply SA site system
- [x] Verify authenticated candidates receive only their own application and profile data through existing protected dashboard queries
- [x] Run complete automated, desktop, mobile, and live-domain dashboard verification, then publish the tested release
- [x] Locate the referenced `dashboard_first_login_white_orange_personalized.html` design source; it was supplied as the HTML attachment `pasted_content_3.txt`
- [x] Compare Claude’s enhanced dashboard source with the current authenticated dashboard and identify compatible improvements without importing static mock data or CDN runtime dependencies
- [x] Integrate the approved enhanced dashboard visual, responsive, and bilingual usability improvements while retaining the existing protected React data flow
- [x] Add regression coverage for newly integrated enhanced-dashboard behavior and run full local and live release verification
- [x] Audit live ATS and chatbot health, including authenticated model configuration readiness, without exposing or duplicating secrets; the live ATS analysis passes, while chatbot Groq is configured but falls back at inference time
- [x] Verify Groq is configured and responding for the chatbot; the deployed classifier returns the approved bilingual FAQ response without fallback and accepts the campaign-intake trigger
- [x] Re-test chatbot non-customer message handling after deploying the Groq repair; the portal ATS path remains live and returns its validated structured response
- [x] Prepare a concise Nano Banana hero-video prompt for a bright, clearly visible AutoApply SA replacement clip; do not alter the current video until the user supplies the generated asset
- [x] Inspect the supplied hero clip and current media configuration without changing the existing explainer video
- [x] Upload the supplied clip to managed static storage and replace only the first landing-page hero video source
- [x] Verify muted inline looping, rapid loading, framing, and visibility for the new hero on desktop and 375px mobile, then confirm the live production bundle references it while retaining the explainer video
- [x] Configure and directly validate the portal’s server-side Groq credential with the Groq models API and a minimal JSON completion without exposing the credential
- [x] Push the chatbot source repair for Groq’s supported `openai/gpt-oss-20b` model and adequate JSON-completion budget; Railway deployment remains externally blocked
- [x] Inspect the hero video’s current loop boundary, control behavior, and mobile delivery characteristics
- [x] Create a compressed, muted, seamless-loop hero asset and enforce non-interactive background playback without visible controls
- [x] Verify optimized hero playback and byte-range delivery at desktop and 375px mobile, then confirm the live Render bundle references the replacement
- [x] Continue monitoring Railway’s GitHub Auto-Deploy outage, then deploy and verify the dedicated chatbot Groq repair after upstream mitigation

# Engineering Audit & Fault-Fix Sweep

- [x] Run the complete Vitest suite, TypeScript check, and production build for a fresh baseline
- [x] Inspect frontend runtime logs and network failures for desktop and mobile-relevant issues
- [x] Audit the public English homepage at desktop and 375px mobile viewports
- [x] Audit the public Arabic homepage at desktop and 375px mobile viewports, including RTL overflow and language switching
- [x] Audit dashboard and ATS routes for loading, empty, error, and authenticated-entry behavior
- [x] Fix verified frontend faults without changing approved copy, pricing, backend architecture, or protected services
- [x] Add or update deterministic regression tests for each verified fix
- [x] Re-run tests, type checks, build, and responsive screenshots after repairs
- [x] Save the verified engineering-audit checkpoint and report remaining external blockers separately

---

## Engineering audit notes

- Audit started 2026-08-17 after user requested an adversarial desktop/mobile software-engineering review.
- Scope is limited to reproducible frontend/runtime faults and safe fixes; no DNS, Clerk email dispatch, or AutoApply SA automation-service mutations are permitted without separate approval.

---

## Prior session checklist ends above; preserve its historical entries.

---

## Engineering audit continuation

- [x] Baseline test/build/log results recorded
- [x] Responsive audit results recorded
- [x] Fixes and regression coverage recorded
- [x] Final verification checkpoint saved

---

## Audit agent lanes

- [x] Lane A: Test and build validation
- [x] Lane B: English desktop visual audit
- [x] Lane C: English mobile visual audit
- [x] Lane D: Arabic desktop RTL audit
- [x] Lane E: Arabic mobile RTL audit
- [x] Lane F: Dashboard route and auth-entry audit
- [x] Lane G: ATS and CV intake interaction audit
- [x] Lane H: Runtime/network log and API contract audit
- [x] Lane I: Accessibility and reduced-motion audit
- [x] Lane J: Regression test and release verification audit

---

## Audit handoff

- [x] Review all findings and prioritize reproducible defects
- [x] Apply only validated fixes
- [x] Re-run the full verification suite
- [x] Publish the verified checkpoint

## Deep production-readiness expansion

- [x] Verify application-query ordering and timestamp contracts for public activity indicators
- [x] Verify active-server route registration, static-file fallback, and production entrypoint alignment
- [x] Verify security headers, CORS behavior, cache controls, and unsafe redirect handling on public routes
- [x] Verify authenticated-route boundaries cannot render candidate data when authentication is unavailable or stale
- [x] Verify client network requests fail closed with usable recovery states and no misleading success claims
- [x] Verify mobile fixed elements never cover mandatory actions, focus rings, or consent controls
- [x] Verify keyboard-only navigation, focus order, landmark labeling, and reduced-motion behavior on primary routes
- [x] Verify image and video delivery includes resilient browser-compatible fallback behavior across desktop and mobile
- [x] Add regression coverage for every newly reproduced defect and re-run all existing coverage
- [x] Add an accessible, reduced-motion-aware bot typing indicator to the AutoApply SA chat widget while replies are pending
- [x] Add bilingual quick-reply buttons for the approved common AutoApply SA visitor queries and intake entry points
- [x] Add widget interaction regressions, validate mobile and desktop behavior, and publish the verified chat enhancement
- [x] Audit the active database engine, schema ownership keys, and all candidate-data query and mutation paths for row-isolation gaps
- [x] Apply enforceable database-supported access controls or equivalent server-side tenant isolation, without claiming unsupported native RLS
- [x] Add cross-candidate authorization regressions, run full validation, and publish the verified data-isolation hardening
- [x] Add a concise, accurate privacy-isolation badge to the AutoApply SA chat interface
- [x] Add an accessible bilingual tooltip that explains the chat privacy boundary without overstating security guarantees
- [x] Add focused regression coverage, verify responsive presentation, and publish the privacy reassurance update
- [x] Audit the current chatbot response contract and Railway persistence layer for minimal feedback recording
- [x] Add accessible thumbs-up and thumbs-down controls to assistant replies with privacy-preserving response identifiers
- [x] Persist deduplicated quality feedback in the chatbot service, add regressions, verify the deployed interaction, and publish
- [x] Audit the active chatbot feedback payload and persistence schema for a strictly optional explanation field
- [x] Add an accessible optional explanation field after a thumbs-down rating, with conservative limits and bilingual privacy guidance
- [x] Persist the optional explanation only with the opaque feedback record, add regressions, validate the live flow, and publish
- [x] Verify authoritative DNS and the intended production target for every active hsndm.tech hostname
- [x] Verify public frontend, dashboard, API health, Clerk, and chatbot host behavior from the live internet
- [x] Confirm the live frontend bundle matches the latest published portal release and repair only a verified routing mismatch
- [x] Repair the verified stale backend.hsndm.tech and dev.hsndm.tech GitHub Pages 404 routes only after confirming a supported Render custom-domain target
- [x] Reproduce and repair meaningful-content rendering for the public English, Arabic, campaign intake, ATS, privacy, and terms routes
- [x] Add independent no-JavaScript static fallback pages for the approved critical public routes with bilingual safe-contact guidance
- [x] Add bilingual route-level error recovery that confirms no data was sent and provides retry, email, and WhatsApp escape paths
- [x] Add privacy-preserving real-user monitoring for route exceptions, asset failures, blank-content conditions, and sustained client errors
- [x] Make consent compact, accessible, privacy-safe by default, and non-blocking to visible page content
- [x] Add a pre-handoff shared-data preview, alternate contact choices, and on-page enquiry receipt with pause/delete guidance
- [x] Add explicit campaign-plan authorization before any live campaign activity and publish a clearly labeled illustrative deliverable sample
- [x] Run all attached Phase 1 and 2 acceptance checks and stop for Phase 3 approval
- [x] Audit the approved Phase 3 scope and current client/server reliability monitoring configuration
- [x] Configure a privacy-safe Sentry integration with direct project triage access and no CV, form, or contact data capture
- [x] Implement the approved Phase 3 resilience and recovery improvements without changing protected application services
- [x] Add Sentry and Phase 3 regression coverage, validate production behavior, and publish the approved release
- [x] Verify the connected Sentry integration can access the user’s projects and issue-triage tools without adding a duplicate credential path
- [x] Use the configured Sentry connector only for direct project and issue-triage verification; do not request a browser login or a duplicate credential
- [x] Add Sentry and Phase 3 regression coverage and validate the completed release locally; publication is the next step
- [x] Superseded at the user’s instruction: do not inspect or change the user-provided Railway chatbot webhook endpoint
- [x] Stage 1: Assess the candidate-owned application evidence model and define an evidence-backed dashboard view with no fabricated activity
- [x] Stage 2: Implement and verify the authenticated evidence-backed candidate campaign dashboard
- [x] Stage 3: Implement and verify an explicit campaign-start approval checklist for candidate targeting and consent
- [x] Stage 4: Implement and verify a clear application-evidence explanation and a truthful campaign availability indicator
- [x] Stage 5: Implement and verify saved signed-in job preferences that are visible in the candidate campaign plan
- [x] Publish each verified stage and report the completed milestone before continuing to the next stage
- [x] Preserve the configured Groq credential without further user prompts; keep direct provider-health validation as a separately tracked external 403 observation while fallback paths remain covered
- [x] Superseded by the user’s fallback-only direction: do not retry direct Groq credential validation without a renewed request
- [x] Continue the campaign-start checklist stage with the existing fallback-only skill-extraction path and no further Groq credential prompts
- [x] Verify the latest published dashboard and Sentry changes are actively served on the live production domain
- [x] Stage 6: Define and implement a data-backed candidate campaign action center showing plan status, evidence progress, and the next required action without fabricating activity
- [x] Verify and publish the Stage 6 candidate campaign action center across protected data, mobile, tests, type checks, build, and live deployment
- [x] Refine Stage 6 action-center hover, focus, and loading states with reduced-motion-safe transitions
- [x] Stage 7: Implement a data-backed candidate campaign action board without invented activity or outcomes
- [x] Add accessible filtering and sorting controls for the Stage 7 action and evidence items
- [x] Verify and publish Stage 6 interaction polish and Stage 7 management controls across data, mobile, tests, type checks, build, and live deployment
- [x] Reconcile the attached production-readiness brief with the verified Render portal and Cloudflare architecture before changing publication targets
- [x] Audit the live chatbot identity and fail safely to WhatsApp if AutoApply-specific chat cannot be verified
- [x] Remove zoom restrictions and remediate meaningful public accessibility and mobile consent/chat interaction issues
- [x] Replace public privacy-draft language with factual production wording that does not invent legal entity or compliance claims
- [x] Audit and optimize critical public loading, media deferral, and non-critical route/library delivery
- [x] Verify canonical host, redirects, 404 behavior, bilingual routes, and active deployment consistency
- [x] Publish verified non-conflicting improvements through the active Render deployment and document any static-repository conflict for user decision
- [x] Apply approved owner, retention, employer-sharing, and www canonical-host facts to public privacy, terms, and metadata content
- [x] Continue safe hardening: audit authenticated-route failure boundaries, deferred-route recovery, and public asset resilience without initiating Clerk authentication or touching protected automation services
- [x] Continue safe hardening: implement and test only reproducible accessibility or resilience fixes found in the bounded audit
- [x] Continue safe hardening: run full verification, publish the safe fixes, and document any remaining user-controlled authentication follow-up
- [x] Defer the verified Clerk `www.hsndm.tech` allowed-subdomain configuration at the user’s request; preserve the safe dashboard recovery state for later completion
- [x] Finalize non-Clerk production verification for the current live Render release and record the exact deferred passwordless-authentication follow-up
- [x] Diagnose the user-reported live rendering failures across public and dashboard routes, then patch only reproducible defects
- [x] Validate and publish the rendering-repair release with responsive route checks and regression coverage
- [x] Audit every non-hero homepage image and video for a visible, non-blocking loading state in English and Arabic
- [x] Add restrained reduced-motion-safe loading transitions for eligible homepage media without changing layout or copy
- [x] Validate and publish the homepage media-loading enhancement with responsive regression coverage
- [x] Stage 1: reproduce and document mobile ATS-entry visibility and chat/contact-fallback behavior on English and Arabic public routes
- [x] Stage 2: repair the highest-impact verified mobile ATS or contact-entry issue without enabling an unverified AI chatbot
- [x] Stage 3: audit remaining public-site rendering, navigation, media, and route-recovery defects across desktop and mobile
- [x] Stage 4: validate staged repairs with tests, 375px screenshots, live-route checks, and publish the verified release
- [x] Audit current WhatsApp fallback message generation and public route context for bilingual page-aware messages
- [x] Implement page-aware bilingual WhatsApp pre-filled messages without adding personal data or enabling the unverified AI widget
- [x] Validate and publish the page-aware WhatsApp fallback enhancement
- [x] Verify the requested OpenSEO MCP endpoint, authentication model, and supported connector configuration
- [x] Install the OpenSEO MCP connector using the approved project configuration workflow
- [x] Verify the OpenSEO MCP tool catalog and record any user authorization follow-up
- [x] Collect live crawlability, indexability, on-page, and OpenSEO audit evidence for www.hsndm.tech
- [x] Analyze verified SEO findings and select the top three ranking priorities by expected impact and effort
- [x] Deliver the evidence-backed SEO audit summary and top-three improvement plan
- [x] Inventory metadata, sitemap route definitions, image dimensions/formats, and public loading bottlenecks for every primary English and Arabic page
- [x] Apply optimized bilingual page titles, meta descriptions, canonical sitemap/robots corrections, and relevant metadata regressions
- [x] Compress or replace eligible large static images and optimize critical image loading without reducing visible quality
- [x] Validate metadata, image delivery, build output, and responsive routes before publishing the technical SEO release

## Email Routing and Domain Authentication

- [x] Audit current Cloudflare Email Routing status, email DNS records, destination addresses, and available Brevo access for hsndm.tech
- [x] Enable Cloudflare Email Routing and create apply@hsndm.tech, apply1@hsndm.tech, and apply2@hsndm.tech forwarding rules to hasanadam506@gmail.com
- [x] Add or safely merge the required Cloudflare Email Routing MX and SPF DNS records without disrupting existing mail authentication
- [x] Configure and verify Brevo sender-domain authentication records for hsndm.tech using the secured reusable Brevo API connector and account-specific DNS records
- [x] Verify final Cloudflare DNS and routing-rule status; document any remaining Brevo credential requirement separately

## Brevo Outbound Delivery Test

- [x] Confirm Brevo sender readiness for apply@hsndm.tech and send one user-authorized transactional delivery test to hasanadam506@gmail.com
- [x] Verify Brevo’s send response and record the test outcome without sending additional messages

## Cloudflare Email Routing Delivery Diagnosis

- [x] Audit the hsndm.tech Cloudflare zone, Email Routing readiness, forwarding rules, verified destination, and public/root MX records for the three apply aliases
- [x] Repair only a confirmed Cloudflare Email Routing rule, destination, or DNS configuration issue and re-verify readiness; no configuration fault was found, so no change was required

## Outbound Deliverability and Reputation

- [x] Audit SPF, DKIM, DMARC alignment, Brevo sender-domain status, and available message delivery evidence for apply@hsndm.tech
- [x] Apply only verified sender-authentication and deliverability improvements without breaking Cloudflare Email Routing
- [x] Verify the final DNS/authentication state with a post-propagation Brevo delivery re-test and document safe sender-reputation practices for future campaign email; Brevo recorded the controlled Gmail test as delivered

## Three-Client Application Sender Package

- [x] Define and implement clients.csv, client_id job mapping, validated per-client PDF attachment handling, and client-name templating without AI-generated claims
- [x] Preserve sender determinism, MX validation, tracking deduplication, bounded per-identity sending, and opt-out text in the corrected sender script
- [x] Add a reviewed GitHub Actions workflow, example files, and setup guidance without sending any application email during validation
- [x] Run non-sending validation for data mappings, attachment failures, deduplication, and workflow syntax

## autoapply-sa Repository Sender Setup

- [x] Inspect the autoapply-sa repository and preserve any existing sender, workflow, dependency, and data structures that remain compatible
- [x] Add three-client mapping, placeholder PDF handling, jobs-pool client IDs, and non-AI cover-letter safeguards to the repository sender
- [x] Reconcile Brevo sent-event history into tracking.csv when available and configure a reviewable daily GitHub Actions workflow
- [x] Run full non-sending repository validation and perform no more than 15 user-authorized first-run sends after final preflight; the later verified-contact scope completed a bounded ten-recipient run with no automatic retries
- [x] Report sent counts, failures, delivery events, tracking sample, and the exact daily-automation state

## Supplied Client CV GitHub Setup

- [x] Validate the two supplied CV PDFs, map them to client 2 and client 3, and commit them to autoapply-sa without enabling sends
- [x] Keep client 1 blocked pending a real approved PDF and re-run the repository’s non-sending validations after the mapping update
- [x] Push the completed GitHub-side configuration and report the exact remaining audited-delivery prerequisites

## Shared Sender Baseline Reset

- [ ] Replace the autoapply-sa client records and CV artifacts with the confirmed three-placeholder shared baseline without sending email
- [ ] Replace jobs.csv with the requested empty schema and seed tracking.csv with the 12 user-supplied do-not-contact records
- [ ] Retain a non-sending sender and daily workflow, validate the baseline without execution, and push it to GitHub
- [ ] Report the committed repository URL and final sender file tree

## Tracking-Only Warm-Up Preparation

- [x] Append the 12 supplied historical recipients to autoapply-sa tracking.csv only when missing, preserving the 505 existing jobs
- [x] Verify three client mappings, CV readiness, and the preflight-only workflow without running the sender
- [x] Push the tracking-only update and report final counts before any separately approved warm-up run

## Dynamic Client-Driven Sender

- [x] Remove fixed client-count and sender-list assumptions from send_applications.py while retaining client-specific CSV/CV validation
- [x] Add regression coverage for arbitrary client IDs and sender identities, missing CV handling, and client-specific letter identity
- [x] Verify the workflow remains preflight-only, push the refactor, and document the precise files needed to add a client

## Evidence-Gated Clients 2 and 3 Warm-Up

- [x] Audit client 2 and 3 CV artifacts, Brevo sender activation, job-contact evidence, tracking exclusions, and repository delivery controls before a real warm-up send
- [x] Prepare at most five eligible applications for each approved client without assigning missing client IDs from guesswork; superseded by the later user-supplied verified list and its exact five-per-client scoped assignment
- [x] Execute and verify a real warm-up only if all audited delivery controls and evidence requirements pass; superseded by the later user-authorized verified-contact scope, which accepted eight requests and suppressed two uncertain outcomes without retry
- [x] Preserve the preflight-only scheduled workflow and report sent, skipped, failure, and delivery-event evidence without fabrication
- [x] Create and verify Brevo sender identities for apply1@hsndm.tech and apply2@hsndm.tech through the authenticated hsndm.tech domain
- [x] Reconfirm client 2/3 job assignment, public job-URL evidence, and approved dispatcher path before any live warm-up attempt; no client 2/3 rows exist, the CSV has no URL column, and the runtime requires current Auditor approval plus the apply@-only dispatcher

## Authorized One-Time Clients 2 and 3 Warm-Up

- [x] Inspect the user-supplied verified jobs.csv replacement and preserve it as the source of truth for the ten-row warm-up selection
- [x] Inspect and select exactly five valid customer-service, operations, or administration contacts for client 2 and five valid industrial-engineering, operations, quality, or supply-chain contacts for client 3
- [x] Assign only the selected ten rows to clients 2 and 3 and record the user-authorized verified-contact evidence without modifying all other jobs
- [x] Add a narrowly scoped, tested Brevo delivery path for the two active warm-up senders while retaining attachment, MX, deduplication, delay, opt-out, and cap safeguards
- [x] Test the selected warm-up batch without delivery and confirm the scheduled workflow remains dry-run-only
- [x] Run and independently verify one bounded live batch only after the selected clients, PDFs, senders, recipient validation, and preflight checks succeed; eight Brevo requests were accepted and two transport-uncertain recipients were suppressed without retry
- [x] Report sent, skipped, bounce/API, Brevo delivery-event, and tracking evidence after the bounded warm-up
- [x] Maintain a temporary 30-second local status heartbeat for the active one-time warm-up process without scheduling any additional delivery work

## Scheduled Clients 2 and 3 Delivery

- [x] Inspect the current GitHub Actions schedule, client activation rules, and required repository secrets before enabling scheduled real delivery
- [x] Configure the repository BREVO_API_KEY Actions secret; the user confirmed it is set, while the configured GitHub integration still cannot list secrets, so the published workflow verifies credential presence before any delivery
- [x] Implement persistent scheduled selection for future untracked client 2/3 jobs because the current ten assigned rows are fully tracked after the completed warm-up
- [x] Ensure GitHub Actions can persist accepted and uncertain suppression outcomes to tracking.csv before enabling scheduled real delivery
- [x] Configure the 06:00 and 18:00 UTC workflow to invoke the capped live dispatcher for only clients 2 and 3 without a manual dispatch
- [x] Validate, commit, and push the scheduled-delivery configuration without triggering the workflow
- [x] Confirm the 20-per-day maximum, client 1 block, persistent exclusions, safety controls, and inactive background observer state

## Reliability and Trust Improvements

- [x] Reproduce and diagnose the dashboard sign-in recovery failure, first-load blank-state report, and Jeddah map failure across live and local environments
- [x] Add a branded first-load shell and time-bounded visible recovery state so public visitors never see an empty initial screen
- [x] Replace the fragile live map default with a lightweight accessible Jeddah location card while retaining a reliable directions link
- [x] Add a safe dashboard authentication-unavailable recovery surface with direct secure-report contact options and approval-boundary guidance
- [x] Clarify the homepage hero and primary campaign messaging so campaign activity is visibly approval-led, pausable, and fully logged
- [x] Assess and implement safe authentication availability monitoring and evidence-led application-log resilience without fabricating candidate data
- [x] Add focused regressions, run full validation, publish the staged reliability release, and document verified outcomes

## Dashboard Authentication, Performance, and Control Enhancements

- [x] Diagnose the live Clerk publishable-key, provider origin, callback, network, and deployment paths that cause dashboard initialization to time out
- [x] Add a clearly labeled urgent campaign-pause recovery action with bilingual WhatsApp/email handoff and no unsupported promise of instantaneous automatic campaign changes
- [x] Align secondary automation language with approval-led campaign operations in English and Arabic
- [x] Add an indicative-capacity clarification under pricing and clarify that campaign briefs open a contact handoff without transmitting a CV automatically
- [x] Audit and improve mobile loading of the English, Arabic, and campaign-intake routes through safe code and media deferral
- [x] Select and configure authentication availability monitoring with a clear alert destination and a privacy-safe health signal
- [x] Implement the user-selected proactive monitor for auth readiness and Clerk bootstrap, retaining no candidate data and routing failures to hasanadam506@gmail.com plus the existing error-monitoring project
- [x] Route privacy-safe monitor faults to the existing Sentry project and retry the read-only Brevo credential validation after the user-authorized IP update; the invalid web-project key remains safely unused while the active GitHub monitor uses its separate configured repository secret
- [x] Implement the proactive auth monitor in hsndm566/autoapply-sa using its existing BREVO_API_KEY GitHub Actions secret, with technical-only owner alerts and no secret duplication
- [x] Add regressions, verify live and mobile behavior, and publish the completed enhancement release

## Authorized Clerk Allowlist Repair

- [x] Validate the user-supplied Clerk production credential using a read-only instance request without logging the credential
- [x] Discover whether Clerk exposes a supported API for the production subdomain allowlist and add www.hsndm.tech only if the official API supports the mutation; Clerk’s documented Backend API exposes browser-style allowed origins but not the production FAPI subdomain allowlist, so no unsupported mutation was attempted
- [x] Superseded by the independent dashboard-host recovery: Clerk continues to reject www.hsndm.tech because its dashboard-only allowlist cannot be updated with the supplied Backend API key, while dashboard.hsndm.tech accepts the same bootstrap and is now the protected-entry host
- [ ] Run focused dashboard regressions and publish only if source changes are needed

## Independent Clerk Remediation Investigation

- [x] Inspect official Clerk-supported credential-backed and version-control configuration paths for the production FAPI allowed-subdomains setting without relying on a browser dashboard session; no supported non-interactive API, CLI, or configuration-as-code route controls this dashboard-only setting
- [x] Apply only a documented precise configuration update if an independent route exists, then verify the live www.hsndm.tech bootstrap response; no unsupported provider mutation was attempted, and the accepted dashboard first-party hostname was confirmed instead

## Dashboard Host Authentication Recovery

- [x] Route www.hsndm.tech dashboard entry paths to the already Clerk-accepted dashboard.hsndm.tech host without altering public canonical URLs or Clerk security settings
- [ ] Add regression coverage for the dashboard-host redirect and validate live first-party Clerk bootstrap behavior
