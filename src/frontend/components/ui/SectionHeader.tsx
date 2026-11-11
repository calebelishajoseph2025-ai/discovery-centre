interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  index?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, index }: SectionHeaderProps) {
  return (
    <header className="mb-10 max-w-2xl">
      <div className="mb-3 flex items-center gap-3">
        {index ? (
          <span className="tabular text-xs text-lantern" aria-hidden="true">
            {index}
          </span>
        ) : null}
        <p className="small-caps">{eyebrow}</p>
      </div>
      <h2 className="font-display text-3xl leading-snug sm:text-4xl md:text-5xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-text-muted">{subtitle}</p> : null}
    </header>
  );
}
