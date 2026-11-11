/**
 * Lightweight type-safe translation helper.
 * Interpolates {param} placeholders and falls back to English when needed.
 */

import { Locale, DEFAULT_LOCALE } from './config.ts';
import { Dictionary, en } from './dictionaries/en.ts';
import { ta } from './dictionaries/ta.ts';

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ta,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

export function createTranslator(locale: Locale) {
  const dict = getDictionary(locale);
  const fallbackDict = dictionaries[DEFAULT_LOCALE];

  return function t(
    key: keyof Dictionary,
    params?: Record<string, string | number>
  ): string {
    let text = dict[key] || fallbackDict[key] || (key as string);

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }
    }

    return text;
  };
}
