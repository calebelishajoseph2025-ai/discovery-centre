import { FeedbackSummaryResult } from '../../store/types.ts';

export type SocialProofView =
  | { kind: 'hidden' }
  | { kind: 'kofn'; k: number; n: number }
  | { kind: 'pct'; pct: number; n: number };

export function helpfulCountFromSummary(
  summary: Pick<FeedbackSummaryResult, 'total' | 'helpfulPct'>
): number | null {
  if (summary.helpfulPct === null || summary.total <= 0) return null;
  return Math.round((summary.helpfulPct / 100) * summary.total);
}

export function socialProofView(
  summary: FeedbackSummaryResult | null | undefined
): SocialProofView {
  if (!summary || !summary.available || summary.total <= 0) {
    return { kind: 'hidden' };
  }
  if (summary.helpfulPct === null) {
    return { kind: 'hidden' };
  }
  const k = helpfulCountFromSummary(summary);
  if (k === null) return { kind: 'hidden' };
  if (summary.total < 20) {
    return { kind: 'kofn', k, n: summary.total };
  }
  return { kind: 'pct', pct: summary.helpfulPct, n: summary.total };
}
