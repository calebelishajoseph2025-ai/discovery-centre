import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../design/cx.ts';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-lantern text-on-accent hover:brightness-110 shadow-[0_10px_30px_color-mix(in_srgb,var(--lantern)_28%,transparent)]',
  secondary:
    'bg-transparent text-text border border-hairline hover:border-lantern hover:text-lantern',
  ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface-2',
};

export function Button({
  variant = 'primary',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold tracking-wide transition-[filter,background-color,color,border-color] duration-200 touch-target',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
