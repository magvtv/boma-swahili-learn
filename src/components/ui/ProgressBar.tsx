import { cn } from '../../utils/cn';

type ProgressTone = 'green' | 'terracotta' | 'ochre';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  tone?: ProgressTone;
  className?: string;
}

const TONE_FILL: Record<ProgressTone, string> = {
  green: 'bg-savanna-green',
  terracotta: 'bg-terracotta',
  ochre: 'bg-ochre',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  tone = 'green',
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.max(0, Math.min(value, safeMax));
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn('space-y-2.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between gap-2 text-xs">
          {label ? <span className="text-charcoal-muted">{label}</span> : <span />}
          {showPercentage && (
            <span className="tabular-nums text-charcoal-muted">{percent}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ?? 'Progress'}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className="h-1 w-full overflow-hidden rounded-full bg-cream-dark"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-200 ease-out',
            TONE_FILL[tone],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
