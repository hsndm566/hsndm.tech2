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
