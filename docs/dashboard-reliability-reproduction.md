# Dashboard Reliability Reproduction — 2026-08-20

## Live production observation

At `https://www.hsndm.tech/dashboard`, the root application loaded but did not render the dashboard or a time-bounded recovery surface after initialization. The viewport remained on a nearly empty cream page with only a centered loading spinner, plus the global cookie-settings and WhatsApp controls. The repeated page view after loading showed the same state.

## Impact

This confirms a higher-severity version of the reported dashboard sign-in problem: a visitor can be left in an indefinite, non-explanatory loading state rather than seeing a usable authentication recovery option.

## Remediation target

The dashboard must render a branded, accessible, time-bounded authentication recovery surface that keeps secure campaign-report contact routes available and does not claim access to candidate data when the identity provider is unavailable.

## Post-publication recheck

The live `www.hsndm.tech/dashboard` route initially displayed the existing safe loading recovery card with retry, email, and WhatsApp exits rather than an empty page. A second observation then returned to the bare loading spinner after the route attempted to initialize. This confirms the external Clerk or route-loading dependency still requires a separate browser-level authentication investigation, while the source release preserves improved first-paint and recovery behavior for the deployed bundle as it propagates.

## Live Clerk bootstrap diagnosis

On `www.hsndm.tech`, the Clerk browser bundle initializes (`window.Clerk` is present, version `5.127.2`) but remains unloaded. The browser requested `https://clerk.hsndm.tech/v1/environment` and `/v1/client`; direct, non-mutating browser fetch checks returned `403` for both endpoints. This is a Clerk-side custom-domain, allowed-origin, or proxy configuration rejection—not a candidate-data, server database, or dashboard code failure. No sign-in attempt, account creation, or magic-link request was made during diagnosis.
