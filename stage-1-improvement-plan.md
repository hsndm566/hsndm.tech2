# AutoApply SA — Stage 1 Improvement Plan and Approval Gate

## Objective

This plan keeps the present AutoApply SA product, information architecture, Saudi-only positioning, bilingual pages, CV-privacy model, and existing dashboard features intact. The proposed work is divided into small, reversible batches so that operationally sensitive work—DNS binding, Clerk sign-in certification, and production-domain routing—remains explicitly separate from product code improvements.

## Proposed Batches

| Batch | Change | User problem solved | Affected page or flow | Expected impact | Risk | Reversible | New tool or setup | Approval required | Acceptance criteria |
|---|---|---|---|---|---|---|---|---|---|
| **A** | Strengthen first-use and failure recovery copy around CV upload, WhatsApp handoff, and video fallback states. | Visitors on slow or unreliable connections need clear next steps rather than uncertainty. | English and Arabic landing pages; enquiry handoff. | Higher task completion confidence. | Low. | Yes, source-only changes. | No. | Yes. | Keyboard-accessible status text, localized messaging, and no change to the existing matching or WhatsApp flow. |
| **B** | Run an accessibility and mobile-responsiveness remediation pass on public pages and dashboard surfaces. | Small-screen and keyboard users need predictable focus, readable spacing, and large tap targets. | `/`, `/ar`, `/enquire`, `/ar/enquire`, `/ats`, `/dashboard`, `/dashboard/settings`. | Better usability for the phone-first audience. | Low to medium. | Yes, scoped component/CSS edits. | No. | Yes. | Desktop and phone viewport checks, keyboard-only checks, reduced-motion check, and regression suite passing. |
| **C** | Add a short operator-facing DNS and sign-in readiness guide, including verification steps and rollback notes. | The site owner needs a precise, low-risk way to complete custom-domain setup. | Project documentation only. | Reduces deployment and support friction. | Low. | Yes, documentation-only. | No. | Yes. | Guide distinguishes Clerk DNS from dashboard hosting DNS and includes only verified current endpoints. |
| **D** | Bind `dashboard.hsndm.tech` to the managed deployment and run a real passwordless magic-link sign-in test. | Candidates cannot use the intended branded dashboard URL until routing and authentication are live. | Cloudflare DNS, Clerk, and dashboard access. | Enables the live candidate portal. | Medium to high because it changes external configuration. | Yes, by restoring the previous DNS record. | Cloudflare DNS access; a working Clerk email inbox. | **Separate explicit approval immediately before the DNS change.** | `dashboard.hsndm.tech` returns the candidate dashboard, Clerk sign-in succeeds, and the authenticated dashboard is visible. |
| **E** | Point `hsndm.tech` or `www.hsndm.tech` to the verified managed deployment only after the owner selects the production source of truth. | The public domain currently does not prove it serves this managed release. | Cloudflare DNS and production hosting. | Makes the custom public domain serve the verified current release. | High because it changes live traffic. | Yes, by restoring GitHub Pages DNS records. | Cloudflare DNS access; explicit hosting decision. | **Separate explicit approval immediately before the DNS change.** | The public custom domain renders the managed site, shows current assets, and passes mobile video and smoke checks. |

## Recommended Sequence

The recommended first batch is **Batch A**, followed by **Batch B**. Both can be completed using the existing stack and do not introduce a vendor, paid service, new database, tracking script, or authentication provider. Batch C can be prepared alongside those code-only improvements.

Batch D and Batch E should remain isolated until Cloudflare access is verified, because `dashboard.hsndm.tech` currently returns a GitHub Pages 404 and the public root redirects into the prior GitHub Pages route. Clerk’s custom asset domain is now reachable, but the end-to-end email sign-in test has not yet been completed in an interactive browser.

## Existing Boundaries to Preserve

| Boundary | Implementation requirement |
|---|---|
| **Saudi scope** | Keep all public positioning specific to Saudi Arabia, with Jeddah as the operational base. |
| **CV privacy** | Do not persist raw CV files or extracted CV text in the backend or database. |
| **Bilingual parity** | Preserve equivalent English and Arabic interaction states without overwriting approved Arabic content. |
| **Current conversion flows** | Do not change pricing, WhatsApp number, primary enquiry routes, or core local career-matching logic without a separate approval. |
| **Production safety** | Do not change DNS, Clerk configuration, authentication, billing, or external services without a fresh explicit approval at the action point. |

## Decision Requested

Approve one of the following next steps:

1. **Approve Batch A** — low-risk clarity and recovery-state improvements only.
2. **Approve Batch B** — accessibility and phone-first responsive remediation only.
3. **Approve Batch C** — create an operator DNS/sign-in guide only.
4. **Approve Batch A + B + C** — complete all no-new-tool, reversible work in one quality-controlled release.
5. **Approve Batch D or E** — only if you are ready to authorize an external DNS change immediately before execution.

*No application code, domain record, authentication configuration, or production routing was changed while creating this plan.*
