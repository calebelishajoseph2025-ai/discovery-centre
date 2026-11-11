/**
 * Build-time internationalization verification script.
 * Enforces key parity, parameter placeholder consistency, and fixed-fact token immutability.
 */

import { en } from '../src/i18n/dictionaries/en.ts';
import { ta } from '../src/i18n/dictionaries/ta.ts';

console.log('[check-i18n] Checking dictionary parity between English and Tamil...');

const enKeys = Object.keys(en).sort();
const taKeys = Object.keys(ta).sort();

// Check for missing keys
const missingInTa = enKeys.filter((k) => !(k in ta));
if (missingInTa.length > 0) {
  console.error('[check-i18n] Missing keys in Tamil dictionary:', missingInTa);
  process.exit(1);
}

const extraInTa = taKeys.filter((k) => !(k in en));
if (extraInTa.length > 0) {
  console.error('[check-i18n] Extra keys found in Tamil dictionary:', extraInTa);
  process.exit(1);
}

// Check parameter placeholder parity: e.g. {count}, {minutes}, {totalScore}
for (const key of enKeys) {
  const enStr = (en as Record<string, string>)[key];
  const taStr = (ta as Record<string, string>)[key];

  if (!enStr || !taStr) {
    console.error(`[check-i18n] Empty string for key: ${key}`);
    process.exit(1);
  }

  if (enStr.includes('TODO') || taStr.includes('TODO')) {
    console.error(`[check-i18n] Unresolved TODO in key: ${key}`);
    process.exit(1);
  }

  const enParams = (enStr.match(/\{([a-zA-Z0-9_]+)\}/g) || []).sort();
  const taParams = (taStr.match(/\{([a-zA-Z0-9_]+)\}/g) || []).sort();

  if (JSON.stringify(enParams) !== JSON.stringify(taParams)) {
    console.error(
      `[check-i18n] Parameter placeholder mismatch for key: ${key}\n  en: ${enParams}\n  ta: ${taParams}`
    );
    process.exit(1);
  }
}

// Verify that fixed facts tokens render byte-identically in Tamil dictionary
const requiredTokens = [
  '18 Garden Road, Riverdale',
  'INR 100',
  'INR 50',
  '10:00',
  '17:00',
];

for (const token of requiredTokens) {
  const presentInEn = Object.values(en).some((v) => v.includes(token));
  const presentInTa = Object.values(ta).some((v) => v.includes(token));

  if (presentInEn && !presentInTa) {
    console.error(`[check-i18n] Required fixed fact token "${token}" is missing in Tamil dictionary`);
    process.exit(1);
  }
}

console.log('✅ [check-i18n] All i18n checks passed with 100% dictionary parity.');
