import { ButtonHTMLAttributes } from 'react';
import { cx } from '../../design/cx.ts';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'rounded-full border px-3.5 py-2 text-start text-sm font-medium leading-snug touch-target transition-colors duration-200',
        selected
          ? 'border-lantern bg-lantern text-on-accent'
          : 'border-hairline bg-surface-1 text-text hover:border-lantern',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
