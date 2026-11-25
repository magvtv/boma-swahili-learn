import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-warm-border bg-surface p-5 shadow-[0_2px_12px_rgba(42,33,27,0.04)] transition-colors',
        className,
      )}
    >
      {children}
    </div>
  );
}
