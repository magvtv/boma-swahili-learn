import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type PageHeaderTone = 'green' | 'terracotta' | 'ochre';

interface PageHeaderProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  tone?: PageHeaderTone;
  action?: ReactNode;
}

const TONE_STYLES: Record<PageHeaderTone, string> = {
  green: 'bg-savanna-green-soft text-savanna-green',
  terracotta: 'bg-terracotta-soft text-terracotta',
  ochre: 'bg-ochre-soft text-charcoal',
};

export function PageHeader({
  icon,
  eyebrow,
  title,
  description,
  tone = 'green',
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 lg:pt-2">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-2xl',
              TONE_STYLES[tone],
            )}
          >
            {icon}
          </span>
          <p className="text-sm font-medium text-terracotta">{eyebrow}</p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight text-balance text-charcoal sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-charcoal-muted">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}
