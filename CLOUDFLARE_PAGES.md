# Cloudflare Pages Deployment

This repository is configured to deploy the public Vite frontend to Cloudflare Pages.

## Build settings

| Setting | Value |
| --- | --- |
| Framework preset | None / Vite |
| Build command | `pnpm build:pages` |
| Build output directory | `dist/public` |
| Production branch | `main` |

`VITE_API_BASE_URL` should be set to `https://api.hsndm.tech` in Cloudflare Pages so the static frontend calls the stable API hostname rather than an infrastructure-provider URL.

The Express backend is not statically exportable as-is. This Pages deployment intentionally moves the public frontend first while keeping API calls behind `api.hsndm.tech`.
