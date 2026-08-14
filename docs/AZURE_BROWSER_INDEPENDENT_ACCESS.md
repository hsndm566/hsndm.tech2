# Azure access without the slow browser

## Diagnosis

The interactive Azure portal is not a dependable migration control plane in the current browser session: navigation reaches the Microsoft sign-in route and does not establish an authenticated portal session. The current sandbox has no Azure connector and no Azure CLI installed. This is an **access-path limitation**, not evidence that Azure resources or the existing subscription are unavailable.

The correct response is to avoid tying the migration to a slow browser. Azure supports device-code sign-in for the CLI when a browser is unavailable or fails to open, while long-term GitHub deployment automation can use OpenID Connect (OIDC) with a preconfigured Entra federated credential. [1] [2]

## Recommended replacement path

| Stage | Recommended method | Why it is appropriate | Azure resource impact |
|---|---|---|---|
| One-time account inspection | Azure CLI device-code login from a reliable machine, with the sign-in completed on a phone or fast browser | The CLI displays a code; the user completes MFA at `https://aka.ms/devicelogin` without using the slow portal session. | None: authentication and read-only inspection only. |
| Repeated deployment | GitHub Actions OIDC using the existing Entra deployment application | GitHub obtains short-lived Azure identity tokens; no long-lived `AZURE_CREDENTIALS` JSON secret is needed. | Requires a federated credential configuration in Entra, but does not deploy an application by itself. |
| First Azure staging action | A manually dispatched GitHub workflow using OIDC, with a protected `azure-staging` environment | The workflow runs from the same verified GitHub commit and is auditable. | The exact resource action remains separately approved. |
| Production promotion | A second manual approval to a protected `azure-production` environment | Prevents staging configuration or an unreviewed commit from changing live traffic. | Occurs only after staging acceptance and maintenance approval. |

## Device-code inspection procedure

The CLI itself may be installed on a reliable laptop or a controlled automation runner. The authorization code is entered on the user's phone or another responsive device; no password, MFA code, or Azure token is sent in chat.

```bash
# On the reliable machine, after Azure CLI installation
az login --use-device-code

# Select only the intended subscription after login
az account set --subscription 5974c845-4443-4b80-a0cd-b83696573637

# Read-only verification commands; none creates or changes a resource
az account show --output table
az group list --output table
az resource list --output table
```

After this verification, sign out when no further inspection is needed:

```bash
az logout
```

## GitHub OIDC handoff contract

The existing Entra application should trust only the intended repository and protected environment. The federated credential must be constrained to the repository `hsndm566/hsndm.tech` and the relevant GitHub Actions environment, beginning with staging. Azure requires the application/client ID, tenant ID, and subscription ID for OIDC login; GitHub should store them as environment-level configuration, not source code. [2]

| GitHub environment | Azure role scope | Permitted work | Prohibited work |
|---|---|---|---|
| `azure-staging` | A dedicated staging resource group only | `what-if`, create/update staged resources, run health checks | Production resource group, production DNS, production database cutover. |
| `azure-production` | A dedicated production resource group only | Approved revision deployment after an environment review | DNS changes or data migration without the separate maintenance gate. |

The current workflows use a generic `AZURE_CREDENTIALS` secret. Before future deployment, they should be converted to OIDC (`id-token: write` and `azure/login@v2` with client, tenant, and subscription IDs) so short-lived identities replace stored deployment passwords. This is preparation only; it must not be enabled until the Entra federated credential exists and is tested with a read-only `az account show` job.

The repository now includes a manually dispatched `Azure read-only inventory` workflow. It accepts only the explicit `READ_AZURE` confirmation phrase, requests a short-lived GitHub OIDC token, and runs `az account show`, `az group list`, and `az resource list` only. The existing deployment workflow has also been prepared for the same OIDC model. Neither workflow can operate until the Entra federated credential and protected GitHub environment configuration exist.

## Current credential-readiness result

The current GitHub integration token cannot enumerate the repository's Actions secrets (`HTTP 403: Resource not accessible by integration`). Therefore, no existing Azure client, tenant, subscription, or deployment credential configuration is assumed. This does not expose, delete, or invalidate any secret; it only means the user must verify or add the required protected-environment values from a GitHub settings session with Actions-secret administration access.

## What is already preserved, and what cannot yet be transferred

| Asset or data class | Current preservation state | Azure transfer status |
|---|---|---|
| Source code, Bicep, runbooks, and GitHub workflows | Versioned in the project and connected GitHub repository | Ready for a future Azure release pipeline. |
| Static web build | Reproducible by `pnpm build` from the verified source | Must be rebuilt with the approved Azure API URL before deployment. |
| Current public static website | Reachable at `hsndm.tech` | Remains live and unchanged. |
| Managed application runtime | Reachable at the managed domain and still provides the active server boundary | Must remain the fallback during Azure staging. |
| Candidate/application database | Remains at the current write-primary | Cannot be copied safely until a specific Azure Database target, migration path, and maintenance procedure are approved. |
| `/manus-storage/` assets | Referenced through the managed storage proxy | Cannot become Azure-independent until an approved Azure storage/static asset target exists. |
| Secrets and OAuth configuration | Remain in current controlled runtime configuration | Must not be copied through files, chat, or Git history; move only to an approved Azure secret store. |

## Immediate decision

The next practical action is **not** to attempt portal automation again. It is to use device-code login or configure GitHub OIDC from a reliable device, run read-only account/resource inventory, and then request approval for a single staging resource group. That sequence minimizes usage while preserving a clear rollback path.

## References

[1] [Microsoft Learn: Sign into Azure interactively using the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-interactively?view=azure-cli-latest)

[2] [Microsoft Learn: Use the Azure Login action with OpenID Connect](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect)
