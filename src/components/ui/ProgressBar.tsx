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
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between gap-2 text-xs font-medium">
          {label ? <span className="text-charcoal">{label}</span> : <span />}
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
        className="h-2.5 w-full overflow-hidden rounded-full bg-cream-dark"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            TONE_FILL[tone],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
