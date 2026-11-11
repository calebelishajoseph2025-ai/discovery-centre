import { Exhibit } from '../../../content/exhibits.ts';

export const INTEREST_FILTERS = [
  'all',
  'light',
  'building',
  'space',
  'sound',
  'nature',
  'calm',
] as const;

export type InterestFilter = (typeof INTEREST_FILTERS)[number];

export function filterExhibits(
  exhibits: Exhibit[],
  filter: InterestFilter
): Exhibit[] {
  if (filter === 'all') return exhibits;
  if (filter === 'calm') return exhibits.filter((e) => e.calm || e.interests.includes('calm'));
  return exhibits.filter((e) => e.interests.includes(filter));
}

export function filterLabelKey(filter: InterestFilter): `exhibits.filter.${InterestFilter}` {
  return `exhibits.filter.${filter}`;
}
