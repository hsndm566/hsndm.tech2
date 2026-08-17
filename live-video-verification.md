# Live Video Verification Record

## 2026-08-17

The configured public media endpoints were checked directly on `www.hsndm.tech`.

| Asset | Live response | Range support |
| --- | --- | --- |
| Hero video | `200`, `video/mp4` | `accept-ranges: bytes` |
| Explainer video | `200`, `video/mp4` | `accept-ranges: bytes` |

The public homepage rendered its hero media region without a visible image placeholder or media-error state. A browser-derived transcript includes the explainer video’s HTML fallback copy, which is normal source fallback content and is not by itself evidence of playback failure. A direct media-element state check remains the final verification step.

The direct media-element check completed successfully. Both video elements reported `readyState: 4`, `networkState: 1`, `error: null`, an 8-second buffered duration, `muted`, `playsInline`, and `loop` enabled. The in-viewport hero was actively playing; the out-of-view explainer was paused, then displayed its video frame when scrolled into view. This is consistent with browser autoplay visibility behavior, not a delivery failure.

After the content-policy deployment, a refreshed visit to `https://www.hsndm.tech/` rendered the updated Campaign Clarity section and the normal public navigation, intake, and contact surfaces. The page loaded without a visible media-error state; hero imagery remained visible. The browser transcript continues to include the explainer element's fallback child text as part of its source markup, while direct element state and endpoint checks establish that the MP4 delivery is healthy.

The refreshed production element-state check again reported both MP4s at `readyState: 4` and `networkState: 1`, with `error: null`, complete 8-second buffered media, and `muted`, `playsInline`, and `loop` enabled. The hero was playing in view; the explainer was preloaded and paused out of view, which is expected visibility-aware autoplay behavior.
