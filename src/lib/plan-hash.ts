/**
 * SHA-256 plan hash generator.
 * Produces the first 16 hex characters over the canonical PlanInput representation.
 * Uses Web Crypto API (crypto.subtle), compatible with Node.js and modern browsers.
 */

import { PlanInput } from './schemas.ts';
import { encodePlanInput } from './share.ts';

export async function planHash(input: PlanInput): Promise<string> {
  const canonicalQuery = encodePlanInput(input).toString();
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalQuery);

  // In Node.js or browser environment:
  const subtle =
    typeof crypto !== 'undefined' && crypto.subtle
      ? crypto.subtle
      : (await import('node:crypto')).webcrypto.subtle;

  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hex.slice(0, 16);
}
