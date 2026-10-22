/**
 * Tiny haptic helper. Uses the Vibration API where it is available
 * (Android Chrome / iOS Safari 17.4+ on supported devices) and is a
 * silent no-op everywhere else.
 */
const isSupported = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export function haptic(pattern: number | number[] = 8): void {
  if (!isSupported()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore – vibration is a progressive enhancement
  }
}

/** Light tap used for tab switches, chips and toggles. */
export const hapticTap = (): void => haptic(8);

/** Slightly firmer feedback for destructive / committed actions. */
export const hapticImpact = (): void => haptic([10, 30, 14]);

/** Success pattern used after a confirmed action. */
export const hapticSuccess = (): void => haptic([12, 40, 18]);
