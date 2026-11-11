/**
 * Internationalization configuration.
 * Supported locales: 'en' (English), 'ta' (Tamil).
 */

export const LOCALES = ['en', 'ta'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const ENABLED_LOCALES: Locale[] = ['en', 'ta'];

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
