/**
 * Graceful degradation store adapter (Mode A).
 * Active when Supabase is not configured or store is explicitly disabled.
 * Never throws uncaught errors that would break page renders.
 */

import {
  DataStore,
  FeedbackStore,
  FeedbackSummaryResult,
  ShortPlanStore,
  FavouriteStore,
  StoreRateLimiter,
} from './types.ts';
import { StoreUnavailable } from './errors.ts';

export class OffDataStore implements DataStore {
  public readonly mode = 'off';

  public feedback: FeedbackStore = {
    submit: async (): Promise<void> => {
      throw new StoreUnavailable('off');
    },
    summary: async (): Promise<FeedbackSummaryResult> => {
      return { available: false, total: 0, helpfulPct: null };
    },
  };

  public shortPlans: ShortPlanStore = {
    create: async (): Promise<boolean> => {
      throw new StoreUnavailable('off');
    },
    get: async (): Promise<null> => {
      return null;
    },
  };

  public favourites: FavouriteStore = {
    counts: async (): Promise<Record<string, number>> => {
      // In off mode, return empty or baseline so page renders cleanly without layout shift
      return {};
    },
    adjust: async (): Promise<number> => {
      throw new StoreUnavailable('off');
    },
  };

  public rateLimit: StoreRateLimiter = {
    take: async (): Promise<boolean> => {
      return true; // Pass through in off mode
    },
  };

  public async ping(): Promise<boolean> {
    return false;
  }
}
