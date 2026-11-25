import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FeatureMeta } from '../../data/features';
import { Badge } from './Badge';
import { Card } from './Card';

interface FeaturePlaceholderProps {
  feature: FeatureMeta;
  icon: ReactNode;
  upcomingHighlights: string[];
}

export function FeaturePlaceholder({
  feature,
  icon,
  upcomingHighlights,
}: FeaturePlaceholderProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-savanna-green hover:text-savanna-green-hover"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Link>
        <Badge tone={feature.tone}>{feature.badge}</Badge>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-savanna-green-soft text-savanna-green">
            {icon}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
              {feature.swahiliTitle}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              {feature.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-charcoal-muted sm:text-base">
              {feature.description}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-warm-border pt-6">
          <h2 className="text-sm font-semibold text-charcoal">
            Planned for this module
          </h2>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {upcomingHighlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-xl bg-cream px-3.5 py-2.5 text-sm text-charcoal-muted"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-terracotta"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </section>
  );
}
