# AutoApply SA Azure Migration Runbook

## Current state

The Azure subscription is active and the account is an Owner. A single-tenant Entra app registration exists, but it has not yet received the required Contributor role because the Azure portal role picker and Cloud Shell startup have not completed reliably in the UBT environment. No Azure application resource, data migration, billing deployment, DNS change, or production traffic change has occurred.

## Safe handoff contract

The current backend runs as a Node.js/Express/tRPC service with `pnpm build` producing its application artifact and a `/health` route for operational checks. The frontend is separately served from GitHub Pages. Azure migration must preserve API routing, database compatibility, existing JWT/OAuth environment values, `hsndm.tech` static delivery, and the current Railway fallback until validation passes.

## Activation prerequisites

1. Assign the Entra deployment app the built-in subscription **Contributor** role.
2. Create a service-principal credential; store it through the project/GitHub secret manager only.
3. Choose the target resource group and region, then run the workflow preflight `what-if` before resource creation.
4. Create the approved Azure database/storage/runtime components in a controlled change window.
5. Migrate only approved data and validate against the Azure URL before changing DNS.

## Rollback

If the Azure API or database verification fails, leave `hsndm.tech` pointed at the current GitHub Pages/Railway architecture, stop the Azure revision, and retain the Railway environment and database connection unchanged. No cutover is complete until the domain routing change has been approved and verified.
