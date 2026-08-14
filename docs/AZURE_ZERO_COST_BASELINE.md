# Azure zero-cost migration baseline

**Captured:** 2026-08-14

## Verified public endpoints

| Endpoint | Observed role | Current result | Migration implication |
|---|---|---|---|
| `https://hsndm.tech` | GitHub Pages static public mirror | The English AutoApply SA landing page is reachable and renders the current public experience. | Static hosting can move to Azure Static Web Apps only after the separately hosted API, static asset references, and runtime configuration are ready. |
| `https://hsndmstudio-lyaavagg.manus.space` | Managed full-stack deployment | The same public landing page is reachable. The project boundary documentation identifies this deployment as the active API, OAuth, database, notification, and scheduler system of record. | This service must remain live and unchanged while Azure staging is prepared. |

## Observed delivery and DNS facts

| Endpoint | DNS / response evidence | Interpretation |
|---|---|---|
| `hsndm.tech` | Resolves to GitHub Pages address space; its HTTPS response identifies `server: GitHub.com`, returns HTTP 200, and carries a ten-minute cache-control policy. | The current public root domain is served as GitHub Pages static hosting. It is not the active Express backend. |
| `hsndmstudio-lyaavagg.manus.space` | Resolves through Cloudflare; its HTTPS response returns HTTP 200, `x-powered-by: Express`, and `x-manus-proxy-mode: transparent/1`. | The managed endpoint is serving the current Express-backed application boundary. |

## Runtime and asset dependency facts

| Dependency | Evidence in the current source | Azure migration consequence |
|---|---|---|
| External API origin | The browser client supports `VITE_API_BASE_URL`; it is absent on the static GitHub Pages build by default. | The static app must be rebuilt with the approved Azure API URL before static traffic is moved. |
| Express health and routing | The server exposes `GET /health`, runs `/api/trpc`, and requires `DATABASE_URL` plus OAuth runtime configuration. | Azure Container Apps needs a matching health probe, injected runtime values, and CORS/OAuth validation. |
| Managed asset proxy | Public images and video use `/manus-storage/`; the server implements a proxy for this path. | Asset migration must replace or deliberately retain every `manus-storage` URL before the Azure static app can be independent. |
| Current named visual assets | The brand symbol, hero image, desk image, and workflow image are served through `/manus-storage/`. | Build a versioned Azure/first-party asset manifest before changing the static host. |

## Verified session constraints

| Area | Finding | Consequence |
|---|---|---|
| Azure connector | No Azure connector is configured in the current session. | Azure resources cannot be inspected or created programmatically from this session until an approved Azure connection method is supplied. |
| Current Azure plan | The existing Bicep file is intentionally inert unless `deployRuntime=true`. | No Azure runtime was created by this baseline work. |
| Live traffic | Neither `hsndm.tech` nor the managed domain was changed. | No production traffic interruption occurred. |
| Data | No database export, migration, or secret transfer occurred. | The present production system remains the sole write-primary. |

## Baseline conclusion

The next safe zero-cost deliverable is a reproducible deployment contract: an Azure resource map, container build contract, environment-variable inventory, static asset manifest, database/source compatibility checklist, and DNS/OAuth worksheet. Resource creation must wait until the actual live source hosts and callback URLs are recorded and the user approves the first specific Azure service to create.

## Source and release preservation record

| Record | Verified value | Preservation meaning |
|---|---|---|
| Managed project checkpoint | `fff406b6` | The current managed project snapshot contains the latest direct Arabic selector cleanup plus Azure and Hermes migration documentation. |
| GitHub Pages repository | `hsndm566/hsndm.tech` | The public static mirror has a separately verifiable GitHub source history. |
| GitHub `main` commit observed | `7718e087dd7e861f8a838b8c28b31b6e0ebc30ac` at `2026-08-14T00:23:25Z` | This is the currently observed public-mirror source record. Before any Azure promotion, reconcile it with the intended verified application commit so static and API artifacts originate from the same release. |

No database export, customer data copy, secret export, or cloud file transfer has been performed. Those items require an approved Azure destination and a data-specific migration gate rather than a generic file copy.
