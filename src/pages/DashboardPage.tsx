import { ArrowRight, BookOpen, Languages } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
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
    <div className="space-y-16">
      {/* Editorial Hero */}
      <div className="space-y-6">
        <section className="rounded-card bg-savanna-green px-7 py-12 text-cream shadow-soft sm:px-12 sm:py-16 lg:px-14 lg:py-20">
          <p className="text-sm font-medium text-cream/75">Karibu Boma Language Lab</p>
          <h1 className="mt-5 max-w-2xl text-[clamp(2.125rem,1.4rem+2.6vw,3.25rem)] font-semibold leading-[1.12] tracking-tight text-balance">
            Learn Kiswahili like you’re sharing a meal
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
            Pick up the words Kenyans actually use in kitchens, markets, and around
            the table—one unhurried phrase at a time.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              variant="terracotta"
              size="lg"
              leftIcon={<Languages className="size-4" aria-hidden="true" />}
              onClick={() => navigate('/translator')}
            >
              Open Translator
            </Button>
            <Button
              variant="inverse"
              size="lg"
              leftIcon={<BookOpen className="size-4" aria-hidden="true" />}
              onClick={() => setTipOpen(true)}
            >
              Today’s Table Note
            </Button>
          </div>
        </section>

        {/* Daily rhythm: a quiet strip below the hero */}
        <Card className="grid gap-6 bg-cream-dark/40 shadow-none md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <p className="text-sm font-medium text-terracotta">Daily rhythm</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-charcoal">
              12 of 20 minutes today
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
              A short session with flashcards or a quick 5-question quiz keeps words
              fresh without feeling like homework.
            </p>
          </div>

          <div className="space-y-4">
            <ProgressBar
              value={12}
              max={20}
              tone="terracotta"
              showPercentage={true}
              label="Today’s goal"
            />
            <p className="text-xs italic leading-relaxed text-charcoal-muted">
              “Haraka haraka haina baraka” — Rushing has no blessing.
            </p>
          </div>
        </Card>
      </div>

      {/* Module Grid */}
      <section aria-labelledby="features-heading" className="space-y-8">
        <div className="max-w-xl">
          <h2
            id="features-heading"
            className="text-2xl font-semibold leading-snug tracking-tight text-charcoal sm:text-3xl"
          >
            Where would you like to start?
          </h2>
          <p className="mt-2 text-base leading-relaxed text-charcoal-muted">
            Every module shares the same culinary vocabulary so what you read shows up
            in your quizzes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="group block rounded-card"
            >
              <Card className="flex h-full flex-col transition-all duration-200 group-hover:border-terracotta/40 group-hover:shadow-[0_6px_24px_rgba(42,33,27,0.06)]">
                <span
                  className={`flex size-11 items-center justify-center rounded-2xl ${TONE_ACCENTS[feature.tone]}`}
                >
                  <FeatureIcon id={feature.id} className="size-5" />
                </span>

                <p className="mt-6 text-xs font-medium text-terracotta">
                  {feature.swahiliTitle}
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-snug text-charcoal group-hover:text-savanna-green">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal-muted">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-savanna-green group-hover:text-terracotta">
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
