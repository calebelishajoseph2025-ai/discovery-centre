export const EXHIBIT_ACCENTS = [
  'lantern',
  'ember',
  'dusk-rose',
  'verdigris',
  'moss',
] as const;

export type ExhibitAccent = (typeof EXHIBIT_ACCENTS)[number];

const HEX_TO_ACCENT: Record<string, ExhibitAccent> = {
  '#F5A623': 'lantern',
  '#F2B45C': 'lantern',
  '#E2572B': 'ember',
  '#D46A3A': 'ember',
  '#5B4BDB': 'dusk-rose',
  '#C9849A': 'dusk-rose',
  '#0E9F8E': 'verdigris',
  '#3D9B8A': 'verdigris',
  '#3E9B4F': 'moss',
  '#6F8F4E': 'moss',
};

const SLUG_TO_ACCENT: Record<string, ExhibitAccent> = {
  'light-lab': 'lantern',
  'build-bench': 'ember',
  'sky-room': 'dusk-rose',
  'echo-tunnel': 'verdigris',
  'garden-trail': 'moss',
};

export function resolveAccent(
  token: string | undefined,
  slug?: string
): ExhibitAccent {
  if (token && (EXHIBIT_ACCENTS as readonly string[]).includes(token)) {
    return token as ExhibitAccent;
  }
  if (token) {
    const mapped = HEX_TO_ACCENT[token] ?? HEX_TO_ACCENT[token.toUpperCase()];
    if (mapped) return mapped;
  }
  if (slug && SLUG_TO_ACCENT[slug]) return SLUG_TO_ACCENT[slug];
  return 'lantern';
}

export function accentVar(token: string | undefined, slug?: string): string {
  return `var(--${resolveAccent(token, slug)})`;
}
