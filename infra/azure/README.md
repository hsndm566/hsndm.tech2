# Azure Fallback Blueprint — Not Provisioned

This directory contains **planning and deployment templates only**. Nothing here creates Azure resources by itself. The current production topology remains unchanged:

| Current component | Current provider | Prepared Azure fallback | Activation condition |
| --- | --- | --- | --- |
| Public marketing frontend | GitHub Pages at `hsndm.tech` | Keep GitHub Pages initially; Azure Static Web Apps is optional later | Explicit approval to move the frontend or DNS |
| Node.js Express + tRPC API | Railway | Azure Container Apps | Explicit approval plus confirmed Azure credits/budget |
| MySQL-compatible data | Current `DATABASE_URL` provider | Azure Database for MySQL – Flexible Server | Explicit approval plus tested data migration |
| Manus-backed media proxy | Manus Forge / S3 helper | Azure Blob Storage only if the app must become independent of Manus storage | Separate storage migration approval |
| Health endpoint | Railway `/health` | Azure Container Apps liveness/readiness checks at `/health` | Deployment activation |
| Public API origin | Railway URL via `VITE_API_BASE_URL` | Azure Container Apps URL, then optional `api.hsndm.tech` CNAME | After smoke tests pass |

## Zero-cutover sequence

The later migration must preserve the current static frontend while the backend is verified independently. First, create an Azure resource group and an Entra deployment identity. Next, deploy the API to a non-production Azure Container Apps URL, injecting the same environment-variable names listed in `azure-fallback.env.example`. Then create the target MySQL service and copy only the schema and data through a tested migration. Do not change `VITE_API_BASE_URL`, CORS, DNS, or `hsndm.tech` until the Azure `/health`, tRPC, OAuth callback, authenticated dashboard, and storage behavior are validated.

> The Azure Container Apps design is intended to reproduce the current Railway runtime: `pnpm build`, `pnpm start`, environment-provided `PORT`, and `GET /health`. It is a plan, not a live deployment. The frontend can remain on GitHub Pages while a separate API origin is tested.[1]

## Cutover guardrails

| Gate | Required evidence before it can pass |
| --- | --- |
| Cost gate | The user explicitly authorizes provisioning and confirms the Azure budget or credit use. |
| Data gate | A tested MySQL migration exists; source data stays intact and a rollback connection string is retained. |
| Application gate | Azure `/health`, API CORS from `https://hsndm.tech`, tRPC procedure smoke tests, OAuth callback, and dashboard access all pass. |
| Traffic gate | The GitHub Pages build is rebuilt with the staged Azure API origin only after the prior gates pass. |
| DNS gate | Any API custom domain is validated before the existing backend endpoint or web domain is changed. |
| Rollback gate | The old Railway `VITE_API_BASE_URL` and database connection remain available until post-cutover verification completes. |

## What this blueprint deliberately does not do

It does not create a resource group, database, container app, registry, static web app, storage account, Entra application, secret, DNS record, or database copy. Those actions can incur credit use or affect live traffic and require a separate approval at the activation gate.

## Current preparation state

The active Azure for Students subscription is `5974c845-4443-4b80-a0cd-b83696573637`. The user account is an Owner and a single-tenant Entra application registration has been created. The application has **not** yet received its Contributor assignment because the portal role picker and Cloud Shell terminal have not completed reliably in the UBT environment. No runtime, data service, storage account, DNS record, or traffic change has been created.

When a working UBT-approved Azure session is available, assign that application the built-in **Contributor** role at the subscription scope, create its credential through the secret manager, and run the manually gated GitHub workflow only after reviewing the `what-if` output.

## References

[1] [Microsoft Learn — JavaScript on Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/javascript-overview)

[2] [Microsoft Learn — Online MySQL migration to Azure Database for MySQL Flexible Server](https://learn.microsoft.com/en-us/azure/dms/tutorial-mysql-azure-external-to-flex-online-portal)

[3] [Microsoft Learn — Custom domains with Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain)
