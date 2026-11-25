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
    <div className="space-y-9">
      {/* Asymmetric Editorial Hero */}
      <section className="grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-3xl border border-warm-border bg-savanna-green p-6 text-cream shadow-[0_6px_24px_rgba(27,67,50,0.12)] sm:p-8 lg:col-span-8">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-xs font-medium text-cream">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Karibu Boma Language Lab</span>
            </div>
            <h1 className="text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-semibold leading-tight tracking-tight">
              Learn Kiswahili like you’re sharing a meal
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-cream/85 sm:text-base">
              Pick up the words Kenyans actually use in kitchens, markets, and around
              the table—one unhurried phrase at a time.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
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
              leftIcon={<BookOpen className="size-4 text-terracotta" aria-hidden="true" />}
              onClick={() => setTipOpen(true)}
            >
              Today’s Table Note
            </Button>
          </div>
        </div>

        <Card className="flex flex-col justify-between gap-5 bg-cream-dark/55 p-6 lg:col-span-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">
              Daily Rhythm
            </p>
            <h2 className="text-lg font-bold text-charcoal">
              12 of 20 minutes today
            </h2>
            <p className="text-xs leading-relaxed text-charcoal-muted">
              A short session with flashcards or a quick 5-question quiz keeps words
              fresh without feeling like homework.
            </p>
          </div>

          <div className="space-y-3">
            <ProgressBar
              value={12}
              max={20}
              tone="terracotta"
              showPercentage={true}
              label="Today’s goal"
            />
            <p className="border-t border-warm-border pt-3 text-xs italic text-charcoal-muted">
              “Haraka haraka haina baraka” — Rushing has no blessing.
            </p>
          </div>
        </Card>
      </section>

      {/* Organic Module Grid */}
      <section aria-labelledby="features-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2
              id="features-heading"
              className="text-xl font-bold tracking-tight text-charcoal"
            >
              Where would you like to start?
            </h2>
            <p className="text-sm text-charcoal-muted">
              Every module shares the same culinary vocabulary so what you read shows up
              in your quizzes.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {FEATURES.map((feature, index) => {
            const isLeadCard = index < 2;
            return (
              <Link
                key={feature.id}
                to={feature.path}
                className={`group block rounded-2xl focus-visible:outline-none ${
                  isLeadCard ? 'lg:col-span-6' : 'lg:col-span-3 sm:col-span-1'
                }`}
              >
                <Card className="flex h-full flex-col justify-between transition-all duration-200 group-hover:border-terracotta/45 group-hover:bg-surface group-hover:shadow-[0_6px_20px_rgba(42,33,27,0.08)]">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`flex size-10 items-center justify-center rounded-xl ${TONE_ACCENTS[feature.tone]}`}
                      >
                        <FeatureIcon id={feature.id} className="size-5" />
                      </span>
                      <Badge tone={feature.tone}>{feature.badge}</Badge>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <p className="text-[11px] font-semibold tracking-wider text-terracotta uppercase">
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
            );
          })}
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
