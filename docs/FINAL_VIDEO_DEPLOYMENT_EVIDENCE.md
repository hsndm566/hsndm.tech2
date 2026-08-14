# Final Video and Static Release Evidence

**Recorded:** 2026-08-14 UTC

| Target | Release evidence | Result |
| --- | --- | --- |
| GitHub Pages source | Commit `a43837829cf4140a2e4ccf1733b124e186f5a087` to `hsndm566/hsndm.tech` | Final validated release, published through the repository release script. |
| GitHub Pages deployment | Pages API status | `built`. |
| Public MP4 | `https://hsndm.tech/manus-storage/autoapply-sa-loop-bg_7ecfd5bb.mp4` | HTTP `200`, `Content-Type: video/mp4`, `Content-Length: 2658566`. |
| Live English homepage | `https://hsndm.tech/` | The public page returned the approved hero statement, Saudi Arabia/Jeddah positioning, revised engine labels, the See It Work section, its managed MP4 source, the AutoApply SA caption, and priority human review. |
| Managed-domain homepage | `https://hsndmstudio-lyaavagg.manus.space/` | The published page returned the same Saudi-focused English journey and referenced the approved MP4 from both the hero and See It Work section. |

The GitHub Pages publisher mirrors the approved original MP4 into the generated `/manus-storage/` release tree at publish time. This corrects the previous GitHub Pages `404` for the relative video asset without placing the video in the application source directory.

## Interpretation

The public browser extract can expose fallback text nested in a `<video>` element even while the browser has a playable source. Therefore the decisive static-hosting check is the verified HTTP `200` MP4 response combined with the page source reference. Silent looping, controls suppression, touch non-interaction, and reduced-motion handling are enforced by the deployed video attributes and component CSS, and were validated in the project desktop/mobile checks before release.
