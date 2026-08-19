# Current Safe-Hardening Audit Notes

- On 2026-08-18, `https://hsndm.tech/` followed the canonical route to `https://www.hsndm.tech/` and returned the current public portal.
- The current Render release returns HTTP 404 for an unknown public path and for an unknown same-origin API path.
- The canonical English page rendered the current factual trust strip, revised secondary CTA, and WhatsApp-only public contact fallback.
- On direct navigation to `/ar`, the recoverable lazy-route panel was briefly visible before the Arabic route completed and rendered normally. This is a candidate performance/resilience observation; no error persisted after the bundle settled.
- The map surface fell back to its existing directions recovery UI in the browser environment. The fallback remains usable; no map credential or integration mutation is in scope for this bounded audit.
- The unauthenticated `/dashboard` route exposed no candidate data, but the custom Clerk client’s environment and client requests completed in roughly 8.5 seconds—slightly beyond the portal’s prior 8-second fallback threshold. The dashboard now preserves a bounded 15-second grace period before declaring sign-in unavailable; this does not submit a login request or change any Clerk account configuration.
- On 2026-08-19, the live English homepage rendered its content immediately but initially showed a blank hero-media panel before the hero visual settled. This is reproducible as a first-render presentation issue and is now being traced through the poster/video component and public route loading behavior.
