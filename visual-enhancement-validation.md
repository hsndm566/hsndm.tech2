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
