# AutoApply SA Dashboard Domain and Clerk Runbook

## Purpose

This runbook completes the remaining external release work for the candidate portal without placing DNS credentials, Clerk secrets, or personal email addresses in source code. It applies only to the candidate dashboard; it does **not** move the public `hsndm.tech` website away from its current host.

## Confirmed Current State

| Component | Verified state | What remains |
|---|---|---|
| **Managed application** | The managed deployment is available at `hsndmstudio-lyaavagg.manus.space`. | Bind the candidate dashboard hostname through the managed project domain settings. |
| **Clerk custom domain** | `clerk.hsndm.tech` resolves to Clerk infrastructure and serves Clerk browser JavaScript. | Complete a real passwordless email login from the eventual dashboard hostname. |
| **Candidate dashboard hostname** | `dashboard.hsndm.tech` currently responds with the previous GitHub Pages 404. | Replace only this hostname’s existing DNS route after the new target is confirmed. |
| **Public root hostname** | `hsndm.tech` remains outside this runbook. | Do not change it as part of dashboard activation. |

## Before Changing DNS

> **Make a rollback record first.** Export or screenshot the current Cloudflare DNS record for `dashboard.hsndm.tech`, including its record type, content, proxy setting, and TTL. The rollback is to restore this exact record.

Use the project management interface to add `dashboard.hsndm.tech` to the managed project’s Domains settings. Copy the exact verification record or hostname target shown there. Do not guess a target from the preview URL and do not place a secret, API token, or Clerk key in a DNS record.

## Cloudflare DNS Procedure

| Step | Action | Success criterion |
|---|---|---|
| 1 | In Cloudflare, open the `hsndm.tech` zone and find the current record for `dashboard`. | Its current GitHub Pages destination is documented for rollback. |
| 2 | In the managed project’s Domains settings, begin adding `dashboard.hsndm.tech`. | The interface provides the exact record type and destination needed for this project. |
| 3 | Replace only the `dashboard` record with the target shown by the managed domain setup. Keep the TTL at the provider-recommended value. | The managed domain setup detects the record and begins verification. |
| 4 | Do not change `@`, `www`, or `clerk` records in this dashboard-only release. | The public website and healthy Clerk custom domain remain untouched. |
| 5 | Wait for verification, then request `https://dashboard.hsndm.tech`. | It no longer returns the GitHub Pages 404 and instead loads the dashboard route. |

## Clerk Passwordless Verification

1. Open `https://dashboard.hsndm.tech` in a private/incognito browser window after the custom host is active.
2. Enter a test candidate email address that you control and request the passwordless email link.
3. Open the received email link in the same browser profile.
4. Confirm that the candidate dashboard loads, its profile/settings page is reachable, and the activity control appears.
5. Sign out, close the private window, and repeat the initial visit to confirm the signed-out state is intentional.

The test is successful only when the candidate signs in and returns to the authenticated dashboard. A healthy `clerk.hsndm.tech` asset endpoint alone does not prove the email-flow journey.

## Rollback Procedure

If the dashboard hostname fails verification or routes incorrectly, restore the DNS record captured before Step 2. Wait for Cloudflare propagation, verify that the prior destination is restored, and leave the managed-project custom domain entry unassigned until the mismatch is understood. Do not change the Clerk custom-domain record unless Clerk itself reports a verification failure.

## Security Notes

Use a least-privilege Cloudflare API token only if browser DNS management is unavailable. The token should have permission only to edit the `hsndm.tech` DNS zone, should never be pasted into source code, and should be rotated immediately if exposed in a chat, terminal history, screenshot, or repository.
