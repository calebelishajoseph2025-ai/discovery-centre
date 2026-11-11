/**
 * Unambiguous 6-character short code generator.
 * Uses alphabet 'abcdefghjkmnpqrstuvwxyz23456789' (excludes i, l, o, 0, 1 - size 31).
 * Employs rejection sampling over byte range [0, 247] (248 = 31 * 8)
 * to completely eliminate modulo bias.
 */

export const SHORT_CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // 31 chars
export const SHORT_CODE_LENGTH = 6;
const ALPHABET_SIZE = SHORT_CODE_ALPHABET.length; // 31
const REJECTION_LIMIT = 248; // Largest multiple of 31 <= 256 (31 * 8 = 248)

export type RandomBytesProvider = (count: number) => Uint8Array;

export function defaultRandomBytes(count: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(count);
    crypto.getRandomValues(arr);
    return arr;
  }
  // Fallback for Node test environments
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('node:crypto');
  return nodeCrypto.randomBytes(count);
}

export function generateShortCode(
  getRandomBytes: RandomBytesProvider = defaultRandomBytes
): string {
  let result = '';
  // Request a batch of bytes to minimize syscalls while rejecting bytes >= 248
  while (result.length < SHORT_CODE_LENGTH) {
    const needed = (SHORT_CODE_LENGTH - result.length) * 2;
    const bytes = getRandomBytes(Math.max(needed, 16));
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b < REJECTION_LIMIT) {
        result += SHORT_CODE_ALPHABET[b % ALPHABET_SIZE];
        if (result.length === SHORT_CODE_LENGTH) {
          return result;
        }
      }
    }
  }
  return result;
}
