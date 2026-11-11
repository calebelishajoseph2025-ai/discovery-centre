interface PipProps {
  pose: 'welcome' | 'point' | 'think' | 'celebrate' | 'rest';
  line: string;
  visible: boolean;
}

export function Pip({ pose, line, visible }: PipProps) {
  if (!visible) return null;
  const look =
    pose === 'point' ? 8 : pose === 'think' ? -6 : pose === 'celebrate' ? 0 : pose === 'rest' ? 4 : 0;
  const arm =
    pose === 'point' ? 'translate(6 -4) rotate(18)' : pose === 'celebrate' ? 'translate(0 -8)' : '';
  return (
    <figure
      data-component="guide-pip"
      className="pointer-events-none hidden lg:block"
      aria-hidden="true"
    >
      <svg viewBox="0 0 88 110" width="72" height="90" fill="none">
        <ellipse cx="44" cy="102" rx="18" ry="4" fill="currentColor" className="text-hairline" />
        <g transform={`translate(${look} 0)`}>
          <circle cx="44" cy="38" r="16" stroke="var(--lantern)" strokeWidth="1.5" />
          <circle cx="39" cy="36" r="1.6" fill="var(--text)" />
          <circle cx="49" cy="36" r="1.6" fill="var(--text)" />
          <path d="M38 44c4 3 8 3 12 0" stroke="var(--lantern)" strokeWidth="1.2" />
          <path d="M44 54v22" stroke="var(--text-muted)" strokeWidth="1.4" />
          <path d="M44 64l-14 10" stroke="var(--text-muted)" strokeWidth="1.4" />
          <g transform={arm}>
            <path d="M44 64l14 6" stroke="var(--lantern)" strokeWidth="1.4" />
          </g>
          <path d="M44 76l-8 16" stroke="var(--text-muted)" strokeWidth="1.4" />
          <path d="M44 76l8 16" stroke="var(--text-muted)" strokeWidth="1.4" />
        </g>
      </svg>
      <figcaption className="mt-2 max-w-[10rem] font-display text-sm italic text-text-muted">
        {line}
      </figcaption>
    </figure>
  );
}
