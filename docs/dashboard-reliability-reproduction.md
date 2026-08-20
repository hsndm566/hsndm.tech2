# Dashboard Reliability Reproduction — 2026-08-20

## Live production observation

At `https://www.hsndm.tech/dashboard`, the root application loaded but did not render the dashboard or a time-bounded recovery surface after initialization. The viewport remained on a nearly empty cream page with only a centered loading spinner, plus the global cookie-settings and WhatsApp controls. The repeated page view after loading showed the same state.

## Impact

This confirms a higher-severity version of the reported dashboard sign-in problem: a visitor can be left in an indefinite, non-explanatory loading state rather than seeing a usable authentication recovery option.

## Remediation target

The dashboard must render a branded, accessible, time-bounded authentication recovery surface that keeps secure campaign-report contact routes available and does not claim access to candidate data when the identity provider is unavailable.
