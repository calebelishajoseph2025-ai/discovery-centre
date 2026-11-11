/**
 * Store factory and visitor key generator.
 * Selects store adapter:
 * - 'supabase': When SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and RATE_LIMIT_SALT are present.
 * - 'memory': When DATA_STORE=memory or local testing mode.
 * - 'off': Fallback graceful degradation mode (Mode A).
 */

import { createHash } from 'node:crypto';
import { DataStore } from './types.ts';
import { MemoryDataStore } from './memory.ts';
import { OffDataStore } from './off.ts';
import { SupabaseDataStore } from './supabase.ts';

let cachedStore: DataStore | null = null;

export function getStore(): DataStore {
  if (cachedStore) {
    return cachedStore;
  }

  const explicitMode = process.env.DATA_STORE?.toLowerCase();
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const salt = process.env.RATE_LIMIT_SALT?.trim();

  if (explicitMode === 'off') {
    cachedStore = new OffDataStore();
    return cachedStore;
  }

  if (explicitMode === 'memory') {
    cachedStore = new MemoryDataStore();
    return cachedStore;
  }

  if (supabaseUrl && supabaseKey) {
    if (!salt) {
      console.warn(
        '[Store] SUPABASE_URL provided but RATE_LIMIT_SALT is missing. Degraded to off store for security.'
      );
      cachedStore = new OffDataStore();
      return cachedStore;
    }
    cachedStore = new SupabaseDataStore(supabaseUrl, supabaseKey);
    return cachedStore;
  }

  // Default fallback: memory if local dev, otherwise off
  if (explicitMode === 'auto' || !explicitMode) {
    cachedStore = new MemoryDataStore();
    return cachedStore;
  }

  cachedStore = new OffDataStore();
  return cachedStore;
}

/**
 * Calculates an anonymous visitor key hash: sha256(ip + RATE_LIMIT_SALT + UTC-date).
 * Retained <= 24 hours, never joined to feedback records.
 */
export function getVisitorKey(
  ip: string = '127.0.0.1',
  customDate?: string
): string {
  const salt =
    process.env.RATE_LIMIT_SALT ||
    'default-dev-salt-replace-in-production-environments-32-chars';
  const utcDate = customDate || new Date().toISOString().split('T')[0];
  const hash = createHash('sha256');
  hash.update(`${ip}:${salt}:${utcDate}`);
  return hash.digest('hex');
}
