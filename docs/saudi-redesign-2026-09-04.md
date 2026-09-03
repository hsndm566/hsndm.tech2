# Saudi landing redesign — 2026-09-04

The user explicitly reprioritized the landing redesign before the remaining portal
sign-in repair. This release does not claim authenticated customer workflows pass.

## Changed

- Shared English/Arabic introduction with deep Saudi green, lime accents, legible
  hierarchy, responsive layout, and existing reduced-motion-aware Anime.js.
- Replaced the crowded hero and unsupported live-looking counters with a clearly
  labelled illustrative workspace. No fabricated customer results.
- Pricing and process calls to action retain their existing sections. Existing
  enquiries, ATS review, account links, consent, support and legal routes remain.
- Replaced the missing remote header logo image with an existing icon primitive.
- Existing Cloudflare Pages project: hsndm-tech2, source hsndm566/hsndm.tech2,
  production main. No provider migration or portal authentication changes.

## Validation

- TypeScript no-emit check passed.
- SaudiHero component tests: 2 passed.
- English and Arabic browser checks at 1440px and 390px: correct language and
  direction, no horizontal overflow, working pricing anchor.
- Production Vite build passed; existing large optional PDF/document chunks warned.
- Browser test helper accepts PLAYWRIGHT_MODULE for an installed runtime.

## Remaining

Portal sign-in redirection remains a separate unresolved issue. Marketing previews
are not evidence of an operational authenticated dashboard or live job discovery.
