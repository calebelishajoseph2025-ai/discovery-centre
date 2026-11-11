/**
 * Canonical plan share codec.
 * Encodes PlanInput into a normalized, deterministic URL query string.
 * Decodes and validates query parameters back into PlanInput.
 */

import { PlanInput, PlanInputSchema } from './schemas.ts';

export function encodePlanInput(input: PlanInput): URLSearchParams {
  const params = new URLSearchParams();

  // Canonical key order:
  // 1. time
  // 2. interests (sorted alphabetically)
  // 3. adults
  // 4. children (omitted if 0)
  // 5. stepFree (omitted if false)
  // 6. arrival (omitted if "10:00")
  // 7. date (omitted if empty)
  // 8. quiet (omitted if false)

  params.set('time', String(input.timeMinutes));

  if (input.interests && input.interests.length > 0) {
    const sorted = [...input.interests].sort();
    params.set('interests', sorted.join(','));
  }

  params.set('adults', String(input.adults ?? 1));

  if (input.children && input.children > 0) {
    params.set('children', String(input.children));
  }

  if (input.stepFree) {
    params.set('stepFree', '1');
  }

  if (input.arrival && input.arrival !== '10:00') {
    params.set('arrival', input.arrival);
  }

  if (input.date) {
    params.set('date', input.date);
  }

  if (input.quiet) {
    params.set('quiet', '1');
  }

  return params;
}

export interface DecodeResult {
  success: boolean;
  data?: PlanInput;
  errors?: string[];
}

export function decodePlanInput(
  raw: URLSearchParams | Record<string, string | string[] | undefined>
): DecodeResult {
  const getParam = (key: string): string | undefined => {
    if (raw instanceof URLSearchParams) {
      return raw.get(key) || undefined;
    }
    const val = raw[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const timeRaw = getParam('time') || getParam('timeMinutes');
  const interestsRaw = getParam('interests');
  const adultsRaw = getParam('adults');
  const childrenRaw = getParam('children');
  const stepFreeRaw = getParam('stepFree');
  const arrivalRaw = getParam('arrival');
  const dateRaw = getParam('date');
  const quietRaw = getParam('quiet');

  const errors: string[] = [];

  const timeMinutes = timeRaw ? parseInt(timeRaw, 10) : 60;
  if (isNaN(timeMinutes) || timeMinutes < 20 || timeMinutes > 300) {
    errors.push('time must be an integer between 20 and 300 minutes');
  }

  const interests = interestsRaw
    ? interestsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const adults = adultsRaw ? parseInt(adultsRaw, 10) : 1;
  if (isNaN(adults) || adults < 1 || adults > 10) {
    errors.push('adults must be an integer between 1 and 10');
  }

  const children = childrenRaw ? parseInt(childrenRaw, 10) : 0;
  if (isNaN(children) || children < 0 || children > 10) {
    errors.push('children must be an integer between 0 and 10');
  }

  const stepFree = stepFreeRaw === '1' || stepFreeRaw === 'true';
  const quiet = quietRaw === '1' || quietRaw === 'true';
  const arrival = arrivalRaw || '10:00';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(arrival)) {
    errors.push('arrival must be in HH:mm format');
  }

  let date: string | undefined = undefined;
  if (dateRaw) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
      date = dateRaw;
    } else {
      errors.push('date must be in YYYY-MM-DD format');
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const parsed = PlanInputSchema.safeParse({
    timeMinutes,
    interests,
    adults,
    children,
    stepFree,
    arrival,
    date,
    quiet,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }

  return { success: true, data: parsed.data };
}
