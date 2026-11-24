/**
 * Waitlist position: 1 + number of people who confirmed before you,
 * minus `boost` places for every friend you referred who confirmed. Never below 1.
 */
export function waitlistPosition(params: {
  confirmedBefore: number;
  confirmedReferrals: number;
  boost: number;
}): number {
  const { confirmedBefore, confirmedReferrals, boost } = params;
  return Math.max(1, 1 + confirmedBefore - confirmedReferrals * boost);
}
