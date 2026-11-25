import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Small centered title, for pages where the content below is the focus. */
  quiet?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  quiet = false,
}: PageHeaderProps) {
  if (quiet) {
    return (
      <header className="text-center">
        <p className="text-xs text-terracotta">{eyebrow}</p>
        <h1 className="mt-2 text-xl font-semibold leading-snug text-charcoal">{title}</h1>
      </header>
    );
  }

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
      <div className="max-w-xl">
        <p className="text-sm text-terracotta">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight text-balance text-charcoal sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-charcoal-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
