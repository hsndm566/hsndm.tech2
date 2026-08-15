# Hosting and Azure Findings

- Current session config has no Render or Azure connector. The only Render text matches are unrelated tools; no Azure match exists.
- The project repository has a GitHub remote (`user_github`) but no `render.yaml`, `railway.json`, Dockerfile, or docker-compose file at the project root.
- The project uses a full-stack Express/tRPC server and the managed WebDev deployment. A separate Render deployment would need an explicit API origin, CORS, authentication, and environment-variable strategy.
- Current task guidance recommends one primary production backend rather than running Railway and Render as active peers. GitHub should be the source of code; the chosen host should be the source of runtime configuration and deployment.
- Render documentation indicates linked-branch auto-deploys are available, including deployment after CI checks. Railway documentation indicates health checks and restart policy controls are available.
- Azure federated identity credentials are the missing piece in the prior migration attempt. A usable Azure workflow needs the subscription ID, tenant ID, application/client ID or managed identity ID, target resource group, and a federated credential matching the CI issuer/subject/audience—or a service-principal secret as a less-preferred alternative.
- A Chrome tab or Manus schedule every 15 minutes is not the right keep-awake mechanism. Use native health checks and restart policies first; if external uptime monitoring is required, use a deterministic HTTP monitor or provider-native scheduled check rather than an AI session.

Sources reviewed:
- https://render.com/docs/deploys
- https://docs.railway.com/deployments
- https://learn.microsoft.com/en-us/graph/api/resources/federatedidentitycredentials-overview?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/azure/devops/pipelines/release/configure-workload-identity?view=azure-devops

## Final operational decision

The application now exposes `GET /healthz`, returning a small JSON payload with `status`, `service`, `timestamp`, and `uptime`. Render or Railway can use this deterministic endpoint for native health checks and restart decisions; a Chrome tab or AI schedule is unnecessary.

The current session still has no Render API connector or service identifiers, so no claim is made that Render and Railway are synchronized. GitHub remains the code source of truth, while the user must designate exactly one production backend before configuring auto-deploy. Azure remains optional; the missing federated-identity configuration is still the only blocking migration input identified in this project.

The built production entry was smoke-tested on a clean port after confirming that `dist/index.js` is generated from `server/_core/index.ts`. `GET /healthz` returned HTTP 200 JSON with `status: "healthy"`, `service: "AutoApply SA"`, a timestamp, and process uptime. The initial smoke attempt hit a stale process and was discarded; the clean-port verification is the authoritative result.
