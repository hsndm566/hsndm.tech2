# hsndm.tech GitHub Pages Release Handoff

## Verified release package

The verified AutoApply SA static release has been staged locally against the user-requested repository, `hsndm566/hsndm.tech`. The staged local commit is `d018ed45036e2adf114b04549db4f8d594b5ba23`. It contains the production build that passed 75 automated tests, TypeScript validation, and the desktop/mobile visual review in the managed project.

The existing GitHub Pages domain configuration was preserved exactly:

```text
www.hsndm.tech
```

The staged release includes the English, Arabic, ATS, and enquiry route files. It preserves the existing symbol and image assets, and adds both configured MP4 files at the paths referenced by the build:

| Asset path | Purpose |
|---|---|
| `manus-storage/gemini_generated_video_EA567831_5f93d04f.mp4` | Hero background loop |
| `manus-storage/gemini_generated_video_DCF37916_a9fca67a.mp4` | Explainer video |

## Publication blocker

The target repository's current remote `main` commit is `e6c544e7db3b39bb3a82be47de6fdd5c8114ec63`. A normal push was attempted using the connected GitHub credential, but GitHub returned HTTP 403:

> `Permission to hsndm566/hsndm.tech.git denied to manus-connector[bot].`

The target repository has not changed, and no domain, CNAME, DNS, Clerk, or billing configuration was modified. The currently connected repository `hsndm566/hsndm.tech2` has write access and contains the verified managed-project release.

## Safe completion requirement

Grant the connected GitHub app/bot **write access** to `hsndm566/hsndm.tech`, or reconnect that exact repository as the project's GitHub integration. Once that permission exists, push the preserved local commit or regenerate the same verified build into the repository while retaining its `CNAME` file unchanged. Do not force-push and do not replace `www.hsndm.tech` with an unverified custom-domain target.
