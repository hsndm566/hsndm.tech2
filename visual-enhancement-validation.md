# Public Enhancement Visual Validation

Date: 2026-08-27

## Verified routes and viewports

The English (`/`) and Arabic (`/ar`) homepage were captured at 375×812 and 1440×1000.

## Findings

Both routes retain the existing near-black, warm-paper, and signal-orange identity. The hero campaign ledger remains the dominant proof artifact, while the updated compact activity indicator gives the English page a more legible current-state cue without changing campaign claims. The three hero statistics remain readable at both viewports. Arabic retains its right-to-left layout and equivalent hero-stat grid.

The existing numbered workflow, pricing, proof strip, privacy, FAQ, and footer all render through the full page. No clipped fixed control, missing section, collision, or contrast issue was observed in either capture. Desktop preserves its asymmetrical ledger composition; mobile stacks the ledger and activity treatment within the viewport without a horizontal overflow signal.

The independent style review found the established operational-ledger identity coherent and recommended only future extensions of that pattern into additional areas. No reviewer recommendation required a theme change or was treated as an implementation gate.

## Bklit status-pattern extension

The later Bklit UI status-pattern extension was checked at 375×812 in English and Arabic. The first viewport retains readable bilingual hero copy, primary campaign CTA, and the existing editorial visual hierarchy. The campaign activity treatment remains below the primary conversion content, so it does not compete with the CTA or fixed mobile contact controls. The animation is CSS-only and disabled under reduced-motion preferences.

The desktop metric-card refinement was initially found to overlap the English hero’s campaign-note area. The final correction returns metrics and the status chip to normal document flow at widths above 680px, so the hero expands to fit them instead of overlaying the campaign copy. The corrected 1440×900 English and Arabic renders show the approval copy, CTAs, ledger, factual metric cards, and status treatment as separate readable regions.

The next operational-ledger stage was reviewed at 1280×900 in full-page English and Arabic layouts. The original four approval statements remain intact, now paired with 01–04 stage labels. The section remains readable as a compact dark proof strip, the stage ordering holds in RTL, and the pricing, approval, and footer sections retain their existing copy and visual hierarchy.

The public ATS review baseline at 1280×900 presents the required file input, Saudi-city and industry selectors, optional target role, local CV-text preview, and disabled-until-ready review action in a simple form card. The next refinement should improve scan hierarchy and privacy-status visibility without changing extraction, remote-review timeout, local fallback, or data-sharing behavior.

The refined ATS workbench was reviewed at 375×812 and 1280×900. The three labelled stages, file input, selectors, CV-text field, readable minimum-text status, and primary preview action remain fully visible at both sizes. The compact phone layout stacks the stage rail before the form; the desktop layout uses a single horizontal rail. The device-local privacy explanation, analysis behavior, and fallback handling remain unchanged.

## Enquiry private-review stage

The English and Arabic enquiry routes were checked at 1280×900 and 375×812. Their first-step form remains clear at each width, while the new dark `02` status rail makes the local review state explicit before the contact-option card. A local-only interaction check completed the required fields and rendered `02 / Private review` in English and `02 / مراجعة خاصة` in Arabic. Each route retained its labelled inputs, plan context, device-local CV explanation, contact-choice control, explicit authorization checkbox, and no-submission-before-approval promise. The interactive review did not select a contact option or invoke secure enquiry, email, WhatsApp, or campaign activity; the local browser console reported no errors.

## Pricing comparison navigation

The English and Arabic pricing routes were reviewed at 1280×900 and 375×812. The comparison retains its existing plan values, campaign-scope statements, payment-not-connected explanation, and enquiry destinations. At both widths, the table stays readable within the intended horizontal comparison container, with an explicit instruction to swipe, scroll, or use left/right arrow keys. The region now accepts keyboard focus with a signal-orange focus ring, while Arabic headings and values align to the RTL reading direction. No purchase, checkout, plan-selection, or payment behavior was introduced.

## Services decision hierarchy

The English and Arabic services pages were reviewed at 1280×900 and 375×812. The page now introduces the two existing service tracks with a concise, factual choice note and uses numbered operational labels, signal rails, and consistently sized action controls to distinguish the job-search and business-system conversations. The cards stack without clipping on a phone and retain their RTL order in Arabic. Initial visual review identified action text obscured by a more-specific global link rule; explicit white label color was restored and the desktop and mobile renders were rechecked. Neither route starts work, collects payment, or changes the existing enquiry/WhatsApp destinations.

## Information-page reading guide

The English how-it-works, support, privacy, terms, case-study, and campaign-report sample routes were reviewed at 1280×900. Their Arabic counterparts were reviewed at 375×812. The shared page layout now provides a bilingual reading guide with visible numbered anchors before the existing section cards, and each card is an explicit labelled landmark target. Across the long Arabic legal and illustrative pages, headings, guide links, cards, notices, and the campaign CTA remain readable with a stable RTL stack and no observed clipping or overflow. The implementation retains the original policy, support, owner-reported, and illustrative-content wording; it adds only navigational structure, focus feedback, and visual hierarchy.

## Campaign status and confirmation states

The English and Arabic confirmation routes, plus the campaign-status access-recovery state, were reviewed at 1280×900 and 375×812. Confirmation pages now show a compact two-step ledger that distinguishes receipt from the visitor-controlled WhatsApp continuation, while retaining existing handoff wording and response safeguards. A desktop review found several secondary and recovery action labels obscured by a global link color rule; explicit contrast was restored and rechecked. The Arabic confirmation capture initially showed an apparent narrow-view clipping issue in the preview tool. An exact 375px browser measurement confirmed the receipt card and its parent frame both fit from 16px to 359px, with a 375px document scroll width and no horizontal overflow. The private campaign-status loading state now announces its status, and the no-link recovery control remains readable without exposing or accessing campaign data.

## Protected dashboard and settings states

The existing authenticated first-login dashboard and profile-settings surface were reviewed at 1280×900 and 375×812 without changing session state, reading additional candidate records, or submitting data. The dashboard retains its factual zero-record workspace, approval checklist, evidence-first explanations, and no-activity state. Settings now introduces the existing private campaign-preferences form with a logical signal rail that remains stable on a phone. Dashboard and settings secure-loading states announce progress; timeout and data-error surfaces are presented as alert states; and signed-out cards explicitly identify the secure workspace boundary. External help links retain their existing destination but now use `noopener noreferrer`. The first-login component preserves its existing English/Arabic local preference and RTL contract, validated by its focused regression suite.

The dashboard loading skeleton was also refined as an explicitly announced, non-data-bearing region. It now identifies that a secure workspace is loading before rendering any placeholder shapes, states that no campaign records are shown until session and data checks finish, and hides decorative skeleton blocks from assistive technology. Existing desktop and 375px dashboard layouts were rechecked after the component change; no ready-state hierarchy, real data, campaign action, or zero-record message was altered.
