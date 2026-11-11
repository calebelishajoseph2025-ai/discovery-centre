import { Locale } from '../../i18n/config.ts';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface Preferences {
  theme: ThemePreference;
  quiet: boolean;
  guide: boolean;
  locale: Locale;
}

export const PREF_KEYS = {
  theme: 'ndc:theme',
  quiet: 'ndc:quiet',
  guide: 'ndc:guide',
  locale: 'ndc:locale',
} as const;

export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean
): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  return prefersDark ? 'dark' : 'light';
}

export function readPreferences(
  storage: PreferenceStorage | null,
  options: {
    pathname?: string;
    search?: string;
    prefersDark?: boolean;
    prefersReducedMotion?: boolean;
  } = {}
): Preferences {
  const pathname = options.pathname ?? '';
  const params = new URLSearchParams(options.search ?? '');
  const prefersReduced = options.prefersReducedMotion ?? false;

  let theme: ThemePreference = 'dark';
  const storedTheme = storage?.getItem(PREF_KEYS.theme);
  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    theme = storedTheme;
  }

  const queryQuiet = params.get('quiet') === '1';
  const storedQuiet = storage?.getItem(PREF_KEYS.quiet) === 'true';
  const quiet = queryQuiet || storedQuiet;

  const storedGuide = storage?.getItem(PREF_KEYS.guide);
  const guide = storedGuide === null || storedGuide === undefined
    ? !prefersReduced
    : storedGuide === 'true';

  const locale: Locale = pathname.startsWith('/ta') ? 'ta' : 'en';

  return { theme, quiet, guide, locale };
}

export function persistPreference(
  storage: PreferenceStorage | null,
  key: keyof typeof PREF_KEYS,
  value: string
): void {
  try {
    storage?.setItem(PREF_KEYS[key], value);
  } catch {
    // Storage may be unavailable.
  }
}

export function applyDocumentPreferences(
  prefs: Preferences,
  prefersDark: boolean,
  root: HTMLElement | null = typeof document === 'undefined' ? null : document.documentElement
): ResolvedTheme {
  const resolved = resolveTheme(prefs.theme, prefersDark);
  if (!root) return resolved;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-theme-pref', prefs.theme);
  if (prefs.quiet) {
    root.setAttribute('data-quiet', 'true');
  } else {
    root.removeAttribute('data-quiet');
  }
  root.lang = prefs.locale;
  const themeColor = resolved === 'dark' ? '#05090c' : '#f4efe5';
  const meta = typeof document !== 'undefined'
    ? document.querySelector('meta[name="theme-color"]')
    : null;
  if (meta) meta.setAttribute('content', themeColor);
  return resolved;
}
