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
- [ ] External setup required: point dashboard.hsndm.tech to the managed deployment and complete the Clerk custom-domain DNS verification for clerk.hsndm.tech before live passwordless sign-in can be tested.
- [x] Implement candidate profile settings page and database persistence
- [x] Replace dashboard spinner with skeleton loading UI during data fetch
- [x] Build recent activity feed for application status updates and notifications
- [x] Fix Clerk JS timeout error on public home page without affecting dashboard authentication
- [x] Add dashboard activity notification badge for new feed updates
- [x] Add profile settings Save Changes success toast feedback
- [x] Simulate candidate notification discovery and usability on desktop and mobile
- [x] Add notification preview dropdown for latest activity updates
- [x] Add Mark all as read control to recent activity feed
- [x] Add undo action to profile Save Changes toast
- [x] Diagnose and fix homepage video rendering with phone-safe fallback
- [x] Assess whether additional subdomains are useful for the current architecture
