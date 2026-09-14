/**
 * The public AI chat launcher is intentionally disabled.
 *
 * The connected chat endpoint is not verified for the AutoApply SA tenant. The
 * global WhatsAppBusinessCta remains the safe human handoff until an
 * AutoApply-specific tenant is verified end-to-end.
 */
export function AutoApplyChatWidget() {
  return null;
}
