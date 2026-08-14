# Azure synchronization and operating contract

## Purpose

This contract defines a repeatable release path from the verified source repository to Azure **after** Azure staging exists. It does not run automatically, create any resource, hold secrets, or alter DNS. Its design keeps `main` as the source of truth while preventing a local laptop or an unverified build from becoming an accidental production source.

> The live service remains unchanged until the Azure staging environment passes the gates in `AZURE_MIGRATION_RUNBOOK.md`. This file prepares the release discipline; it is not a deployment instruction.

## Source-of-truth model

| Object | Source of truth | Synchronization rule |
|---|---|---|
| Application source, Bicep, workflows, and runbooks | `main` in `hsndm566/hsndm.tech` | Every Azure candidate begins from a named, verified commit on `main`. |
| Static release | The Vite `dist/public` build from that commit | Rebuild with the intended `VITE_API_BASE_URL`; never copy a browser cache or a prior local `dist` directory. |
| Backend release | The same commit's Node build, launched with `pnpm start` | Verify `pnpm test`, `pnpm check`, `pnpm build`, and `GET /health` before any traffic allocation. |
| Runtime configuration | Azure Key Vault or equivalent Azure secret mechanism after approval | Values are injected at runtime or build time as appropriate; no value is committed, logged, or placed in an image tag. |
| Database | One named write-primary | Never allow unplanned dual writes between legacy and Azure databases. |
| Production DNS | Existing registrar/DNS host until final traffic gate | Do not alter `hsndm.tech`, `www`, or a future `api` record until staging acceptance is recorded. |

## Manual release path

1. **Verify source.** Start from a clean checkpointed commit. Run `pnpm test`, `pnpm check`, and `pnpm build`. Record the commit SHA and build time in the change record.

2. **Build a staging candidate.** Build the API and static output from that same SHA. For a separately hosted static app, set `VITE_API_BASE_URL` to the staging API origin during this build. The production API URL must never be added until staging acceptance is complete.

3. **Review infrastructure only.** Run an Azure `what-if` against the intended resource group and committed Bicep with the runtime gate still disabled where possible. Compare the output to the approved resource list. A changed resource, region, SKU, or network boundary is a new approval request.

4. **Deploy Azure staging manually.** Use the existing manual GitHub workflow only after its approval phrase, deployment credential, resource group, managed Container Apps environment, and image URI are all intentionally set. The workflow must not create or modify DNS.

5. **Prove staging.** Confirm `/health`, public tRPC requests, CORS from the staging static URL, OAuth callback/session behavior, candidate isolation, ATS behavior, campaign persistence, scheduler behavior, static asset availability, and error monitoring.

6. **Promote deliberately.** Create a production revision from the accepted artifact, observe it through its Azure hostname, complete the data cutover plan, rebuild the static frontend with `https://api.hsndm.tech`, and change DNS only in the approved maintenance window.

7. **Retain recovery.** Keep the prior API, database connection, static release, and Container Apps revision available for the agreed observation window. Record both technical and data-reconciliation status before retirement.

## Required GitHub configuration after Azure approval

| Name | Type | Use |
|---|---|---|
| `AZURE_CREDENTIALS` | Environment secret | Azure deployment identity credential; never store it in repository files. |
| `AZURE_SUBSCRIPTION_ID` | Environment variable | Active Azure subscription identifier. |
| `AZURE_RESOURCE_GROUP` | Environment variable | Target resource group; use a staging group before production. |
| `AZURE_CONTAINER_APPS_ENVIRONMENT_ID` | Environment variable | Pre-created managed environment identifier for the staged API. |
| `AZURE_CONTAINER_IMAGE` | Workflow input or environment variable | Immutable image URI tagged with the verified source commit. |
| Application runtime values | Azure secret references | Database, JWT, OAuth, analytics, notification, and storage values required by the Node service. |

## Continuous synchronization after Azure is live

The appropriate long-term model is **manual promotion from a verified commit**, not an automatic push on every edit. A release can be prepared from `main` whenever needed, but the production workflow remains a manually dispatched action with an explicit environment gate. This allows ordinary website changes to keep using the current release process while Azure staging or production is promoted only after verification.

| Situation | Required action |
|---|---|
| Static-only content or UI change | Build a static artifact from the verified commit; deploy to the approved static host only after its route/SEO check. |
| API change | Build a new immutable backend candidate from the same commit; run tests and stage it as a new Container Apps revision. |
| Database schema change | Apply the schema plan once to the intended write-primary, verify it, then deploy compatible application code. Do not use code deployment as a migration mechanism. |
| Secret rotation | Update the controlled secret store, restart/revise the affected runtime, and verify health without exposing the old or new value. |
| Incident rollback | Revert to the last healthy static artifact/API revision; reconcile writes before changing a database primary. |

## Approval boundaries

| Boundary | Requires explicit approval | Safe preparation allowed now |
|---|---|---|
| Azure resource group, Container Apps environment, registry, database, storage, Key Vault, Static Web App, or monitoring | Yes: resource creation can incur usage and changes the cloud estate. | Bicep review, source build, `what-if` only where a pre-existing resource group is available. |
| Azure credentials and GitHub environment secrets | Yes: these grant deployment capability. | Prepare secret-name inventory and least-privilege role specification. |
| Data copy or migration | Yes: it accesses and may change candidate data. | Schema/source compatibility and rollback planning. |
| DNS or custom-domain move | Yes: it changes visitor routing. | DNS inventory, ownership validation planning, and TTL plan. |

## Evidence to attach to every release

Every staged or production migration action should retain the verified commit SHA, test/type/build results, Bicep `what-if` output, deployed image digest, health-check timestamp, smoke-test record, data reconciliation result, DNS change record if any, and named rollback revision/artifact.
