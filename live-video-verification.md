# Live Video Verification Record

## 2026-08-17

The configured public media endpoints were checked directly on `www.hsndm.tech`.

| Asset | Live response | Range support |
| --- | --- | --- |
| Hero video | `200`, `video/mp4` | `accept-ranges: bytes` |
| Explainer video | `200`, `video/mp4` | `accept-ranges: bytes` |

The public homepage rendered its hero media region without a visible image placeholder or media-error state. A browser-derived transcript includes the explainer video’s HTML fallback copy, which is normal source fallback content and is not by itself evidence of playback failure. A direct media-element state check remains the final verification step.

The direct media-element check completed successfully. Both video elements reported `readyState: 4`, `networkState: 1`, `error: null`, an 8-second buffered duration, `muted`, `playsInline`, and `loop` enabled. The in-viewport hero was actively playing; the out-of-view explainer was paused, then displayed its video frame when scrolled into view. This is consistent with browser autoplay visibility behavior, not a delivery failure.
