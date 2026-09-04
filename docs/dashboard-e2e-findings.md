# Dashboard end-to-end findings — 2026-09-04

## Live customer journey

- `https://www.hsndm.tech/` responds.
- Public-host `/dashboard`, `/sign-in`, and `/sign-up` currently resolve to static 404 pages rather than the authenticated application route.
- `https://dashboard.hsndm.tech/` is provisioned but returned HTTP 503 during the audit, including `/dashboard`, `/sign-in`, and `/sign-up`.
- Source routing contains `/dashboard` and `/dashboard/settings`, with Clerk initialized only inside the dashboard shell.

## Dashboard data

The authenticated dashboard already queries protected candidate-scoped application, profile, evidence, and campaign-approval procedures. Application list access is scoped to the authenticated candidate identity. Existing evidence types distinguish portal confirmation, accepted application email, and employer confirmation.

## Email visibility

Brevo is present as an outbound transport/monitor integration, and the application evidence model can represent an accepted email or employer confirmation. Full inbound mailbox/reply synchronization is not yet a first-class dashboard feed and should not be presented as live until an inbound provider/webhook writes those events into candidate-scoped records.

## Browser helper

The existing `hsndm566/applypilot-saudi` repository is already a fork of the open-source ApplyPilot project and contains Chrome/Chromium automation through Playwright. This is now exposed to customers at `/dashboard/browser-helper` and through a dashboard launcher. It does not require Chrome Web Store publication.

## Firebase decision

Firebase was not added as a fake replacement for browser privileges. A Firebase-hosted web application cannot grant itself extension/local-browser automation permissions. It remains suitable later for optional device presence, push notifications, or synchronization after a real product contract is defined.
