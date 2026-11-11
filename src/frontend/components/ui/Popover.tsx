import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { cx } from '../../design/cx.ts';

interface PopoverProps {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  align?: 'end' | 'start';
}

export function Popover({ label, children, icon, align = 'end' }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="touch-target inline-flex items-center gap-2 rounded-md px-2 text-sm text-text hover:bg-surface-2"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        <span className="hidden lg:inline">{label}</span>
      </button>
      {open ? (
        <div
          id={id}
          role="dialog"
          className={cx(
            'absolute top-[calc(100%+8px)] z-[80] w-[min(20rem,calc(100vw-2rem))] rounded-md border border-hairline bg-surface-1 p-4 shadow-xl',
            align === 'end' ? 'right-0' : 'left-0'
          )}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('[data-popover-close]')) {
              setOpen(false);
            }
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
