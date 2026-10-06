# Managed application workflow rollout

This branch adds a staged backend path for metered email applications. It extends the V2 Supabase workspace; it does not replace the existing auth, jobs, CV, or application tracker.

## Employer contacts

The private runtime table is `autoapply_private.employer_contacts` and is written through the server-side sync RPC. It has no customer grants or customer-facing API route. Email delivery resolves an exact normalized company-name match and requires one unique contact that is current, explicitly send-ready, of type Recruitment or Careers, not marked Do Not Send, and verified within 90 days. Ambiguous or stale matches are unavailable.

The current operator source is the existing Notion data source **AutoApply SA — Contacts CRM**. The API sends the complete snapshot to the database sync function only after pagination succeeds, so stale rows are deactivated atomically. Its schema was inspected and the sync maps:

- `Company` → company name
- `Email` → private recipient
- `Contact Type` → Recruitment or Careers eligibility
- `Verification` → Current official eligibility
- `Send Status` → must be Ready
- `Do Not Send` → suppression
- `Last Verified` → 90-day freshness check
- Notion page ID → stable sync key

Notion rows marked Sent, Hold, Bounced, Do not send, Historical verified, Needs verification, or Invalid are not eligible. The current CRM contains no rows with Send Status = Ready, so sending remains safely unavailable until an operator reviews and marks an appropriate record Ready.

## Notion sync setup

Configure these API service variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NOTION_API_KEY` (grant the integration access to AutoApply SA — Contacts CRM)
- `NOTION_SYNC_SECRET` (long random secret used only by the sync caller)
- `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` (existing email setup)

The database and data-source IDs are set to the currently inspected CRM by default. They can be overridden with `NOTION_DATABASE_ID` and `NOTION_DATA_SOURCE_ID`.

Call `POST /api/v2/admin/notion-sync` with header `x-autoapply-sync-token` set to `NOTION_SYNC_SECRET`. The endpoint paginates the whole Notion data source, upserts private rows, and only after a complete successful read disables rows removed from Notion. It returns counts and timestamps, never contact data.

Example operator call:

```sh
curl -X POST "https://api.hsndm.tech/api/v2/admin/notion-sync" \
  -H "x-autoapply-sync-token: ${NOTION_SYNC_SECRET}"
```

Schedule that call daily from an existing trusted scheduler once the environment variables are configured. Do not put either API key or sync secret in the browser, repository, or customer-facing settings.

## Credits and sending

New Supabase users receive Free / 5 credits. Starter is 50 and Pro is 100 when the entitlement is changed by a trusted server-side process. The customer can read their own plan and count but cannot update it. The send RPC locks the entitlement row, reserves one credit, and binds the reservation to the user's application. A definite 4xx provider rejection releases the reservation. A timeout, 5xx, or missing provider message ID is treated as uncertain: the credit stays reserved and that job cannot be retried automatically.

The authenticated browser sends only `jobId`. The server resolves the email with service credentials, sends the stored PDF through Brevo, and returns a redacted application summary. The app table's customer role no longer has access to the employer-recipient column.

## Rollout order and verification

1. Configure the server-only environment variables in the API service.
2. Apply migration `202610040001_managed_application_credits_contacts` to the V2 development Supabase project.
3. Deploy this branch to a preview API and sync Notion.
4. Confirm the dashboard reads the Free 0/5 entitlement; confirm an ineligible contact never appears as email eligible.
5. Only after a reviewed contact is marked Ready and current, test one application using an approved test account and test recipient. Verify the Brevo message ID, application row, and 1/5 usage.
6. Verify quota exhaustion, duplicate send, definite provider rejection/refund, and uncertain provider response behavior before production rollout.

Paid-plan checkout completion is now connected through the signed Dodo `payment.succeeded` webhook. The webhook is idempotent, uses authenticated checkout metadata when present, and updates the authoritative `v2_user_entitlements` ledger. Product IDs still must be configured before enabling paid checkout. The Notion sync endpoint is callable but requires a scheduler to run automatically.
