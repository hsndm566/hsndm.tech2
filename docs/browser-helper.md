# AutoApply local browser helper

AutoApply uses the existing `hsndm566/applypilot-saudi` fork for customer-side browser execution instead of requiring a Chrome Web Store listing.

## Why this path

- It already launches Chrome/Chromium through Playwright.
- It supports dry-run form filling before submission.
- It does not require a Chrome Web Store developer account or extension listing.
- Browser-control permission remains on the customer's computer.

Firebase is not used as a substitute for browser permissions. A Firebase web app cannot silently obtain the privileges of a Chrome extension or local browser automation process. Firebase can be added later for optional device presence, notifications, or synchronization, but the browser-control boundary remains local.

## Customer entry point

`/dashboard/browser-helper`

The dashboard surfaces a Browser helper action that leads to the local setup instructions.

## Source

The helper uses the existing AutoApply fork:

`https://github.com/hsndm566/applypilot-saudi`
