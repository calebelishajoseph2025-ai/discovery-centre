/**
 * Store ports and interfaces for anonymous visitor features:
 * - Feedback
 * - Short plans
 * - Exhibit favourites
 * - Rate limiter
 * Server-only module.
 */

import { FeedbackInput, ShortPlanPayload } from '../lib/schemas.ts';

export interface FeedbackSummaryResult {
  available: boolean;
  total: number;
  helpfulPct: number | null; // Only populated when total >= 5
}

export interface FeedbackStore {
  submit(feedback: FeedbackInput, planHash: string): Promise<void>;
  summary(): Promise<FeedbackSummaryResult>;
}

export interface ShortPlanStore {
  create(code: string, payload: ShortPlanPayload): Promise<boolean>;
  get(code: string): Promise<ShortPlanPayload | null>;
}

export interface FavouriteStore {
  counts(): Promise<Record<string, number>>;
  adjust(slug: string, delta: 1 | -1): Promise<number>;
}

export interface StoreRateLimiter {
  take(
    bucket: string,
    keyHash: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean>;
}

export interface DataStore {
  mode: 'supabase' | 'memory' | 'off';
  feedback: FeedbackStore;
  shortPlans: ShortPlanStore;
  favourites: FavouriteStore;
  rateLimit: StoreRateLimiter;
  ping(): Promise<boolean>;
}
