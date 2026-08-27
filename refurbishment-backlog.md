# UI/UX Pro Max Refurbishment Backlog

## Guiding Constraint

Retain the established AutoApply SA operational visual system: warm paper, near-black sections, signal orange, restrained motion, factual claims, approval-before-submission boundaries, and Arabic RTL parity. Each stage must avoid simulated campaign results, unreviewed testimonial content, or new external dependencies without a specific need.

## Stage 2 Route Audit — 2026-08-27

| Priority | Surface | Verified current strengths | Focused next refinement |
|---|---|---|---|
| 1 | `/pricing` and `/ar/pricing` | Plan hierarchy, comparison table, guardrails, and non-checkout payment framing are clear. | Improve keyboard-visible table navigation and compact-table handling without changing prices, package scope, or payment claims. |
| 2 | `/services` | The two service tracks are clear and contained. | Strengthen the choice point and related-link grouping while retaining the separate job-seeker and business paths. |
| 3 | `/how-it-works` and `/support` | Numbered-card sequence and consent-forward CTA are clear. | Add consistent operational emphasis for actionable cards and mobile scan hierarchy. |
| 4 | `/case-studies` and `/campaign-report-sample` | Both clearly label owner-supplied figures and illustrative campaign material. | Improve evidence labels and visual distinction between factual framework, owner-reported context, and illustrative content. |
| 5 | `/privacy` and `/terms` | Legal content is grouped into numbered, readable cards with a consistent action band. | Improve long-form card rhythm and reading landmarks without revising policy or legal copy. |
| 6 | Authenticated dashboard and settings | Existing route guards, skeletons, empty states, and protected data boundaries are in place. | Audit separately with realistic zero-data and signed-out states; avoid fabricated candidate activity. |

## Recommended Sequence

1. Complete the already-started ATS workbench release.
2. Refine pricing comparison accessibility and mobile tabular presentation.
3. Refine service-track decision hierarchy.
4. Refine supporting information pages and evidence labels.
5. Audit and refine protected dashboard/profile surfaces using existing real-state handling only.
6. Conduct a final bilingual, responsive, keyboard, reduced-motion, and performance pass.

## Responsive and RTL Audit Notes

The Arabic equivalents of pricing, services, how-it-works, support, case study, campaign-report sample, privacy, and terms were reviewed at 375×812. Their cards stack without clipping, Arabic reading order is retained, the return-to-home link remains available, and each page preserves its non-payment, approval, and illustrative-content boundaries. The pricing comparison intentionally becomes horizontally dense at this narrow width, so its next stage should prioritize an explicit, keyboard-accessible compact comparison treatment while retaining every current plan value and scope statement.

## Enquiry Conversion Audit

The English and Arabic enquiry pages were reviewed at 1280×900 and 375×812. Both versions keep a legible campaign-intake header, clear required-field labels, optional on-device CV selection, an explicit review-before-contact boundary, plan-query continuity, and a separate consent decision before any handoff. The mobile layout correctly serializes the brief and retains the signal-orange review action. The next small refinement should make the pre-handoff review state read as an explicit second stage, while retaining the existing one-submit-to-preview behavior, recipient choices, consent checkbox, secure-web path, and no-CV-sent explanation.

The rendered English accessibility tree exposes the campaign-brief heading and the required name field with an associated accessible name. Interactive verification is limited to non-sensitive local form completion and the internal review state; no contact option, secure enquiry, email client, or WhatsApp handoff is activated during this stage.

After completing only the required local fields, the form’s internal submit transition rendered the new `02 / Private review` status marker. The page did not initiate a secure enquiry, email, WhatsApp, or campaign action. The local preview environment intercepted pointer events from its own overlay, so the review transition was verified through the rendered form API rather than contact-choice controls.

At 375×812, the Arabic form likewise rendered `02 / مراجعة خاصة` after its local-only review transition. The phone viewport retained the RTL form order, required-field accessible names, and the private-review boundary. No candidate or contact data was submitted beyond the local browser state used for this check.

## Protected-Route Audit

The protected dashboard entry and settings route were reviewed without changing authentication, candidate records, or browser session state. The dashboard presents its existing evidence-first zero-data state, onboarding checklist, approval-requirement cards, and no-activity/application messaging. The settings route presents the branded skeleton recovery state while the protected session boundary resolves. A later protected-route stage should retain these truthful states and prioritize perceived loading clarity, but no dashboard modification is included in the next public enquiry stage.
