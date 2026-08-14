# Azure live dependency worksheet

**Purpose:** This is the release-control worksheet that must be completed before any Azure resource, database migration, secret transfer, or DNS move. It intentionally records unknowns as unknown rather than guessing from source code or exposing secret values.

## 1. Public endpoints and DNS

| Dependency | Current verified value | Intended Azure value | Status before resource creation |
|---|---|---|---|
| Public web root | `https://hsndm.tech` | Azure Static Web Apps custom domain, after acceptance | Verified current GitHub Pages response and DNS; no move authorized. |
| Public web `www` | `https://www.hsndm.tech` is accepted by API CORS configuration | Azure Static Web Apps `www` custom domain or redirect, after acceptance | DNS record and redirect behavior still need registrar-side verification. |
| Active managed application | `https://hsndmstudio-lyaavagg.manus.space` | Retained fallback during Azure staging | Verified HTTP 200 Express-backed response. |
| Public API | Current managed same-origin API: `https://hsndmstudio-lyaavagg.manus.space/api/trpc` | `https://api.hsndm.tech/api/trpc` from Azure Container Apps | Azure hostname and custom domain are not provisioned. |
| Health endpoint | `https://hsndmstudio-lyaavagg.manus.space/health` | `https://api.hsndm.tech/health` | Route is implemented; Azure health probe not yet configured. |
| Current DNS evidence | `hsndm.tech` resolves to GitHub Pages address space; managed domain resolves through Cloudflare | DNS change only after static/API staging acceptance | No DNS record was modified. |

## 2. OAuth and session dependency

| Item | Current implementation | Azure migration requirement | Verification status |
|---|---|---|---|
| Callback route | `/api/oauth/callback` | The current OAuth provider must explicitly accept the Azure staging callback and later the `api.hsndm.tech` callback. | Route is verified in source; provider registration is unverified. |
| Current full callback URL | `https://hsndmstudio-lyaavagg.manus.space/api/oauth/callback` | Staging: `https://<azure-staging-api>/api/oauth/callback`; production: `https://api.hsndm.tech/api/oauth/callback` | Managed path inferred from the live service boundary; Azure values are planned only. |
| OAuth service dependency | `OAUTH_SERVER_URL` exchanges authorization codes and reads user information. | Preserve provider compatibility or approve a separate identity migration before public cutover. | Runtime host/value intentionally not copied or exposed. |
| Session integrity | JWT uses `JWT_SECRET`; callback validates a one-time OAuth state cookie. | Preserve cookie and CSRF behavior, inject the existing secret only through approved Azure secret management, and test cross-origin credentials. | Source implementation verified; Azure behavior not yet tested. |
| Browser fallback | The client can attach a session-storage bearer fallback when embedded browser cookies fail. | Test only after the Azure static origin and Azure API origin exist. | Planned. |

## 3. Database write-primary and migration boundary

| Item | Current known fact | Required Azure action | Status |
|---|---|---|---|
| Database access model | Drizzle uses `mysql2` with a secret `DATABASE_URL`. | Azure target should be a compatible MySQL service only after source-engine/version and data-migration compatibility are proven. | Provider host/version deliberately unverified because the live connection string is a secret. |
| Current write-primary | The current database behind `DATABASE_URL` is the only authorized write-primary. | Name a single Azure target write-primary only at final data cutover; no dual writes. | No Azure database exists. |
| Core tables | `users`, `campaign_readiness`, `job_applications`, `candidate_profiles`, `backup_snapshots`, `system_jobs`. | Migrate schema and records together, preserving open-ID ownership and job/snapshot indexes. | Schema inventory verified. |
| Candidate privacy | Campaign readiness intentionally excludes CV file bytes and CV text; candidate profile has bounded resume metadata only. | Maintain that privacy boundary in every Azure backup/migration. | Verified in schema. |
| Record reconciliation | Daily snapshot payload includes users, campaign readiness, applications, and profiles, with recorded counts/checksum. | Compare counts/checksums before and after final migration. | Current snapshot storage keys and contents remain private. |

## 4. Assets, storage, and backups

| Item | Current dependency | Required Azure disposition | Status |
|---|---|---|---|
| Public visual assets | Five `/manus-storage/` image/video paths listed in `AZURE_RELEASE_MANIFEST.md`. | Copy only approved original media to Azure Blob/static hosting, update source references, rebuild, and test. | Not transferred. |
| Storage proxy | `/manus-storage/*` is served by an authenticated Forge/S3-backed proxy. | Replace or intentionally retain the dependency; Azure static hosting alone cannot proxy it. | Azure storage not provisioned. |
| Private backup payloads | Daily database JSON snapshot is uploaded to private object storage at `private-backups/autoapply-sa/database-YYYY-MM-DD.json`. | Establish approved Azure private storage and retention policy before moving backup responsibility. | Existing private backup remains the recovery source. |
| Backup integrity | Snapshot metadata records SHA-256, byte size, counts, task UID, and date key. | Reproduce metadata and restore-test controls in the Azure successor. | Implementation verified; no Azure replacement exists. |

## 5. Operational jobs and owner notifications

| Job or integration | Current role | Azure successor | Status |
|---|---|---|---|
| Daily data backup | Cron-authenticated `POST /api/scheduled/data-backup`; task UID `hokZ5SUKPBtg5jRo`; scheduled at 01:00 UTC. | Azure Container Apps Job or a separately approved scheduler with one idempotent daily run. | Not migrated. |
| Owner failure alerts | Server-side notifications for workflow failures. | Confirm the notification provider remains reachable from Azure or replace it with an approved Azure-compatible channel. | Runtime configuration/provider credentials are intentionally unverified. |
| ATS analysis | Server-side `gpt-5-mini` access through existing built-in Forge configuration. | Confirm allowed egress, model access, and secret/API configuration before Azure cutover. | Current Azure-compatible integration is unverified. |
| Client-side CV parsing | Browser-local PDF/DOCX/TXT extraction and matching. | Static frontend artifact preserves it; no database or Azure API migration is needed for parsing itself. | Verified by current build. |

## 6. Required pre-provisioning facts still to be supplied or verified

| Fact | Why it cannot be guessed | Minimum verification method |
|---|---|---|
| Current database provider, host, engine/version, and storage size | The live `DATABASE_URL` is secret and not readable from source. | Read-only provider console or CLI inventory; record only non-secret metadata here. |
| Current OAuth provider callback allowlist | Source has a route but cannot prove provider-side registration. | Provider console/API confirms the managed and Azure staging callback URLs. |
| DNS registrar records and TTL values | Public resolution alone does not list all registrar-side records/TTL. | Read-only DNS/registrar inventory. |
| Asset source originals and rights/retention policy | The build references hosted paths, not a managed media catalog. | Identify approved original file locations, media sizes/codecs, and retention owner. |
| Azure region and budget limit | They are a business decision and determine the first cloud resource configuration. | User-approved written selection before provisioning. |
| OIDC tenant ID and federated credential state | Current GitHub integration cannot enumerate Actions secrets. | Device-code or authorized GitHub/Azure settings inspection; never paste credentials into chat. |

## Readiness determination

**No Azure resource can be created safely yet.** The code, static build, asset paths, routing, scheduled job, and deployment contracts are preserved and documented. The remaining blockers are account-level facts: a working authenticated Azure control path, OAuth callback portability, database source metadata, DNS/asset ownership records, and a user-approved Azure region/budget. Once those are confirmed, the first action is a staging resource group only; it does not move data or traffic.
