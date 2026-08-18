# Phase 1 Launch-Readiness Audit

## Reproduced findings

The audited English home, Arabic home, campaign intake, ATS, privacy, and terms routes render substantive application content when their React bundles load. However, the initial consent dialog is visually dominant on every route and overlays the primary CTA or form content. This conflicts with the requested non-blocking, page-visible consent experience.

The current loading fallback is an empty `main` element, so a delayed or unavailable lazy route chunk can present a blank viewport. The global error boundary also exposes an error stack and has no bilingual support, contact escape path, or explicit no-data-sent assurance. There is no independent no-JavaScript fallback: direct public routes are generated as SPA shells and always require the client bundle.

## Phase 1 remediation direction

The implementation will replace the empty route-loading fallback with meaningful bilingual recovery content, add resettable route-level error recovery, generate separate static no-JavaScript documents for the approved routes, and reduce consent to a compact, privacy-safe panel that leaves the active route visible. Existing optional analytics will be extended to record anonymous reliability events only after consent.
