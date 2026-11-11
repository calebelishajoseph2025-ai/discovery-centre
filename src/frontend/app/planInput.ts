import { EXHIBITS } from '../../content/exhibits.ts';
import { PlanInput } from '../../lib/schemas.ts';
import { planIdentity } from './savedPlans.ts';

export const DEFAULT_PLAN_INPUT: PlanInput = {
  timeMinutes: 90,
  interests: [],
  adults: 2,
  children: 0,
  stepFree: false,
  arrival: '10:00',
  quiet: false,
};

export function interestsFromFavorites(slugs: string[]): string[] {
  const tags = new Set<string>();
  for (const slug of slugs) {
    const exhibit = EXHIBITS.find((item) => item.slug === slug);
    if (!exhibit) continue;
    for (const tag of exhibit.interests) tags.add(tag);
  }
  return [...tags].sort();
}

export function composePlanInput(
  initial: Partial<PlanInput> | undefined,
  quiet: boolean,
  favoriteSlugs: string[] = []
): PlanInput {
  const seeded = interestsFromFavorites(favoriteSlugs);
  return {
    ...DEFAULT_PLAN_INPUT,
    interests: seeded,
    ...initial,
    quiet: initial?.quiet ?? quiet,
  };
}

export function planSourceKey(input: Partial<PlanInput>): string {
  return planIdentity({
    ...DEFAULT_PLAN_INPUT,
    ...input,
    quiet: input.quiet ?? false,
  });
}
