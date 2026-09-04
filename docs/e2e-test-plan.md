# Customer E2E acceptance checks

- Public homepage loads.
- `/dashboard` resolves to the SPA rather than a static 404.
- Dashboard host resolves without 5xx.
- Clerk dashboard shell reaches signed-out state and can start passwordless sign-in.
- Authenticated candidate API requests are candidate-scoped.
- First login can save targeting/authorization.
- Application tracker loads protected application records.
- Evidence labels distinguish portal confirmation, accepted application email, and employer confirmation.
- Browser helper route loads from the dashboard and provides dry-run instructions.
- Browser helper uses local Chrome/Chromium and does not require a Chrome Web Store listing.
- Payment, public, API, and dashboard hosts remain isolated.
