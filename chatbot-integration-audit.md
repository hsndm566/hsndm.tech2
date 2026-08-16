# Railway Chatbot Integration Audit

## Verified live status

| Check | Result | Integration consequence |
| --- | --- | --- |
| `GET https://saudi-whatsapp-chatbot-production.up.railway.app/web-chat` | `405 Method Not Allowed` | Expected for a POST-only chat route. |
| `OPTIONS /web-chat` from `https://www.hsndm.tech` | `403 Origin is not allowed` | The browser widget cannot communicate with the endpoint yet. |
| Railway variable configuration | `WEB_CHAT_ALLOWED_ORIGINS=https://hsndm.tech,https://www.hsndm.tech` was saved | The setting is correct, but its restart deployment failed and is not active. |
| Railway chatbot root endpoint | Reports `business: Perfect Smile Clinic` | The endpoint is configured for an unrelated clinic, not AutoApply SA; it must not be exposed as an AutoApply SA assistant. |

## Current conclusion

The chat widget is intentionally not embedded yet. Doing so would either fail CORS or provide clinic-specific replies to AutoApply SA visitors. The dedicated chatbot service must first be restored and reconfigured with AutoApply SA tenant data before its public endpoint is appropriate for this website.

## Build recovery evidence

Railway’s deployment API reports that the latest manual chatbot deployment reached `SNAPSHOT_CODE` but failed during `BUILD_IMAGE`; the API provided no log lines or detailed diagnosis. Railway’s official documentation states that build output is available from the Build Logs view or by running `railway logs <deployment-id> --build` in an authenticated Railway CLI session. The dedicated Railway project token available to this task can read deployment metadata but has not returned those build-log lines through the public GraphQL query. Reference: https://docs.railway.com/cli/logs

The Railway CLI build logs identified the initial Railpack failure as `secret web not found`. A minimal Python Dockerfile then bypassed that broken build path; its first launch exposed the non-shell-expanded `startCommand` issue (`$PORT is not a valid port number`). Removing that override allowed the Dockerfile’s shell command to expand Railway’s runtime port, after which deployment `e47ed5d2-0f72-48cd-bc57-cd2bd6db874b` succeeded. Railway documents automatic root Dockerfile detection and the `DOCKERFILE` builder in its build/config references: https://docs.railway.com/builds/dockerfiles and https://docs.railway.com/config-as-code/reference.

## Public Pages delivery

The active `hsndm.tech` GitHub Pages repository publishes from `main` at the repository root and uses the `www.hsndm.tech` CNAME. The verified static artifact was prepared for publication while preserving that CNAME and the existing `/manus-storage` media files because the rebuilt JavaScript bundle continues to reference those media paths.

GitHub Pages build `b344194b57e99d7ae4e959dda1f34beb6e516ac4` completed successfully at 2026-08-16T23:34:19Z. A real-browser visit to `https://www.hsndm.tech/` confirms the new static bundle is live and includes the `Chat / دردشة` trigger. The trigger is present in the live DOM; the first immediate in-page inspection ran before React had completed rendering the expanded dialog, so the expanded state requires one asynchronous browser recheck rather than being treated as a failure.
