/**
 * Supabase Postgres RPC DataStore adapter (Mode C).
 * Connects server-side only using publishable/anon key via RPC.
 * Never uses service_role.
 * Uses 1500ms timeout to ensure the core website never hangs.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FeedbackInput, ShortPlanPayload } from '../lib/schemas.ts';
import {
  DataStore,
  FeedbackStore,
  FeedbackSummaryResult,
  ShortPlanStore,
  FavouriteStore,
  StoreRateLimiter,
} from './types.ts';
import { StoreUnavailable, RateLimited, StoreError } from './errors.ts';

export class SupabaseDataStore implements DataStore {
  public readonly mode = 'supabase';
  private client: SupabaseClient;

  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  private async callRpc<T>(fnName: string, args: Record<string, unknown>): Promise<T> {
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new StoreUnavailable('Database RPC timed out')),
        1500
      );
    });

    try {
      const rpcPromise = this.client.rpc(fnName, args);
      const res = (await Promise.race([rpcPromise, timeoutPromise])) as {
        data: unknown;
        error: { message?: string } | null;
      };

      if (res.error) {
        if (res.error.message?.includes('RATE_LIMITED')) {
          throw new RateLimited(60);
        }
        throw new StoreError(res.error.message || `RPC ${fnName} failed`);
      }

      return res.data as T;
    } catch (err: unknown) {
      if (err instanceof RateLimited || err instanceof StoreError) {
        throw err;
      }
      throw new StoreUnavailable(
        err instanceof Error ? err.message : 'Database RPC timed out or unreachable'
      );
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  public feedback: FeedbackStore = {
    submit: async (feedback: FeedbackInput, planHash: string): Promise<void> => {
      await this.callRpc('submit_feedback', {
        p_helpful: feedback.helpful,
        p_comment: feedback.comment?.trim() || null,
        p_plan_hash: planHash,
        p_locale: feedback.locale,
        p_quiet: feedback.quiet,
      });
    },

    summary: async (): Promise<FeedbackSummaryResult> => {
      try {
        const rows = await this.callRpc<Array<{ total: number; helpful: number }>>(
          'feedback_summary',
          {}
        );
        const first = rows && rows[0];
        const total = first?.total ?? 0;
        const helpful = first?.helpful ?? 0;

        if (total < 5) {
          return { available: true, total, helpfulPct: null };
        }
        const helpfulPct = Math.round((helpful / total) * 100);
        return { available: true, total, helpfulPct };
      } catch {
        return { available: false, total: 0, helpfulPct: null };
      }
    },
  };

  public shortPlans: ShortPlanStore = {
    create: async (code: string, payload: ShortPlanPayload): Promise<boolean> => {
      const inserted = await this.callRpc<boolean>('create_short_plan', {
        p_code: code,
        p_payload: payload,
      });
      return !!inserted;
    },

    get: async (code: string): Promise<ShortPlanPayload | null> => {
      const data = await this.callRpc<ShortPlanPayload | null>('get_short_plan', {
        p_code: code,
      });
      return data ?? null;
    },
  };

  public favourites: FavouriteStore = {
    counts: async (): Promise<Record<string, number>> => {
      try {
        const rows = await this.callRpc<Array<{ slug: string; count: number }>>(
          'favourite_counts',
          {}
        );
        const result: Record<string, number> = {};
        for (const row of rows || []) {
          result[row.slug] = row.count;
        }
        return result;
      } catch {
        return {};
      }
    },

    adjust: async (slug: string, delta: 1 | -1): Promise<number> => {
      return await this.callRpc<number>('favourite_adjust', {
        p_slug: slug,
        p_delta: delta,
      });
    },
  };

  public rateLimit: StoreRateLimiter = {
    take: async (
      bucket: string,
      keyHash: string,
      limit: number,
      windowSeconds: number
    ): Promise<boolean> => {
      try {
        const allowed = await this.callRpc<boolean>('take_token', {
          p_bucket: bucket,
          p_key_hash: keyHash,
          p_limit: limit,
          p_window_seconds: windowSeconds,
        });
        return !!allowed;
      } catch {
        // If limiter is down, permit access so we don't block innocent visitors
        return true;
      }
    },
  };

  public async ping(): Promise<boolean> {
    try {
      const ok = await this.callRpc<boolean>('ping', {});
      return !!ok;
    } catch {
      return false;
    }
  }
}
