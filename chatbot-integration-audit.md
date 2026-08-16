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
