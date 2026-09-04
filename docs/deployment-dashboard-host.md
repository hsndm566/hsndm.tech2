# Dashboard host deployment requirement

`dashboard.hsndm.tech` must be attached to the same current frontend build that contains the Clerk dashboard route graph. The production audit found the hostname returning HTTP 503 while the source route exists.

The Pages build now includes an SPA fallback (`public/_redirects`) so direct requests such as `/dashboard`, `/dashboard/settings`, and `/dashboard/browser-helper` resolve through the React router instead of becoming static 404s.

The custom hostname still must target the active frontend deployment in Cloudflare. Do not point it at a retired origin.
