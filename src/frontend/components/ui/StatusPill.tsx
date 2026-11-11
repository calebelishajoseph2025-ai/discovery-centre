import { cx } from '../../design/cx.ts';

interface StatusPillProps {
  open: boolean;
  message: string;
  openLabel: string;
  closedLabel: string;
}

export function StatusPill({ open, message, openLabel, closedLabel }: StatusPillProps) {
  return (
    <span
      className={cx(
        'inline-flex max-w-[11rem] items-center gap-2 truncate rounded-full border px-3 py-1 text-xs font-semibold',
        open ? 'border-moss text-moss' : 'border-hairline text-text-muted'
      )}
      title={message}
    >
      <span
        className={cx('h-1.5 w-1.5 rounded-full', open ? 'bg-moss' : 'bg-text-muted')}
        aria-hidden="true"
      />
      {open ? openLabel : closedLabel}
    </span>
  );
}
