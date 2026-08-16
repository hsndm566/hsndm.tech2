# Frontend Finalization Baseline

Visual checks on 2026-08-16 established the following priorities before code changes:

- The shared opening hero media uses `object-fit: cover` plus two dark overlays, so the video is visibly cropped and substantially obscured on both desktop and mobile.
- The mobile hero preserves the most relevant video region more successfully than desktop, but it remains too dark to communicate the walkthrough clearly.
- The Arabic hero uses a mixed LTR/RTL layout for positioning, producing inconsistent visual anchoring between its copy, status card, and statistics.
- The explainer videos must be retained and verified at both desktop and mobile breakpoints after the shared media treatment is updated.

The implementation replaces global hero darkness with a transparent, light-media presentation and localized readable content surfaces, then normalizes Arabic hero directionality and spacing without changing service content or conversion routes.

The revised desktop hero now presents the complete video at its natural frame without the previous dark wash. On phone-sized screens, the video occupies a separate 16:9 opening frame before the hero copy, so it is fully visible rather than serving as a cropped background. Both English and Arabic mobile views retain a clear opening video, readable copy, and the existing campaign actions.

Browser verification confirms the English explainer media renders in the “See it work” section with its laptop-and-CV walkthrough visible in the viewport. The Arabic landing page loads with the same corrected opening media and its localized explainer video element remains present in the page structure. The shared source configuration keeps the English and Arabic video assets distinct, preserves muted looping playback, and retains a safe fallback if playback fails.

The Arabic browser session reports both MP4 assets with `readyState: 4`, no media error, 1280×720 dimensions, muted playback, and looping enabled. The hero was actively playing; the below-fold explainer was fully buffered and correctly configured to autoplay as it enters the viewport.

The full-page Arabic reviews at phone and desktop sizes show a consistent RTL hierarchy from the hero through the upload flow, pricing, FAQ, map, and final campaign CTA. The update removes the former CSS replacement copy that could diverge from source text, applies an RTL-specific hero surface and logical anchoring, and uses an isolated Latin brand token in the Arabic lead paragraph to prevent bidirectional ordering artifacts.

The release verification completed successfully with 31 passing test files and 78 passing tests, a clean TypeScript check, and a successful production build. Recent runtime logs confirm the live-activity request returns HTTP 200. The only observed network message was a non-blocking Google Maps CSP capability probe, which does not affect the site interface, media playback, or campaign flow.

The user-approved reviewed Arabic copy has been imported into the structured Arabic page content. Desktop and 375px phone screenshots confirm that the revised headings, navigation label, service description, and operational labels render in RTL without clipping or overlap, while the English route remains visually unchanged.

The completed source-backed Arabic import was rechecked across the full page at desktop and phone sizes. The revised copy preserves the existing hierarchy, pricing cards, campaign flow, testimonials, FAQs, Jeddah location section, and final CTA without layout regressions or horizontal clipping.

The shared English and Arabic footer enquiry form, pricing-card feedback, workflow feedback, and language-toggle transition were verified on full-page desktop and 375px phone captures. The footer fields retain a single-column phone layout, the page hierarchy stays intact, and the Arabic RTL footer form is aligned with the surrounding content.

The opening hero was recomposed to a bright white first-screen treatment. Desktop and 375px phone captures confirm that the full motion panel, complete English and Arabic headlines, supporting copy, primary campaign action, secondary system action, trust line, and visible operational status remain legible without the prior dark-grey background.

## Footer enquiry success state — 2026-08-16

The footer enquiry form now renders a localized thank-you message after the prepared WhatsApp handoff enters the ready state. The success state includes a compact animated checkmark, a secondary readiness message, and an accessible `role="status"` live region. The existing popup-blocked recovery link remains unchanged.

Automated verification covers English and Arabic handoffs, the success checkmark marker, the localized thank-you copy, the prepared WhatsApp URL, and the explicit `prefers-reduced-motion` CSS fallback that disables both success animations. The full Vitest suite, TypeScript check, and production build passed.

Desktop full-page captures were taken for `/` and `/ar` at 1280×720, and phone full-page captures were taken for both routes at 375×812. Both language versions retain the footer form’s responsive structure and readable hierarchy. The post-submit success content is protected by interaction tests because static full-page captures do not submit forms.

The build still reports the existing non-blocking large-chunk advisory for the PDF/DOCX tooling bundles. No new frontend or form runtime error was introduced by this change.

## Additive trust, discovery, and services pass — 2026-08-16

The public site now includes bilingual working-draft Privacy Policy and Terms & Conditions pages. The privacy content describes collection purpose, minimisation, retention, safeguards, data-subject requests, and optional analytics; the terms distinguish preview guidance from an agreed campaign and state that pricing, cancellation, and any refund position must be set in the relevant written agreement before paid work begins. Both pages visibly identify themselves as drafts requiring qualified Saudi legal review.

Optional analytics is no longer loaded from the initial HTML document. A compact consent notice gives the visitor an affirmative opt-in or a necessary-only choice, persists that decision in a first-party preference cookie, and provides a localized privacy-policy link and settings reset. The English and Arabic interaction tests verify that analytics remains absent until a choice permits it and that Arabic visitors receive an RTL privacy path.

The technical discovery layer now includes `llms.txt`, updated bilingual sitemap entries, route-specific static sharing metadata, and Organization/Service/Person JSON-LD. Production-only baseline security headers cover content type, referrer policy, clickjacking protection, permissions policy, CSP, and HTTPS HSTS; development CSP remains relaxed so Vite refresh behavior is not impaired.

The site also includes a persistent WhatsApp Business entry point, a clearly inactive Saudi payment-path placeholder, a two-track bilingual Services overview, and a KAIA Terminal 1 case-study route. The case-study figures are explicitly marked as owner-supplied and not a guaranteed or repeatable outcome. Desktop and 375px mobile captures confirm readable English and Arabic layout for the new services, case-study, pricing, privacy, and terms pages. The complete deterministic test suite, TypeScript check, and production build passed after these additions.

The Railway backend health endpoint remains available. DNS routing for `api.hsndm.tech`, `dashboard.hsndm.tech`, and the proposed future subdomains was not modified because the injected Cloudflare credential continues to return HTTP 401 during read-only token verification; no DNS target was guessed or changed.
