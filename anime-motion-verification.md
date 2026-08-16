# Anime.js Motion Verification

- **Desktop and phone:** The English and Arabic hero/video layouts were captured after the motion hooks were added; existing content, video framing, and responsive dimensions remained unchanged.
- **Reduced-motion runtime:** Chromium was run with `--force-prefers-reduced-motion`. The rendered DOM reported `data-anime-motion="reduced"`.
- **Reduced-motion phone captures:** English and delayed Arabic screenshots at 375 × 812 show the full word-wrapped hero headline visible with no hidden or mid-animation state. The consent banner remains intentionally visible because no consent choice was made during the isolated test.
- **Reduced-motion interaction proof:** A CDP-based forced-reduced-motion session dispatched a pointer and click sequence to an existing button. The browser returned `motionMode: reduced`, `heroVisible: true`, `buttonTransform: none`, and `cardTransform: none`, confirming that the accessibility path retained visible content and did not attach a stuck transform to interactive targets.
