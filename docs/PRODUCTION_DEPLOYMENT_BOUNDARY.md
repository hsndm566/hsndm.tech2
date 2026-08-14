# Production deployment boundary

## Active application

The managed Manus deployment is the active full-stack application. It serves the React client together with the Express/tRPC API, Manus OAuth, database access, candidate dashboard, ATS analysis, operational notifications, and scheduled backup routines. The frontend tRPC client uses `/api/trpc` with authenticated cookie or bearer-token forwarding.

## GitHub Pages mirror

The `hsndm.tech` GitHub Pages repository is a static marketing mirror. Its built client currently uses the same-origin `/api/trpc` fallback and does not contain a configured external API base URL. GitHub Pages cannot host the Express/tRPC API, OAuth callback, database, or scheduled work. Consequently, brochure pages work there, while authenticated and database-backed flows require the managed Manus deployment.

## Independent-hosting gap

To operate independently of Manus, a separate backend host must run the Express/tRPC service and expose HTTPS API and OAuth callback URLs. The static frontend must then receive that backend origin as its production `VITE_API_BASE_URL`, and its OAuth, CORS, cookies, database connection, monitoring, and secret management must be migrated and verified. This is a planned migration project, not a safe one-variable switch.

## Current recommendation

Keep the managed Manus deployment as the system of record. Treat the GitHub Pages version as a public static mirror until a tested backend cutover plan is explicitly approved. Do not introduce Clerk or Neon solely to solve this boundary; either would add a separate authentication or database migration without providing the missing API host.
