import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeTone = 'green' | 'terracotta' | 'ochre' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const TONE_STYLES: Record<BadgeTone, string> = {
  green: 'bg-savanna-green-soft text-savanna-green border-savanna-green/15',
  terracotta: 'bg-terracotta-soft text-terracotta-hover border-terracotta/15',
  ochre: 'bg-ochre-soft text-charcoal border-ochre/25',
  neutral: 'bg-cream-dark text-charcoal-muted border-warm-border',
};

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
