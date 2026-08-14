# Release reconciliation

| Staged capability | Managed Manus deployment | GitHub Pages mirror at `hsndm.tech` | Dependency boundary |
|---|---|---|---|
| Public EN/AR landing pages, information pages, pricing, FAQ, SEO, sitemap, robots, and static assets | Available | Available | Static build only |
| Canonical Saudi city and industry selectors, local CV parsing, and local role matching | Available | Available | Browser-local logic |
| WhatsApp campaign handoff | Available | Available | Client-generated WhatsApp link |
| ATS AI review and export | Available | Interface is present, but AI review requires the API | `/api/trpc` and server LLM access |
| Candidate dashboard and private resume metadata | Available | Interface is present, but authenticated data requires the API | OAuth, `/api/trpc`, database |
| Campaign readiness persistence and application tracking | Available | Not independently available | `/api/trpc`, database |
| Owner failure notifications and scheduled backups | Available | Not available | Server runtime, notifications, scheduler |
| OAuth login and candidate isolation | Available | Not independently available | OAuth callback, cookies, database |

The managed Manus deployment is therefore the active application system of record. The GitHub Pages release is verified as a static public mirror and is not a safe substitute for the managed backend until an external API host, OAuth callback, database connection, secrets, and production API base URL are migrated together.

## Stage-by-stage dependency map

| Optimization stage | Managed Manus status | GitHub Pages status | Required runtime dependency |
|---|---|---|---|
| Stage 0: hosting, TLS, route, and SEO audit | Verified | Static routes and crawler files mirrored | None beyond static hosting |
| Stage 1: application/profile persistence and daily backup | Active | Not available | Database, `/api/trpc`, scheduler |
| Stage 2: candidate authentication isolation | Active | Not independently available | OAuth, cookies, database |
| Stage 3: ATS analysis, loading, and export | Active | Local upload UI/export only | `/api/trpc` and server LLM for analysis |
| Stage 4: Saudi city/industry taxonomy | Active | Available | Browser-local taxonomy data |
| Stage 5: bilingual campaign and public information pages | Active | Available | Static build; WhatsApp links are client-generated |
| Stage 6: pricing routes | Active | Available | Static contact-only handoff |
| Stage 7: owner failure visibility | Active | Not available | Server notifications and `/api/trpc` |
| Stage 8: metadata, sitemap, robots, and mobile checks | Verified | Available | Static build and crawler files |
| Candidate dashboard, notes, and resume metadata | Active | Not independently available | OAuth, `/api/trpc`, database |
| Automated uptime/backup reporting | Active | Not available | Scheduled jobs and server-side notification access |
