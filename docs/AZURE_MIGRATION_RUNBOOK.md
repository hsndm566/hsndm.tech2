# AutoApply SA Azure migration runbook

## Objective and non-negotiable safety gate

This runbook defines how to move **the static website, the Node.js Express/tRPC API, the database, secrets, scheduled operations, and operational observability** to Azure when the current Railway/managed deployment must be replaced. It is a readiness document, not an authorization to create resources. The checked-in Azure Bicep template remains inert because `deployRuntime=false` by default.

> **No-credit rule:** Until an explicit production-migration approval is given, do not create a resource group, Container Apps environment, database, Key Vault, container registry, Static Web App, Azure DNS zone, migration service, DNS record, or paid monitoring resource. The only permitted work is source inspection, documentation, build verification, and Azure `what-if` validation that causes no resource creation.

## Current verified architecture

The repository produces a React/Vite static build and an Express/tRPC Node service through `pnpm build`; the service starts through `pnpm start`, respects its platform-supplied `PORT`, and exposes `/health`. The static deployment at `hsndm.tech` is a GitHub Pages marketing mirror. It cannot itself serve `/api/trpc`, the OAuth callback, database queries, candidate sessions, notifications, or backup routines. The managed full-stack deployment remains the documented system of record until an Azure cutover is tested. [1] [2]

The frontend already supports a separate API origin through `VITE_API_BASE_URL`. That means an Azure API can be introduced without rewriting the client, but **the frontend must be rebuilt** with the Azure URL before it is served as the independent static site. Simply copying GitHub Pages files to Azure would not move the application backend or make authenticated flows work. [1] [2]

| Layer | Current role | Azure target after approval | Verification before cutover |
|---|---|---|---|
| Public static site | GitHub Pages static marketing mirror at `hsndm.tech` | Azure Static Web Apps serving the canonical Vite output | Direct routes, EN/AR pages, sitemap, robots, static media, and cache headers load from the Azure preview URL. |
| API | Express 4 + tRPC 11 API at `/api/trpc` | Azure Container Apps running the bundled Node service | `/health` is HTTP 200; public and authenticated tRPC procedures pass against the Azure endpoint. |
| Identity | Current Manus OAuth/JWT integration | Reuse only if callback and token issuance are explicitly proven to permit Azure origins; otherwise a separately approved identity migration | Login, callback, logout, session renewal, and cross-origin credential behavior pass on the Azure staging host. |
| Database | MySQL/TiDB-compatible candidate and operational data | Azure Database for MySQL – Flexible Server, subject to schema compatibility test | Schema parity, row counts, critical ownership queries, and post-migration application smoke tests pass. |
| Secrets | Project/host runtime variables | Azure Key Vault referenced through a managed identity or equivalent controlled runtime injection | No value is committed, logged, rendered in the client bundle, or placed in a command argument. |
| Scheduled work | Existing scheduled backup and operational routines | Azure Container Apps Jobs or another explicitly approved Azure scheduler | One isolated, idempotent manual run succeeds and produces an auditable result. |
| Assets | Static build plus external `/manus-storage/` media references | Azure Static Web Apps/Blob-hosted first-party assets under a verified asset manifest | Every referenced media URL returns successfully without a dependency on a former host. |
| Monitoring | Existing uptime/error workflow and health route | Azure Monitor/Application Insights only after approval, while existing external monitoring remains during cutover | Health, logs, error alerts, and response time can be checked for both legacy and Azure endpoints. |

### Live-source reconciliation gate

The prior notes mention both a Railway fallback and a managed full-stack service. Before creating Azure resources, the operator must record the actual production API hostname, active database hostname, OAuth callback URLs, current static deployment hostname, and current DNS records in a single cutover worksheet. This prevents migrating stale configuration or switching a domain away from the live system accidentally.

## Target design

The required independent Azure shape is:

```text
Browser
  ├── https://hsndm.tech        → Azure Static Web Apps (React/Vite build)
  └── https://api.hsndm.tech    → Azure Container Apps (Express/tRPC)
                                      ├── Azure Database for MySQL
                                      ├── Key Vault / managed identity
                                      ├── approved scheduler or Container Apps Job
                                      └── application logs and health telemetry
```

Azure Container Apps revisions can keep an older revision active while a newer revision is validated, and support controlled traffic splitting when multiple revisions are used. That makes revision-level recovery practical **after the Azure API exists**, but it does not replace database cutover discipline. [3]

Azure Static Web Apps supports domain ownership validation with a TXT record before changing live DNS records. This enables prevalidation of `hsndm.tech` and `www.hsndm.tech` without immediately moving visitor traffic. [4]

## Blockers that must be proven, not assumed

| Blocker | Why it matters | Required proof |
|---|---|---|
| OAuth portability | The current authentication uses Manus-specific OAuth settings and callback behavior. An Azure API hostname cannot be assumed to be accepted. | A non-production callback URL is registered and completes login, callback, cookie/session, and logout successfully. If this fails, choose a separately approved portable identity solution before cutover. |
| Database compatibility | Azure DMS documentation addresses MySQL sources; TiDB-specific SQL or behavior may need adaptation. | Restore a sanitized schema/data copy to a temporary target and run Drizzle migration, ownership, and CRUD tests. |
| Writable-data cutover | Two active databases create divergent candidate/application records. A DNS rollback cannot safely undo writes made only in Azure. | A maintenance or read-only window, final data sync procedure, and a named write-primary are approved before traffic moves. |
| Asset independence | `/manus-storage/` URLs are an external hosting dependency. | An asset manifest lists every image/video/font URL and each is copied to the new first-party static location or explicitly retained by agreement. |
| Cross-origin cookies/CORS | `hsndm.tech` and `api.hsndm.tech` are different origins. Authenticated tRPC requests need correctly configured CORS, cookies, and CSP. | Browser tests from the static Azure preview prove credentials, unauthenticated errors, OAuth redirects, and protected dashboard calls. |
| Cost boundary | A Container Apps environment, MySQL server, monitoring, storage, and migration service can have billing implications. | The user explicitly approves the region, target services, SKU/scale, and an Azure deployment plan after `what-if` output is reviewed. |

## Staged migration sequence

### Stage A — zero-credit readiness: allowed now

Build the current application, run tests, export an immutable release manifest, and produce a database inventory containing schema version, table counts, and a recovery point. Create an asset manifest from the production build and list all `/manus-storage/` references. Capture the current DNS records and lower TTL values only when a cutover is scheduled; do not change records now.

Use the existing `infra/azure/main.bicep` only with `deployRuntime=false` for syntax and `what-if` review. Do not change the parameter to `true`, and do not run a deployment command. The output should be attached to the change record rather than used as an instruction to create anything.

### Stage B — explicit approval gate: required before any Azure resource exists

Obtain one clear approval that names the selected Azure region, resource group, static-hosting choice, Container Apps scaling limits, MySQL SKU, secret manager, migration approach, and change window. At this point, establish a deployment identity with the minimum Azure role needed for the selected resource group; do not use a broad personal-owner credential in CI.

Generate a container image from the exact tested commit, not from uncommitted local files. The image must run `pnpm build`, execute `pnpm start`, bind the injected `PORT`, and pass `GET /health`. Create a staging environment before production and inject every runtime value from controlled secrets: `DATABASE_URL`, `JWT_SECRET`, OAuth settings, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, notification configuration, and any storage/scheduler configuration. Keep all values out of source control and the browser bundle.

### Stage C — data and identity validation: no public traffic

Provision only the approved non-production resources. First prove whether the current OAuth provider accepts an Azure staging callback. If it does not, stop: an identity migration is a product decision, not a deployment detail.

For the database, assess the source engine and schema before choosing a migration path. Azure Database Migration Service supports online migration from supported MySQL versions when binlog and replication prerequisites are available, but source capability and TiDB compatibility must be checked first. The official guidance requires testing and final cutover after replication lag approaches zero. [5]

Run application tests against the staging API and staging database, including candidate isolation, saved resume metadata, job applications, campaign-readiness persistence, ATS review metadata, operational alerts, and scheduled-backup behavior. Validate that no CV file content or extracted CV text is persisted contrary to the existing privacy contract.

### Stage D — static-site and API prevalidation: no `hsndm.tech` traffic change

Build the static client with the approved staging API URL:

```bash
VITE_API_BASE_URL=https://staging-api.example.com pnpm build
```

Deploy the resulting `dist/public` output to a non-production static hostname. Verify all public EN/AR routes, static direct-access pages, canonical tags, sitemap, CNAME behavior, mobile rendering, client-side CV extraction, and WhatsApp handoffs. The API should be exposed through a staging API hostname with restrictive CORS that includes only the staging static origin.

Prevalidate the future production custom domain on Azure Static Web Apps with its TXT ownership record. Microsoft documents this as the first step of a zero-downtime custom-domain migration, followed by the final CNAME, ALIAS, or A-record update only after validation. [4]

### Stage E — production cutover: planned maintenance window

Freeze schema changes. Name a single writable primary and show a clear maintenance/read-only status for database-writing flows while final synchronization happens. Do not run two independent writable databases.

Complete final database synchronization, run row-count and critical-query reconciliation, then update the Azure API to use the target database and live secret set. First change `api.hsndm.tech` to the tested Container Apps endpoint and validate health, CORS, OAuth, dashboard, ATS, campaign persistence, and scheduler behavior. Rebuild the static client with `VITE_API_BASE_URL=https://api.hsndm.tech`, deploy the exact artifact to Azure Static Web Apps, and only then move `hsndm.tech`/`www.hsndm.tech` DNS.

Keep the prior production API and its database intact during the observation window. Azure Container Apps can retain a prior revision and move traffic between revisions for an API-code failure, but database recovery uses the separately documented backup and write-freeze plan. [3]

### Stage F — stabilization and legacy retirement

Observe real traffic, error rate, latency, database connections, OAuth failures, and application writes for an agreed period. Keep GitHub Pages as a non-production artifact mirror until the Azure deployment is stable, but do not let it present a stale live domain. Retire Railway or former managed hosting only after the user approves the final validation record and confirms a recoverable database backup exists.

## Rollback matrix

| Failure point | Safe rollback | Data limitation |
|---|---|---|
| Azure API revision does not become healthy | Keep traffic on the older healthy Container Apps revision or original API endpoint; do not move static DNS. | No data impact if no writes reached the new revision. |
| Azure static preview fails | Keep `hsndm.tech` on the old static host and rebuild from the recorded release manifest. | No data impact. |
| OAuth callback/session fails | Point static frontend back to the verified old API and retain current OAuth configuration. | Avoid allowing protected writes before OAuth passes. |
| Database reconciliation fails before final sync | Stop migration and keep old system as write-primary. | Discard/recreate the Azure target only after data is preserved. |
| Failure after Azure receives writes | Do not blindly flip DNS back. Enter maintenance mode, identify Azure-only writes, reconcile them into the selected write-primary, then move traffic. | A database rollback is a data migration exercise, not a DNS operation. |
| Asset missing after static cutover | Revert only the static release to the previous recorded artifact or upload the verified missing asset, then revalidate. | No database impact. |

## Required operator inputs before approval

| Input | Why it is required |
|---|---|
| Current live API, database, OAuth callback, and DNS inventory | Resolves the existing live-source ambiguity and determines what must be moved. |
| Chosen Azure region and permitted monthly budget | Required before resource/SKU selection; this runbook makes no cost assumption. |
| Identity decision | Confirms that current OAuth supports Azure callback URLs or approves a replacement migration. |
| Asset ownership/retention decision | Authorizes copying owned images/video into Azure storage/static hosting and identifies any intentionally external URLs. |
| Maintenance window and rollback owner | Prevents write divergence and gives one person authority to halt or revert the cutover. |
| Explicit resource-creation approval | Separates harmless planning from billable infrastructure deployment. |

## References

[1] [Production deployment boundary](./PRODUCTION_DEPLOYMENT_BOUNDARY.md)

[2] [Railway deployment handoff](../RAILWAY_DEPLOYMENT.md)

[3] [Microsoft Learn: Azure Container Apps revisions](https://learn.microsoft.com/en-us/azure/container-apps/revisions)

[4] [Microsoft Learn: Custom domains with Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)

[5] [Microsoft Learn: Online migration to Azure Database for MySQL – Flexible Server](https://learn.microsoft.com/en-us/azure/dms/tutorial-mysql-azure-external-to-flex-online-portal)
