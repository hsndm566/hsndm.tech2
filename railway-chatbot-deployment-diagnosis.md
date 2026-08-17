# Railway Chatbot Deployment Diagnosis

**Checked:** 17 August 2026

The intended AutoApply SA chatbot commit is `ea322fec31642d4a5c788e530032257265b6e0ef` in `hsndm566/saudi-whatsapp-ai-chatbot`. Railway accepted the deployment trigger but failed during the `SNAPSHOT_CODE` step before a build or runtime process began. The Railway deployment event reported: `##FORBIDDEN## repository forbidden`.

The currently live chatbot continues to serve the preceding successful deployment `76f7d66d553ce463282c0a8f3e756e918994b3d0`; no unrelated Railway service was modified. Reaffirming the existing source repository and configuring `/railway.toml` did not resolve the failure, and a subsequent deploy trigger returned `Resource not accessible by integration`.

The authenticated Railway project page simultaneously displayed an active Railway notice: **"GitHub is experiencing elevated error rates. We are investigating the incident."** This is consistent with the failure occurring before code snapshotting.

## Required Unblock

Wait until Railway reports the GitHub incident as resolved, then retry deployment of the same commit. If `repository forbidden` persists after the incident resolves, restore the Railway GitHub App's access to the private repository `hsndm566/saudi-whatsapp-ai-chatbot` in the Railway project settings and retry. Do not change the `autoapply-sa` Railway or Render automation services.

### Current retry gate

At 16:46 UTC on 17 August 2026, Railway’s status page still reported **Partial Outage** for GitHub Auto-Deploys and stated that GitHub had identified an elevated-error-rate issue and was working on a fix. Retrying the dedicated chatbot deployment while that incident remains active would not distinguish an application problem from a platform-side source-fetch failure, so no new deploy trigger was issued.

## Recovery verification

After GitHub reported mitigation, an explicit deployment of commit `9c9f56efdf005cb8899225e4f2bf934b99699a7e` (**Allow Groq classifier completion budget**) completed with Railway status `SUCCESS`. The live health endpoint reports `status: ok`, `groq: true`, and persistent logging enabled.

Non-personal live probes from the approved `https://www.hsndm.tech` origin confirmed that the chatbot returns its bilingual FAQ/intake response without classifier fallback, supports `start` and `ابدأ` with the bilingual name-step prompt, and returns the approved bilingual pricing handoff after a greeting. The `/web-chat` preflight returns `204` with the approved origin and `POST, OPTIONS` methods. No customer data was submitted during verification.

## Related Production Check

An unauthenticated navigation to `https://dashboard.hsndm.tech` returned the expected AutoApply SA page title. The browser session then reset to a blank page before the sign-in control could be inspected, so this check does not establish an authentication session and does not replace the planned explicit passwordless-flow test.
