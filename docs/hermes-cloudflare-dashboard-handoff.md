# Hermes Handoff — Bind the Candidate Dashboard Hostname

Copy the following request into Hermes. It is intentionally limited to a single Cloudflare DNS change and asks Hermes to return evidence rather than make unrelated hosting or authentication changes.

```text
I need you to use your connected Cloudflare access to inspect and, only if the target is verified, update the dashboard hostname for AutoApply SA.

Scope and safety rules:
- Zone: hsndm.tech
- Change only the DNS record for dashboard.hsndm.tech.
- Do not change @, www, clerk.hsndm.tech, mail records, MX/TXT records, SSL mode, Workers, Pages, redirects, or any Cloudflare account settings.
- Do not expose API tokens, secrets, account IDs, or DNS credentials in your response.
- Capture the current dashboard record’s type, target, proxy status, and TTL before changing it so we have a rollback record.
- The current problem: https://dashboard.hsndm.tech returns HTTP 404, while the managed candidate dashboard is reachable at https://hsndmstudio-lyaavagg.manus.space/dashboard.
- Important: do NOT guess that the managed preview hostname is a valid DNS target. First inspect the managed project’s custom-domain setup or any available verified domain target. If you cannot verify the exact target record for dashboard.hsndm.tech, stop and report that blocker instead of changing DNS.

If the verified target is available:
1. Replace only the existing dashboard record with the exact record type/value required by the managed-project domain setup.
2. Preserve the recommended proxy/TTL settings from that setup.
3. Wait for Cloudflare to accept the change and verify it using DNS plus HTTP.
4. Confirm that https://dashboard.hsndm.tech returns the candidate dashboard route rather than the prior GitHub Pages 404.
5. Return a concise evidence report containing:
   - previous dashboard record (redact only secrets; normal DNS targets are safe to describe);
   - new record type, target, proxy status, and TTL;
   - DNS lookup result;
   - HTTP status and final URL for https://dashboard.hsndm.tech;
   - rollback step;
   - whether Clerk DNS was left untouched.

Do not test a real candidate magic-link email. Once DNS is verified, report success and stop for separate end-to-end sign-in testing.
```

## Evidence Hermes Should Return

| Required evidence | Why it matters |
|---|---|
| The prior `dashboard` DNS record | Gives a precise rollback path. |
| The exact verified replacement record | Confirms the hostname is not merely pointed at a guessed preview URL. |
| DNS lookup and HTTPS status after the change | Shows that the custom hostname now reaches the intended dashboard. |
| Confirmation that `clerk.hsndm.tech` was untouched | Keeps the working Clerk custom domain isolated from the dashboard route change. |
