import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select
        className="h-11 w-full appearance-none truncate rounded-xl border border-warm-border/70 bg-surface pr-10 pl-4 text-sm text-charcoal focus:border-savanna-green"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-charcoal-muted"
        aria-hidden="true"
      />
    </div>
  );
}
