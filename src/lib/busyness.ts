/**
 * Busyness calculation and best-arrival recommender.
 * Pure and deterministic.
 */

import {
  BUSYNESS_MATRIX,
  getBusynessCategory,
  getCategoryLabel,
  DayBusyness,
  getAllOpenDaysBusyness,
} from '../content/busyness.ts';
import { timeStringToMinutes, minutesToTimeString } from './plan-engine.ts';

export interface BestArrivalOption {
  arrival: string; // "10:00"
  departure: string; // "11:30"
  avgBusyness: number;
  label: string;
}

export interface BestArrivalSuccess {
  open: true;
  arrival: string;
  departure: string;
  avgBusyness: number;
  label: string;
  alternatives: BestArrivalOption[];
  dayName: string;
  reason: string;
}

export interface BestArrivalClosed {
  open: false;
  nextOpenDay: string;
  suggestedArrival: string;
  reason: string;
}

export type BestArrivalResult = BestArrivalSuccess | BestArrivalClosed;

export function busynessAt(dayOfWeek: number, hour: number): number | null {
  const scores = BUSYNESS_MATRIX[dayOfWeek];
  if (!scores) return null; // Closed (e.g. Monday)
  if (hour < 10 || hour > 16) return null;
  const idx = hour - 10;
  return scores[idx] ?? null;
}

export function heatmap(): DayBusyness[] {
  return getAllOpenDaysBusyness();
}

/**
 * Calculates the exact minute-weighted average busyness score
 * across a visit window from arrival to departure.
 */
export function calculateWindowBusyness(
  dayOfWeek: number,
  startMinute: number, // minutes from 00:00
  durationMinutes: number
): number | null {
  const scores = BUSYNESS_MATRIX[dayOfWeek];
  if (!scores) return null;

  let totalWeightedScore = 0;
  let totalMinutesCalculated = 0;

  for (let m = startMinute; m < startMinute + durationMinutes; m++) {
    const hour = Math.floor(m / 60);
    if (hour < 10 || hour > 16) return null;
    const score = scores[hour - 10];
    totalWeightedScore += score;
    totalMinutesCalculated++;
  }

  if (totalMinutesCalculated === 0) return null;
  return Math.round((totalWeightedScore / totalMinutesCalculated) * 10) / 10;
}

/**
 * Recommends the best arrival time for a specific day and duration.
 */
export function bestArrival(options: {
  dayOfWeek: number;
  durationMinutes: number;
}): BestArrivalResult {
  const { dayOfWeek, durationMinutes } = options;

  if (dayOfWeek === 1) {
    // Monday is closed
    return {
      open: false,
      nextOpenDay: 'Tuesday',
      suggestedArrival: '10:00',
      reason: 'The Discovery Centre is closed on Mondays. We recommend visiting Tuesday at 10:00 a.m. for the quietest experience.',
    };
  }

  const openMinutes = timeStringToMinutes('10:00'); // 600
  const closeMinutes = timeStringToMinutes('17:00'); // 1020

  const candidates: BestArrivalOption[] = [];

  // Candidate arrivals every 15 minutes from 10:00 while arrival + duration <= 17:00
  for (
    let start = openMinutes;
    start + durationMinutes <= closeMinutes;
    start += 15
  ) {
    const avgScore = calculateWindowBusyness(dayOfWeek, start, durationMinutes);
    if (avgScore !== null) {
      const cat = getBusynessCategory(avgScore);
      candidates.push({
        arrival: minutesToTimeString(start),
        departure: minutesToTimeString(start + durationMinutes),
        avgBusyness: avgScore,
        label: getCategoryLabel(cat).en,
      });
    }
  }

  if (candidates.length === 0) {
    // If visit duration is longer than the entire opening window
    return {
      open: true,
      arrival: '10:00',
      departure: '17:00',
      avgBusyness: 50,
      label: 'Moderate',
      alternatives: [],
      dayName: getDayName(dayOfWeek),
      reason: 'Arrive right at 10:00 a.m. opening to maximize your visit time.',
    };
  }

  // Pick minimum score; ties broken by earliest arrival
  candidates.sort((a, b) => {
    if (a.avgBusyness !== b.avgBusyness) {
      return a.avgBusyness - b.avgBusyness;
    }
    return timeStringToMinutes(a.arrival) - timeStringToMinutes(b.arrival);
  });

  const best = candidates[0];
  const alternatives = candidates.slice(1, 3);

  const dayName = getDayName(dayOfWeek);
  const reason = `${dayName} at ${best.arrival} is forecasted to be the calmest window (average busy-ness: ${best.avgBusyness}/100, ${best.label}).`;

  return {
    open: true,
    arrival: best.arrival,
    departure: best.departure,
    avgBusyness: best.avgBusyness,
    label: best.label,
    alternatives,
    dayName,
    reason,
  };
}

function getDayName(dayOfWeek: number): string {
  const names = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return names[dayOfWeek] ?? 'Selected Day';
}
