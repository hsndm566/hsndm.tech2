# Dashboard Authentication Recovery Notes

- 2026-08-20: Clerk Frontend API bootstrap accepted requests from `https://hsndm.tech` and `https://dashboard.hsndm.tech`, while it rejected `https://www.hsndm.tech` with `subdomain_not_allowed`.
- The public canonical host remains `www.hsndm.tech`; only `/dashboard` and nested dashboard paths are routed to `dashboard.hsndm.tech`.
- A live unauthenticated browser visit to `https://dashboard.hsndm.tech/dashboard` renders the existing privacy-safe loading shell without exposing candidate data. Further client-boundary behavior will be validated after the routing update is published.
- After Render reported checkpoint `3c7e26e6` live, `www.hsndm.tech/dashboard?from=auth-recovery#verify` still remained on the static first-paint shell instead of hydrating into the new route redirect. This indicates a separate client entry/hydration fault that must be addressed before the redirect can be observed in a browser.
- The same static first-paint shell persists on `https://www.hsndm.tech/`, confirming a portal-wide client hydration fault rather than a dashboard-only Clerk or redirect failure.
- Live dynamic-module inspection identified the exact failure as `Cannot set properties of undefined (setting 'Activity')` inside the Clerk chunk. The installed `@clerk/clerk-react` 5.61.3 peer contract requires React 19.2.3 or later; the project was on React and React DOM 19.2.1. Updating both to 19.2.3 restored local homepage and dashboard hydration.
- Render deployment history confirmed checkpoint `3c7e26e6` reached `live` before the global hydration diagnosis. The follow-up compatibility release will be verified against the same portal service after its automatic main-branch deployment completes.
