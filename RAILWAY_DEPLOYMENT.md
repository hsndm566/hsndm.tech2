# Railway Deployment Handoff

This project is Railway-compatible through `railway.toml`, the `pnpm build` production build, the `pnpm start` command, and the `/health` endpoint.

## Required Railway variables

Configure these values in the Railway service rather than committing them to the repository:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL-compatible database connection for voluntary campaign brief records and user data. |
| `JWT_SECRET` | Session-signing secret. |
| `OAUTH_SERVER_URL` | OAuth server base URL if Manus OAuth remains enabled. |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL used by the web client. |
| `VITE_APP_ID` | OAuth application identifier. |
| `VITE_API_BASE_URL` | Optional public Railway API origin when GitHub Pages remains the frontend host, for example `https://api.example.com`. Leave blank when the frontend and server run on the same Railway service. |

## Deployment notes

Railway should build with `pnpm build`, start with `pnpm start`, inject the service `PORT`, and confirm `/health` returns HTTP 200 before traffic is switched. The server respects `PORT`. If GitHub Pages continues to host `hsndm.tech`, set `VITE_API_BASE_URL` during the frontend build to the deployed Railway origin so voluntary campaign briefs use the backend. Without that setting, the static site retains the client-side preview and WhatsApp handoff without attempting a failed backend request.

## References

- [Railway Config as Code reference](https://docs.railway.com/config-as-code/reference)
- [Railway Healthchecks](https://docs.railway.com/deployments/healthchecks)
