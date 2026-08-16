# Render Portal Live Verification

Verified after deployment `dep-da13nmnavr4c73fgksn0` for checkpoint `ccdfb641`.

| Endpoint | Observed result | Meaning |
| --- | --- | --- |
| `https://hsndm-portal.onrender.com/healthz/db` | `200` with `{"status":"healthy","dependency":"database"}` | The deployed portal can execute its minimal database connection probe using `DATABASE_URL`. |
| `https://hsndm-portal.onrender.com/v1/campaigns/latest-activity` | `200` with `{"timestamp":null}` | The deployed portal serves the database-backed activity endpoint without exposing candidate data. No application record currently supplies a latest timestamp. |

The still-unverified Render custom domain claims require the approved Cloudflare DNS records to be changed before `dashboard.hsndm.tech`, `www.hsndm.tech`, and `api.hsndm.tech` can serve their intended Render origins.
