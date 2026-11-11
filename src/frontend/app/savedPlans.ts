import { PlanInput, PlanInputSchema } from '../../lib/schemas.ts';

export const SAVED_PLANS_KEY = 'ndc:plans:v1';
export const SAVED_PLANS_CAP = 5;

export interface SavedPlan {
  id: string;
  savedAt: string;
  input: PlanInput;
  title: string;
}

export interface PlanStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export function planIdentity(input: PlanInput): string {
  const interests = [...(input.interests ?? [])].sort().join(',');
  return [
    input.timeMinutes,
    interests,
    input.adults ?? 1,
    input.children ?? 0,
    input.stepFree ? '1' : '0',
    input.arrival ?? '10:00',
    input.date ?? '',
    input.quiet ? '1' : '0',
  ].join('|');
}

export function readSavedPlans(storage: PlanStorage | null): SavedPlan[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(SAVED_PLANS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const plans: SavedPlan[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const parsedInput = PlanInputSchema.safeParse(rec.input);
      if (!parsedInput.success) continue;
      plans.push({
        id: typeof rec.id === 'string' ? rec.id : planIdentity(parsedInput.data),
        savedAt: typeof rec.savedAt === 'string' ? rec.savedAt : new Date().toISOString(),
        input: parsedInput.data,
        title: typeof rec.title === 'string' ? rec.title : defaultPlanTitle(parsedInput.data),
      });
    }
    return plans.slice(0, SAVED_PLANS_CAP);
  } catch {
    return [];
  }
}

export function defaultPlanTitle(input: PlanInput): string {
  const mins = input.timeMinutes;
  const interests = input.interests?.length ? input.interests.join(', ') : 'open discovery';
  return `${mins} min · ${interests}`;
}

export function upsertSavedPlan(
  existing: SavedPlan[],
  input: PlanInput,
  now: string = new Date().toISOString()
): SavedPlan[] {
  const id = planIdentity(input);
  const next: SavedPlan = {
    id,
    savedAt: now,
    input,
    title: defaultPlanTitle(input),
  };
  const without = existing.filter((p) => p.id !== id);
  return [next, ...without].slice(0, SAVED_PLANS_CAP);
}

export function removeSavedPlan(existing: SavedPlan[], id: string): SavedPlan[] {
  return existing.filter((p) => p.id !== id);
}

export function writeSavedPlans(
  storage: PlanStorage | null,
  plans: SavedPlan[]
): void {
  try {
    storage?.setItem(SAVED_PLANS_KEY, JSON.stringify(plans.slice(0, SAVED_PLANS_CAP)));
  } catch {
    // Storage may be unavailable.
  }
}

export function isPlanSaved(plans: SavedPlan[], input: PlanInput): boolean {
  const id = planIdentity(input);
  return plans.some((p) => p.id === id);
}
