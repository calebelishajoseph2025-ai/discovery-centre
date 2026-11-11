/**
 * Pure 0/1 Knapsack Visit Planning Engine for Northside Discovery Centre.
 * Framework-free, pure TypeScript.
 * Enforces §2: scoring, DP knapsack, greedy comparison, timeline ordering,
 * quiet-mode calm-first priority, closing cutoff, structured explainability.
 */

import { EXHIBITS, Exhibit, ExhibitSlug } from '../content/exhibits.ts';
import { PlanInput } from './schemas.ts';

export const BUFFER_MINUTES = 5;
export const OPEN_TIME = '10:00';
export const CLOSE_TIME = '17:00';

export type ReasonCode =
  | 'MATCHES_INTEREST'
  | 'FAMILY_FRIENDLY'
  | 'CALM_PICK'
  | 'FILLER_STOP'
  | 'SURPRISE_FALLBACK';

export interface Reason {
  code: ReasonCode;
  params?: Record<string, string | number>;
}

export type WarningCode =
  | 'TIME_TOO_SHORT'
  | 'NO_INTEREST_MATCH'
  | 'TRIMMED_FOR_CLOSING'
  | 'LATE_ARRIVAL'
  | 'LOUD_STOP_IN_QUIET_MODE';

export interface Warning {
  code: WarningCode;
  params?: Record<string, string | number>;
}

export interface PlanStop {
  slug: ExhibitSlug;
  name: string;
  start: string; // HH:mm
  end: string; // HH:mm
  durationMinutes: number;
  calm: boolean;
  accentToken: string;
  reasons: Reason[];
}

export interface ConsideredExhibit {
  slug: ExhibitSlug;
  name: string;
  durationMinutes: number;
  score: number;
  matched: string[];
  bonuses: {
    family: number;
    calm: number;
  };
  chosen: boolean;
  droppedReason?: 'EXCEEDS_TIME' | 'BETTER_COMBINATION' | 'TRIMMED_FOR_CLOSING';
}

export interface PlanExplain {
  considered: ConsideredExhibit[];
  capacityMinutes: number;
  usedMinutes: number;
  totalScore: number;
  greedyScore: number;
}

export interface Plan {
  stops: PlanStop[];
  totalMinutes: number; // sum of stop durations + buffers
  spareMinutes: number; // input.timeMinutes - totalMinutes
  estimatedCostINR: number;
  warnings: Warning[];
  arrival: string;
  quiet: boolean;
  explain: PlanExplain;
}

// Convert "HH:mm" to minutes from 00:00
export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map((s) => parseInt(s, 10));
  return h * 60 + m;
}

// Convert minutes from 00:00 to "HH:mm"
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface ScoredExhibit {
  exhibit: Exhibit;
  score: number;
  matchedInterests: string[];
  familyBonus: number;
  quietBonus: number;
  reasons: Reason[];
}

/**
 * Calculate the score for an exhibit based on user input.
 * score = 10 × matchingInterests + 2 × familyBonus + 4 × quietBonus + 1
 */
export function scoreExhibit(
  exhibit: Exhibit,
  input: PlanInput
): ScoredExhibit {
  const selectedInterests = input.interests || [];
  const matchedInterests = exhibit.interests.filter((i) =>
    selectedInterests.includes(i)
  );

  const hasChildren = (input.children ?? 0) > 0;
  const isFamilyFriendly = exhibit.interests.includes('family');
  const familyBonus = hasChildren && isFamilyFriendly ? 1 : 0;

  const quietBonus = input.quiet && exhibit.calm ? 1 : 0;

  const score =
    10 * matchedInterests.length +
    2 * familyBonus +
    4 * quietBonus +
    1; // Base 1 point

  const reasons: Reason[] = [];
  if (matchedInterests.length > 0) {
    reasons.push({
      code: 'MATCHES_INTEREST',
      params: { count: matchedInterests.length, tags: matchedInterests.join(', ') },
    });
  }
  if (familyBonus > 0) {
    reasons.push({ code: 'FAMILY_FRIENDLY' });
  }
  if (quietBonus > 0) {
    reasons.push({ code: 'CALM_PICK' });
  }
  if (reasons.length === 0) {
    if (selectedInterests.length === 0) {
      reasons.push({ code: 'SURPRISE_FALLBACK' });
    } else {
      reasons.push({ code: 'FILLER_STOP' });
    }
  }

  return {
    exhibit,
    score,
    matchedInterests,
    familyBonus,
    quietBonus,
    reasons,
  };
}

/**
 * 0/1 Knapsack selection by Dynamic Programming.
 * Items: exhibits.
 * Item weight = duration + BUFFER_MINUTES
 * Total allowed weight = timeMinutes + BUFFER_MINUTES (since last buffer is not charged).
 */
export function solveKnapsack(
  candidates: ScoredExhibit[],
  availableMinutes: number
): ScoredExhibit[] {
  const n = candidates.length;
  const effectiveCapacity = availableMinutes + BUFFER_MINUTES;

  // dp[i][w] = max score using a subset of first i items with weight <= w
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(effectiveCapacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const item = candidates[i - 1];
    const itemWeight = item.exhibit.durationMinutes + BUFFER_MINUTES;
    const itemScore = item.score;

    for (let w = 0; w <= effectiveCapacity; w++) {
      if (itemWeight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - itemWeight] + itemScore);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Reconstruct chosen items
  const chosen: ScoredExhibit[] = [];
  let w = effectiveCapacity;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      const item = candidates[i - 1];
      chosen.push(item);
      w -= item.exhibit.durationMinutes + BUFFER_MINUTES;
    }
  }

  // Reverse to maintain candidate consideration order
  return chosen.reverse();
}

/**
 * Greedy by score selection for comparison.
 */
export function solveGreedy(
  candidates: ScoredExhibit[],
  availableMinutes: number
): number {
  // Sort descending by score; ties broken by shorter duration, then stable index
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.exhibit.durationMinutes - b.exhibit.durationMinutes;
  });

  let remaining = availableMinutes;
  let totalScore = 0;
  let count = 0;

  for (const item of sorted) {
    const needed =
      count === 0
        ? item.exhibit.durationMinutes
        : item.exhibit.durationMinutes + BUFFER_MINUTES;
    if (needed <= remaining) {
      remaining -= needed;
      totalScore += item.score;
      count++;
    }
  }

  return totalScore;
}

/**
 * Build a customized visit plan.
 */
export function buildPlan(
  input: PlanInput,
  exhibitsList: Exhibit[] = EXHIBITS
): Plan {
  const timeMinutes = input.timeMinutes;
  const arrivalStr = input.arrival || '10:00';
  const arrivalMinutes = timeStringToMinutes(arrivalStr);
  const closingMinutes = timeStringToMinutes(CLOSE_TIME);

  const warnings: Warning[] = [];

  // Check if arrival is late in the day
  if (arrivalMinutes >= closingMinutes - 30) {
    warnings.push({
      code: 'LATE_ARRIVAL',
      params: { arrival: arrivalStr, close: CLOSE_TIME },
    });
  }

  // Score all available exhibits
  const scoredAll: ScoredExhibit[] = exhibitsList.map((ex) =>
    scoreExhibit(ex, input)
  );

  // Check if any interests matched
  const totalMatches = scoredAll.reduce(
    (acc, cur) => acc + cur.matchedInterests.length,
    0
  );
  if (input.interests && input.interests.length > 0 && totalMatches === 0) {
    warnings.push({ code: 'NO_INTEREST_MATCH' });
  }

  // Find shortest exhibit duration
  const minDuration = Math.min(...exhibitsList.map((e) => e.durationMinutes));
  if (timeMinutes < minDuration) {
    warnings.push({
      code: 'TIME_TOO_SHORT',
      params: { min: minDuration, requested: timeMinutes },
    });
  }

  // Solve with 0/1 knapsack
  let chosen = solveKnapsack(scoredAll, timeMinutes);

  // Compare with greedy by score
  const greedyScore = solveGreedy(scoredAll, timeMinutes);

  // Order chosen exhibits:
  // Default: by zone route order (Zone A, B, C, D, E), calm items last.
  // When input.quiet is true: CALM items first, then by zone route order.
  chosen.sort((a, b) => {
    if (input.quiet) {
      if (a.exhibit.calm && !b.exhibit.calm) return -1;
      if (!a.exhibit.calm && b.exhibit.calm) return 1;
    } else {
      if (a.exhibit.calm && !b.exhibit.calm) return 1;
      if (!a.exhibit.calm && b.exhibit.calm) return -1;
    }
    return a.exhibit.zone.localeCompare(b.exhibit.zone);
  });

  // Schedule timeline from arrival
  let currentStart = arrivalMinutes;
  const scheduledStops: PlanStop[] = [];
  const trimmedDueToClosing: ScoredExhibit[] = [];

  for (let i = 0; i < chosen.length; i++) {
    const item = chosen[i];
    const duration = item.exhibit.durationMinutes;
    const endMinutes = currentStart + duration;

    // Check if end exceeds closing time (17:00)
    if (endMinutes > closingMinutes) {
      trimmedDueToClosing.push(item);
      continue;
    }

    scheduledStops.push({
      slug: item.exhibit.slug,
      name: item.exhibit.name.en,
      start: minutesToTimeString(currentStart),
      end: minutesToTimeString(endMinutes),
      durationMinutes: duration,
      calm: item.exhibit.calm,
      accentToken: item.exhibit.accentToken,
      reasons: item.reasons,
    });

    currentStart = endMinutes + BUFFER_MINUTES;
  }

  if (trimmedDueToClosing.length > 0) {
    warnings.push({
      code: 'TRIMMED_FOR_CLOSING',
      params: { count: trimmedDueToClosing.length, close: CLOSE_TIME },
    });
  }

  // Check if quiet mode includes loud exhibits (e.g. Echo Tunnel)
  if (input.quiet) {
    const hasLoud = scheduledStops.some((s) => !s.calm);
    if (hasLoud) {
      warnings.push({ code: 'LOUD_STOP_IN_QUIET_MODE' });
    }
  }

  // Calculate used and spare minutes
  const totalExhibitMinutes = scheduledStops.reduce(
    (acc, cur) => acc + cur.durationMinutes,
    0
  );
  const totalBufferMinutes =
    scheduledStops.length > 1 ? (scheduledStops.length - 1) * BUFFER_MINUTES : 0;
  const totalMinutes = totalExhibitMinutes + totalBufferMinutes;
  const spareMinutes = Math.max(0, timeMinutes - totalMinutes);

  // Ticket estimate
  const adults = input.adults ?? 1;
  const children = input.children ?? 0;
  const estimatedCostINR = adults * 100 + children * 50;

  // Build ConsideredExhibit explanation for every exhibit
  const scheduledSlugs = new Set(scheduledStops.map((s) => s.slug));
  const trimmedSlugs = new Set(trimmedDueToClosing.map((s) => s.exhibit.slug));

  // Sort considered in score order (descending), ties by shorter duration
  const sortedConsidered = [...scoredAll].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.exhibit.durationMinutes - b.exhibit.durationMinutes;
  });

  const considered: ConsideredExhibit[] = sortedConsidered.map((item) => {
    const slug = item.exhibit.slug;
    const isChosen = scheduledSlugs.has(slug);
    let droppedReason:
      | 'EXCEEDS_TIME'
      | 'BETTER_COMBINATION'
      | 'TRIMMED_FOR_CLOSING'
      | undefined;

    if (!isChosen) {
      if (trimmedSlugs.has(slug)) {
        droppedReason = 'TRIMMED_FOR_CLOSING';
      } else if (item.exhibit.durationMinutes > timeMinutes) {
        droppedReason = 'EXCEEDS_TIME';
      } else {
        droppedReason = 'BETTER_COMBINATION';
      }
    }

    return {
      slug,
      name: item.exhibit.name.en,
      durationMinutes: item.exhibit.durationMinutes,
      score: item.score,
      matched: item.matchedInterests,
      bonuses: {
        family: item.familyBonus * 2,
        calm: item.quietBonus * 4,
      },
      chosen: isChosen,
      droppedReason,
    };
  });

  const totalScore = considered
    .filter((c) => c.chosen)
    .reduce((acc, cur) => acc + cur.score, 0);

  const explain: PlanExplain = {
    considered,
    capacityMinutes: timeMinutes,
    usedMinutes: totalMinutes,
    totalScore,
    greedyScore,
  };

  return {
    stops: scheduledStops,
    totalMinutes,
    spareMinutes,
    estimatedCostINR,
    warnings,
    arrival: arrivalStr,
    quiet: !!input.quiet,
    explain,
  };
}
