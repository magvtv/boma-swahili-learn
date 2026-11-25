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
        'rounded-2xl border border-warm-border bg-surface p-5 shadow-xs transition-shadow',
        className,
      )}
    >
      {children}
    </div>
  );
}
