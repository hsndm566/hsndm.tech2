# Azure release manifest

**Build verification date:** 2026-08-14  
**Managed project checkpoint:** `fff406b6`  
**Observed GitHub Pages source commit:** `7718e087dd7e861f8a838b8c28b31b6e0ebc30ac`  
**Build command:** `pnpm test && pnpm check && pnpm build`  
**Result:** Passed. This document inventories release inputs and generated static artifacts; it does not copy customer data, runtime secrets, database contents, or proprietary media bytes.

## Release input integrity record

| Input | SHA-256 |
|---|---|
| `package.json` | `910ace52235c0790a99ffb8b181df77a406da8caef5976d7fc52882384733222` |
| `pnpm-lock.yaml` | `ac9ea75c33a3b3c9cbff4874afa55da8bf84e9288661287f7b60683dfeb61058` |
| `vite.config.ts` | `44b81c53e400e034d60845dabd6f8a13590f72a535d5addeb7b8a17f2ba0a2fb` |
| `railway.toml` | `e605f20032da4df993e710d9670a22962e5f4ddd3dcd652b6fb43bf7ede57ec3` |
| `infra/azure/main.bicep` | `7fca4a5fc423d372ce31a91ad8a950134bf835ffe2580941757280987d74583a` |
| `.github/workflows/azure-manual-deploy.yml` | `9c6d041641f529647d528b54176490e26cdca874b808f57464b72da6c462d7c9` |
| `.github/workflows/azure-readonly-inventory.yml` | `389e841c02494a5372731b2e99a94a1a59f8769b6eed9ffdf71d047fa59f9e86` |

## Complete generated static artifact inventory

The verified build contains the following 43 published static artifacts under `dist/public`. Asset names are content-addressed by the Vite build and must be regenerated—not copied from an unverified workstation—when the future Azure frontend uses a different `VITE_API_BASE_URL`.

| Artifact | Bytes |
|---|---:|
| `.gitkeep` | 0 |
| `404.html` | 2,535 |
| `CNAME` | 11 |
| `__manus__/debug-collector.js` | 25,168 |
| `__manus__/version.json` | 57 |
| `ar/enquire/index.html` | 2,724 |
| `ar/how-it-works/index.html` | 2,599 |
| `ar/index.html` | 2,978 |
| `ar/pricing/index.html` | 2,607 |
| `ar/privacy/index.html` | 2,703 |
| `ar/support/index.html` | 2,628 |
| `ar/terms/index.html` | 2,615 |
| `ar/thank-you/index.html` | 2,622 |
| `assets/ArabicEnquire-BpoTflxp.js` | 10,887 |
| `assets/ArabicHome-Di1uRTV9.js` | 69,491 |
| `assets/ArabicThankYou-DMM1LQgl.js` | 2,109 |
| `assets/Ats-CXV8Dw2V.js` | 8,529 |
| `assets/Dashboard-CfdlsYen.js` | 36,073 |
| `assets/Enquire-B1LfFR_H.js` | 9,412 |
| `assets/InformationPage-DPa8QA4l.js` | 10,884 |
| `assets/Map-D0NojL1m.js` | 1,182 |
| `assets/NotFound-D64onvgF.js` | 3,051 |
| `assets/PricingPage-D5RVrZL5.js` | 5,932 |
| `assets/ThankYou-BnlsTIxJ.js` | 3,996 |
| `assets/careerMatcher-CQxLV_rN.js` | 1,624 |
| `assets/data-client-hx5vyEfu.js` | 99,199 |
| `assets/icons-xlOzCRCs.js` | 16,615 |
| `assets/index-4SfMSt5e.css` | 176,966 |
| `assets/index-C9F8BNXA.js` | 116,530 |
| `assets/mammoth.browser-BpSOTref.js` | 500,215 |
| `assets/pdf-DDWtYU6L.js` | 489,706 |
| `assets/pdf.worker.min-CLrFZWeq.mjs` | 1,312,452 |
| `assets/react-vendor-BjqesOMn.js` | 317,780 |
| `assets/useAuth-hTUPvTTS.js` | 1,109 |
| `assets/usePersistFn-BQFzRsVb.js` | 219 |
| `ats/index.html` | 2,436 |
| `enquire/index.html` | 2,462 |
| `how-it-works/index.html` | 2,520 |
| `index.html` | 2,535 |
| `pricing/index.html` | 2,438 |
| `privacy/index.html` | 2,438 |
| `robots.txt` | 63 |
| `sitemap.xml` | 1,717 |
| `support/index.html` | 2,435 |
| `terms/index.html` | 2,413 |
| `thank-you/index.html` | 2,369 |

## External asset reference inventory

The current application references five external storage paths. Before independent Azure static hosting, copy the approved original media files to Azure Blob Storage or another first-party Azure-backed static location, verify MIME type/cache behavior, update source references, rebuild, and test. Do not assume that copying the compiled HTML/JS will migrate these assets.

| External reference | Current use | Required Azure disposition |
|---|---|---|
| `/manus-storage/autoapply-desk_635170b2.jpg` | English visual detail section | Copy approved original to the Azure asset target and update the source reference. |
| `/manus-storage/autoapply-flow_6c03602a.jpg` | English and Arabic workflow visual | Copy approved original to the Azure asset target and update both language references. |
| `/manus-storage/autoapply-hero-operations_ad007abc.jpg` | Hero poster fallback | Copy approved original, preserve optimized image behavior, and retest mobile fallback. |
| `/manus-storage/autoapply-sa-hero-loop_52bacf1a.mp4` | Desktop hero loop | Copy only after reviewing video size, codec, cache, and mobile fallbacks; do not auto-download or re-encode during cutover. |
| `/manus-storage/autoapply-symbol_80d77010.png` | Brand mark throughout public routes | Copy approved original and update all shared/public route references. |

## Deployment endpoint record

| Endpoint | Current observed role | Azure migration treatment |
|---|---|---|
| `https://hsndm.tech` | GitHub Pages static public mirror | Keep live until a rebuilt, tested Azure Static Web Apps artifact has passed staging checks. |
| `https://hsndmstudio-lyaavagg.manus.space` | Managed Express-backed full-stack boundary | Keep as fallback until Azure API, OAuth, database, assets, and scheduler pass acceptance. |
| Future `https://api.hsndm.tech` | Not provisioned | Reserve for the validated Azure Container Apps API only after a custom-domain and CORS/OAuth plan is approved. |

## Excluded by design

This manifest intentionally excludes database rows, backup archives, CV text, uploaded files, secret values, OAuth/JWT material, API tokens, and raw media bytes. Each needs a separate controlled target and migration approval; including them in a source or release manifest would weaken rather than improve data safety.
