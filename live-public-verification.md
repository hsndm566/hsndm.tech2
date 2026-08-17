# Live Public Verification — 2026-08-17

The deployed `https://www.hsndm.tech/` page reached the expected AutoApply SA public interface over HTTPS. Navigation, campaign CTA, CV-intake controls, pricing, FAQ, Jeddah directions, footer enquiry controls, and the public chat trigger were rendered.

The live browser page also reported the hero background video as unavailable and rendered the branded fallback state for the explainer area. This is a media-delivery issue requiring separate investigation; no attempted UI-polish change caused or resolved it during the verification pass.

## Media repair follow-up

The Render portal storage proxy was configured with its managed storage settings, and both replacement MP4 paths now return a 307 redirect followed by HTTP 200 `video/mp4` with byte-range support from the public domain. A fresh live browser visit no longer reports the hero’s unavailable-background state. The explainer media still requires browser-level playback inspection because its source fallback text remains visible to document extraction even when the video element is present.

Browser-level inspection confirmed both live video elements have `readyState: 4`, `networkState: 1`, no media errors, and decoded dimensions of 1280×720. The hero is actively playing; the muted explainer video is fully buffered and paused while outside the active viewport, so it was brought into view for the final playback check.

With the explainer in view, the live browser rendered its video frame and reported it as `paused: false`, `readyState: 4`, and error-free. The offscreen hero became paused under browser resource management but remained fully buffered and error-free. This confirms normal muted autoplay behavior for the active, in-view media surface rather than a delivery failure.
