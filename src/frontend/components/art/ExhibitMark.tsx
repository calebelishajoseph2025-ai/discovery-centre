import { ExhibitSlug } from '../../../content/exhibits.ts';
import { accentVar } from '../../design/accent.ts';

export function ExhibitMark({ slug }: { slug: ExhibitSlug }) {
  const stroke = accentVar(undefined, slug);
  if (slug === 'light-lab') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <polygon points="32,8 56,56 8,56" fill="none" stroke={stroke} strokeWidth="1.4" />
        <path d="M32 20 v24" stroke={stroke} />
        <path d="M22 40 h20" stroke={stroke} />
      </svg>
    );
  }
  if (slug === 'build-bench') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <rect x="10" y="28" width="44" height="22" fill="none" stroke={stroke} />
        <path d="M18 28 V18 H46 V28" stroke={stroke} fill="none" />
        <circle cx="22" cy="40" r="3" fill={stroke} />
        <circle cx="42" cy="40" r="3" fill={stroke} />
      </svg>
    );
  }
  if (slug === 'sky-room') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <path d="M8 40 a24 24 0 0 1 48 0" fill="none" stroke={stroke} />
        <circle cx="32" cy="28" r="3" fill={stroke} />
        <circle cx="22" cy="34" r="1.5" fill={stroke} />
        <circle cx="44" cy="32" r="1.5" fill={stroke} />
      </svg>
    );
  }
  if (slug === 'echo-tunnel') {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
        <path d="M16 16 q16 16 0 32" fill="none" stroke={stroke} />
        <path d="M28 12 q20 20 0 40" fill="none" stroke={stroke} />
        <path d="M40 10 q24 22 0 44" fill="none" stroke={stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      <path d="M12 44 C20 28 28 28 32 16 C36 28 44 28 52 44 Z" fill="none" stroke={stroke} />
      <path d="M32 16 V48" stroke={stroke} />
    </svg>
  );
}
