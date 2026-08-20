# Dashboard Authentication Recovery Notes

- 2026-08-20: Clerk Frontend API bootstrap accepted requests from `https://hsndm.tech` and `https://dashboard.hsndm.tech`, while it rejected `https://www.hsndm.tech` with `subdomain_not_allowed`.
- The public canonical host remains `www.hsndm.tech`; only `/dashboard` and nested dashboard paths are routed to `dashboard.hsndm.tech`.
- A live unauthenticated browser visit to `https://dashboard.hsndm.tech/dashboard` renders the existing privacy-safe loading shell without exposing candidate data. Further client-boundary behavior will be validated after the routing update is published.
