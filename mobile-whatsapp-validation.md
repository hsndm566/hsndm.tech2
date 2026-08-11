# Mobile Poster and WhatsApp Handoff Verification

The home page and campaign form were reviewed at a 375px mobile viewport. The hero poster remains legible behind the mobile content and uses transform-only motion only when reduced motion is not requested. The video element remains absent at this breakpoint, preserving the low-bandwidth poster fallback.

The campaign form clearly explains that submitting opens a prefilled WhatsApp campaign brief and that the selected CV must be attached directly in the resulting chat. The WhatsApp message is generated client-side from the submitted name, email, target lane, and selected-file name, then the current page routes to the existing thank-you confirmation.
