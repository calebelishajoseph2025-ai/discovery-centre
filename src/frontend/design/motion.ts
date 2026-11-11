export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.45, 0, 0.55, 1] as const;

export const DURATION = {
  micro: 0.12,
  short: 0.2,
  medium: 0.32,
  long: 0.48,
} as const;

export function shouldReduceMotion(
  root: Pick<Document, 'documentElement'> | null = typeof document === 'undefined'
    ? null
    : document
): boolean {
  if (!root || typeof window === 'undefined') return false;
  if (root.documentElement.getAttribute('data-quiet') === 'true') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
