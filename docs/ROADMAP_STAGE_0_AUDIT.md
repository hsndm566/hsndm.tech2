# Stage 0 — Infrastructure Check

**Status:** Completed on 13 August 2026. This report records the verified baseline before the staged capability build-out begins.

| Control | Verified status | Evidence | Required follow-up |
| --- | --- | --- | --- |
| Public availability | Passing | `https://hsndm.tech` returned HTTP 200 through GitHub Pages. | Maintain a monitored health check. |
| Source deployment | Passing | GitHub Pages reports a built site served from the `main` branch. | Keep the Pages deployment and managed release aligned. |
| HTTPS | Passing | Certificate subject is `hsndm.tech`, issued by Let’s Encrypt, valid through 22 October 2026; Pages HTTPS enforcement is enabled. | Keep the domain’s GitHub Pages DNS records intact. |
| Certificate management | Conditional | GitHub Pages obtains and uploads TLS certificates after a successful custom-domain DNS check.[1] The live certificate is valid, but the repository Pages API returned no configured custom-domain value. | Reconcile the Pages custom-domain setting before relying on automatic renewal as an audited control. |
| DNS | Passing at the time checked | The apex resolved to GitHub Pages addresses, including `185.199.109.153` and `185.199.111.153`. | Preserve the complete GitHub Pages record set. |
| Uptime alerting | Missing from the current repository | No active uptime-monitor or weekly-summary workflow was present in `.github/workflows/`. | Implement a deterministic uptime and response-time monitor in the observability stage. |
| Data backup routine | Missing | The application uses a managed MySQL-compatible database, but the product currently has no project-controlled backup/export routine. | Add an approved, privacy-preserving backup/export design before treating customer records as operationally resilient. |
| Robots and sitemap | Passing, but incomplete | Live `/robots.txt` references the live sitemap. Live `/sitemap.xml` lists `/`, `/ar`, and `/enquire`. | Extend the sitemap when dedicated legal, support, pricing, ATS, and Arabic journey pages are added. |
| Route metadata | Passing for the tested journeys | Live `/`, `/ar`, `/enquire`, `/ar/enquire`, `/thank-you`, and `/ar/thank-you` each returned a route-specific title, description, and canonical URL; the tested non-home routes also returned language alternates. | Retain this route-specific metadata contract for every new page. |

## Conclusion

The public marketing site is currently reachable over enforced HTTPS and is served from GitHub Pages. Core bilingual conversion routes have distinct live metadata and canonical URLs. It is **not yet appropriate to call the infrastructure fully operationally resilient**: the repository-level custom-domain setting should be reconciled, no active repository uptime alert is present, the sitemap omits some current non-home routes, and no app-managed data-backup routine is present. These gaps are carried into the following staged work rather than being treated as complete.

## Reference

[1] [GitHub Docs — Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
