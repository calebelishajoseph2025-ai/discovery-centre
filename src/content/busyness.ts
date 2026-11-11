/**
 * Busyness model for Northside Discovery Centre (fictional deterministic dataset).
 * 7 days (0=Sunday to 6=Saturday) × 7 hourly slots (10:00 to 16:00).
 * Monday is closed (null).
 * Tuesday 10:00-11:00 is the global minimum (quietest).
 * Sunday 12:00-14:00 is the global maximum (peak).
 * Weekdays are quieter than weekends.
 *
 * Thresholds:
 *   < 35: Quiet
 *   35 - 69: Moderate
 *   >= 70: Busy
 */

import { LocalizedText } from './centre.ts';

export type BusynessCategory = 'quiet' | 'moderate' | 'busy';

export interface BusynessCell {
  hour: number; // 10 to 16
  slotLabel: string; // "10:00 - 11:00"
  score: number; // 0 to 100
  category: BusynessCategory;
  label: LocalizedText;
}

export interface DayBusyness {
  dayOfWeek: number; // 0=Sunday .. 6=Saturday
  dayName: LocalizedText;
  open: boolean;
  slots: BusynessCell[] | null;
}

export const HOURLY_SLOTS = [10, 11, 12, 13, 14, 15, 16];

export function getBusynessCategory(score: number): BusynessCategory {
  if (score < 35) return 'quiet';
  if (score < 70) return 'moderate';
  return 'busy';
}

export function getCategoryLabel(category: BusynessCategory): LocalizedText {
  switch (category) {
    case 'quiet':
      return { en: 'Quiet', ta: 'அமைதியானது' };
    case 'moderate':
      return { en: 'Moderate', ta: 'மிதமானது' };
    case 'busy':
      return { en: 'Busy', ta: 'பரபரப்பானது' };
  }
}

/**
 * Deterministic matrix:
 * Sun (0): Weekend peak, 12-14 is max 88-92
 * Mon (1): Closed -> null
 * Tue (2): Weekday quiet, 10:00 is min 18
 * Wed (3): Weekday moderate-quiet
 * Thu (4): Weekday moderate
 * Fri (5): Friday afternoon picks up
 * Sat (6): Busy weekend, peak ~84
 */
export const BUSYNESS_MATRIX: Record<number, number[] | null> = {
  // Sun: 10h=55, 11h=74, 12h=92 (PEAK MAX), 13h=90, 14h=78, 15h=65, 16h=48
  0: [55, 74, 92, 90, 78, 65, 48],
  // Mon: Closed
  1: null,
  // Tue: 10h=18 (GLOBAL MIN), 11h=24, 12h=36, 13h=32, 14h=30, 15h=28, 16h=22
  2: [18, 24, 36, 32, 30, 28, 22],
  // Wed: 10h=22, 11h=28, 12h=40, 13h=38, 14h=34, 15h=30, 16h=25
  3: [22, 28, 40, 38, 34, 30, 25],
  // Thu: 10h=25, 11h=32, 12h=44, 13h=42, 14h=38, 15h=34, 16h=28
  4: [25, 32, 44, 42, 38, 34, 28],
  // Fri: 10h=28, 11h=38, 12h=52, 13h=54, 14h=49, 15h=45, 16h=38
  5: [28, 38, 52, 54, 49, 45, 38],
  // Sat: 10h=50, 11h=68, 12h=84, 13h=82, 14h=75, 15h=62, 16h=45
  6: [50, 68, 84, 82, 75, 62, 45],
};

const DAY_NAMES: Record<number, LocalizedText> = {
  0: { en: 'Sunday', ta: 'ஞாயிறு' },
  1: { en: 'Monday', ta: 'திங்கள்' },
  2: { en: 'Tuesday', ta: 'செவ்வாய்' },
  3: { en: 'Wednesday', ta: 'புதன்' },
  4: { en: 'Thursday', ta: 'வியாழன்' },
  5: { en: 'Friday', ta: 'வெள்ளி' },
  6: { en: 'Saturday', ta: 'சனி' },
};

export function getDayBusyness(dayOfWeek: number): DayBusyness {
  const scores = BUSYNESS_MATRIX[dayOfWeek];
  const dayName = DAY_NAMES[dayOfWeek];

  if (!scores) {
    return {
      dayOfWeek,
      dayName,
      open: false,
      slots: null,
    };
  }

  const slots: BusynessCell[] = scores.map((score, idx) => {
    const hour = HOURLY_SLOTS[idx];
    const cat = getBusynessCategory(score);
    return {
      hour,
      slotLabel: `${hour}:00 – ${hour + 1}:00`,
      score,
      category: cat,
      label: getCategoryLabel(cat),
    };
  });

  return {
    dayOfWeek,
    dayName,
    open: true,
    slots,
  };
}

export function getAllOpenDaysBusyness(): DayBusyness[] {
  // Open days: Tuesday (2) through Sunday (0)
  return [2, 3, 4, 5, 6, 0].map(getDayBusyness);
}
