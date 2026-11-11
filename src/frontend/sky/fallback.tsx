import { cx } from '../design/cx.ts';

interface CssStarFieldProps {
  className?: string;
  label: string;
}

export function CssStarField({ className, label }: CssStarFieldProps) {
  return (
    <div
      data-sky="css"
      role="img"
      aria-label={label}
      className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity: 'var(--sky-opacity)' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--lantern)_10%,transparent),transparent_55%)]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(1px 1px at 8% 18%, color-mix(in srgb, var(--text) 70%, transparent) 50%, transparent 51%)',
            'radial-gradient(1.5px 1.5px at 22% 42%, color-mix(in srgb, var(--lantern) 80%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 36% 12%, color-mix(in srgb, var(--text) 55%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 48% 28%, color-mix(in srgb, var(--text-muted) 80%, transparent) 50%, transparent 51%)',
            'radial-gradient(2px 2px at 61% 16%, color-mix(in srgb, var(--lantern) 70%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 74% 38%, color-mix(in srgb, var(--text) 60%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 86% 22%, color-mix(in srgb, var(--text-muted) 90%, transparent) 50%, transparent 51%)',
            'radial-gradient(1.5px 1.5px at 12% 62%, color-mix(in srgb, var(--text) 50%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 29% 78%, color-mix(in srgb, var(--text-muted) 70%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 55% 70%, color-mix(in srgb, var(--lantern) 55%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 68% 58%, color-mix(in srgb, var(--text) 45%, transparent) 50%, transparent 51%)',
            'radial-gradient(2px 2px at 91% 66%, color-mix(in srgb, var(--text) 65%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 42% 88%, color-mix(in srgb, var(--text-muted) 60%, transparent) 50%, transparent 51%)',
            'radial-gradient(1px 1px at 78% 82%, color-mix(in srgb, var(--text) 40%, transparent) 50%, transparent 51%)',
          ].join(','),
          backgroundSize: '100% 100%',
        }}
      />
    </div>
  );
}
