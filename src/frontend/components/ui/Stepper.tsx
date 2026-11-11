import { Minus, Plus } from 'lucide-react';
import { cx } from '../../design/cx.ts';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  decreaseLabel,
  increaseLabel,
}: StepperProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-hairline bg-surface-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm leading-snug text-text">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="touch-target grid place-items-center rounded-sm text-text hover:bg-surface-2"
          aria-label={decreaseLabel}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <span className={cx('tabular w-8 text-center text-sm')} aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className="touch-target grid place-items-center rounded-sm text-text hover:bg-surface-2"
          aria-label={increaseLabel}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
