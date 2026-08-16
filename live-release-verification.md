# Live Release Verification

**Verified on:** 16 August 2026

| Check | Result |
| --- | --- |
| GitHub Pages build | Built successfully from `d93feeb`. |
| `https://www.hsndm.tech/` | Returned HTTP 200 and referenced the refreshed static bundle. |
| `https://www.hsndm.tech/services/` | Returned HTTP 200 and referenced the refreshed static bundle. |
| Apex domain | `https://hsndm.tech/` reached the refreshed release at `https://www.hsndm.tech/`. |
| Hero MP4 response | Returned HTTP 200 with `video/mp4`. |
| Explainer MP4 response | Returned HTTP 200 with `video/mp4`. |
| Hero browser state | Loaded at 1280 × 720, `readyState: 4`, `muted: true`, `loop: true`, `paused: false`, and no media error. |
| Explainer browser state | Loaded at 1280 × 720 with `readyState: 4`, `muted: true`, `loop: true`, and no media error; it remains paused off-screen until visible. |

The browser screenshot mechanism can show video frames as black or static even while the video element is ready and playing. The media-element state and direct `video/mp4` responses were therefore used as the delivery verification signals.
