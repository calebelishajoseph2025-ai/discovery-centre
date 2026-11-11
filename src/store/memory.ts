/**
 * In-memory store adapter (Mode B).
 * Fully supports all anonymous visitor features in-memory for testing and offline/local execution.
 */

import { FeedbackInput, ShortPlanPayload } from '../lib/schemas.ts';
import { EXHIBITS } from '../content/exhibits.ts';
import {
  DataStore,
  FeedbackStore,
  FeedbackSummaryResult,
  ShortPlanStore,
  FavouriteStore,
  StoreRateLimiter,
} from './types.ts';
import { RateLimited } from './errors.ts';

export class MemoryDataStore implements DataStore {
  public readonly mode = 'memory';

  // In-memory collections
  private feedbackItems: Array<{
    helpful: boolean;
    comment: string | null;
    planHash: string;
    locale: string;
    quiet: boolean;
    createdAt: Date;
  }> = [
    // Pre-seed a few anonymous sample rows for realistic social proof demo
    { helpful: true, comment: null, planHash: 'a1b2c3d4e5f67890', locale: 'en', quiet: false, createdAt: new Date() },
    { helpful: true, comment: null, planHash: 'b2c3d4e5f6789012', locale: 'en', quiet: false, createdAt: new Date() },
    { helpful: true, comment: null, planHash: 'c3d4e5f678901234', locale: 'en', quiet: true, createdAt: new Date() },
    { helpful: true, comment: null, planHash: 'd4e5f67890123456', locale: 'ta', quiet: false, createdAt: new Date() },
    { helpful: false, comment: null, planHash: 'e5f6789012345678', locale: 'en', quiet: false, createdAt: new Date() },
    { helpful: true, comment: null, planHash: 'f67890123456789a', locale: 'en', quiet: false, createdAt: new Date() },
  ];

  private shortPlansMap = new Map<
    string,
    { payload: ShortPlanPayload; expiresAt: Date }
  >();

  private favouriteCounts = new Map<string, number>();

  private rateLimitMap = new Map<
    string,
    { hits: number; windowStart: number }
  >();

  constructor() {
    // Initialise baseline favourite counts from content
    for (const ex of EXHIBITS) {
      this.favouriteCounts.set(ex.slug, ex.initialFavourites);
    }
  }

  public feedback: FeedbackStore = {
    submit: async (feedback: FeedbackInput, planHash: string): Promise<void> => {
      this.feedbackItems.push({
        helpful: feedback.helpful,
        comment: feedback.comment?.trim() || null,
        planHash,
        locale: feedback.locale,
        quiet: feedback.quiet,
        createdAt: new Date(),
      });
    },

    summary: async (): Promise<FeedbackSummaryResult> => {
      const total = this.feedbackItems.length;
      if (total < 5) {
        return { available: true, total, helpfulPct: null };
      }
      const helpfulCount = this.feedbackItems.filter((f) => f.helpful).length;
      const helpfulPct = Math.round((helpfulCount / total) * 100);
      return { available: true, total, helpfulPct };
    },
  };

  public shortPlans: ShortPlanStore = {
    create: async (code: string, payload: ShortPlanPayload): Promise<boolean> => {
      if (this.shortPlansMap.has(code)) {
        return false; // Collision
      }
      const expiresAt = new Date(Date.now() + 90 * 24 * 3600 * 1000); // 90 days
      this.shortPlansMap.set(code, { payload, expiresAt });
      return true;
    },

    get: async (code: string): Promise<ShortPlanPayload | null> => {
      const entry = this.shortPlansMap.get(code);
      if (!entry) return null;
      if (entry.expiresAt.getTime() < Date.now()) {
        this.shortPlansMap.delete(code);
        return null;
      }
      return entry.payload;
    },
  };

  public favourites: FavouriteStore = {
    counts: async (): Promise<Record<string, number>> => {
      const result: Record<string, number> = {};
      for (const [slug, count] of this.favouriteCounts.entries()) {
        result[slug] = count;
      }
      return result;
    },

    adjust: async (slug: string, delta: 1 | -1): Promise<number> => {
      const current = this.favouriteCounts.get(slug);
      if (current === undefined) {
        throw new Error(`Unknown exhibit slug: ${slug}`);
      }
      const updated = Math.max(0, current + delta);
      this.favouriteCounts.set(slug, updated);
      return updated;
    },
  };

  public rateLimit: StoreRateLimiter = {
    take: async (
      bucket: string,
      keyHash: string,
      limit: number,
      windowSeconds: number
    ): Promise<boolean> => {
      const compositeKey = `${bucket}:${keyHash}`;
      const now = Date.now();
      const windowMs = windowSeconds * 1000;

      let record = this.rateLimitMap.get(compositeKey);
      if (!record || now - record.windowStart >= windowMs) {
        record = { hits: 1, windowStart: now };
        this.rateLimitMap.set(compositeKey, record);
        return true;
      }

      if (record.hits < limit) {
        record.hits++;
        return true;
      }

      return false;
    },
  };

  public async ping(): Promise<boolean> {
    return true;
  }
}
