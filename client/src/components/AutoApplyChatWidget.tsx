/**
 * The public AI chat launcher is intentionally disabled.
 *
 * Production health verification reports that the connected Railway endpoint is
 * currently serving a non-AutoApply business profile. The global
 * WhatsAppBusinessCta remains the safe human handoff until an AutoApply-specific
 * tenant is verified end-to-end.
 */
export function AutoApplyChatWidget() {
  return null;
}
