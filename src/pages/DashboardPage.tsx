import { ArrowRight, BookOpen, Languages, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  FeatureIcon,
  Modal,
  ProgressBar,
} from '../components/ui';
import { FEATURES } from '../data/features';

const TONE_ACCENTS = {
  green: 'bg-savanna-green-soft text-savanna-green',
  terracotta: 'bg-terracotta-soft text-terracotta',
  ochre: 'bg-ochre-soft text-charcoal',
} as const;

export function DashboardPage() {
  const [tipOpen, setTipOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-warm-border bg-savanna-green p-6 text-cream shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-medium text-cream">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Karibu Boma Language Lab</span>
            </div>
            <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-bold tracking-tight">
              Learn Kiswahili with warmth and context
            </h1>
            <p className="text-sm leading-relaxed text-cream/85 sm:text-base">
              Explore everyday Kenyan & East African phrases, build vocabulary with
              flashcards, and master Swahili grammar at your own pace.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="terracotta"
                size="md"
                leftIcon={<Languages className="size-4" aria-hidden="true" />}
                onClick={() => navigate('/translator')}
              >
                Open Translator
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<BookOpen className="size-4" aria-hidden="true" />}
                onClick={() => setTipOpen(true)}
              >
                Today’s Cultural Note
              </Button>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-cream/10 p-4 backdrop-blur-xs lg:w-72">
            <p className="text-xs font-semibold tracking-wider text-cream/80 uppercase">
              Daily Practice Goal
            </p>
            <p className="mt-1 text-sm font-medium text-cream">
              12 of 20 minutes completed
            </p>
            <div className="mt-3">
              <ProgressBar
                value={12}
                max={20}
                tone="ochre"
                showPercentage={false}
                className="[&_[role=progressbar]]:bg-cream/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section aria-labelledby="features-heading" className="space-y-4">
        <div>
          <h2
            id="features-heading"
            className="text-lg font-bold tracking-tight text-charcoal sm:text-xl"
          >
            Learning Modules
          </h2>
          <p className="text-sm text-charcoal-muted">
            Choose a module below to start practicing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="group block rounded-2xl focus-visible:outline-none"
            >
              <Card className="flex h-full flex-col justify-between transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-terracotta/40 group-hover:shadow-md">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex size-11 items-center justify-center rounded-xl ${TONE_ACCENTS[feature.tone]}`}
                    >
                      <FeatureIcon id={feature.id} className="size-5" />
                    </span>
                    <Badge tone={feature.tone}>{feature.badge}</Badge>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
                      {feature.swahiliTitle}
                    </p>
                    <h3 className="text-base font-bold text-charcoal group-hover:text-savanna-green">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-charcoal-muted">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-savanna-green group-hover:text-terracotta">
                  <span>Open {feature.title}</span>
                  <ArrowRight
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Modal
        open={tipOpen}
        onClose={() => setTipOpen(false)}
        title="Karibu Mezani — Welcome to the Table"
        description="A quick Kenyan dining & hospitality note"
        footer={
          <Button variant="primary" size="sm" onClick={() => setTipOpen(false)}>
            Sawa, got it!
          </Button>
        }
      >
        <div className="space-y-3 text-sm leading-relaxed text-charcoal-muted">
          <p>
            In Kenyan households, sharing a meal is an expression of community. Saying{' '}
            <strong className="text-charcoal">“Karibu chakula”</strong> invites someone
            to join you at the table, while{' '}
            <strong className="text-charcoal">“Asante, nimeshiba”</strong> politely
            means “Thank you, I’m full.”
          </p>
        </div>
      </Modal>
    </div>
  );
}
