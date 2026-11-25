import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Modal, ProgressBar } from '../components/ui';
import { FEATURES } from '../data/features';

export function DashboardPage() {
  const [tipOpen, setTipOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-24">
      <div className="space-y-10">
        <section className="rounded-card bg-savanna-green px-8 py-20 text-center text-cream sm:px-14 sm:py-28">
          <h1 className="mx-auto max-w-xl text-[clamp(2.125rem,1.4rem+2.6vw,3.25rem)] font-semibold leading-[1.12] tracking-tight text-balance">
            Learn Kiswahili like you’re sharing a meal
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-cream/85 sm:text-lg">
            Pick up the words Kenyans actually use in kitchens, markets, and around
            the table—one unhurried phrase at a time.
          </p>
          <Button
            variant="terracotta"
            size="lg"
            className="mt-12"
            onClick={() => navigate('/translator')}
          >
            Open Translator
          </Button>
        </section>

        <div className="mx-auto max-w-sm space-y-5 text-center">
          <ProgressBar
            value={12}
            max={20}
            tone="terracotta"
            showPercentage={false}
            label="12 of 20 minutes today"
          />
          <button
            type="button"
            onClick={() => setTipOpen(true)}
            className="rounded-md text-sm text-savanna-green underline decoration-savanna-green/30 underline-offset-4 hover:decoration-savanna-green"
          >
            Today’s table note
          </button>
        </div>
      </div>

      <nav aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="px-2 text-lg font-semibold leading-snug text-charcoal"
        >
          More ways to practice
        </h2>

        <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
          {FEATURES.filter((feature) => feature.id !== 'translator').map((feature) => (
            <li key={feature.id} className="border-t border-warm-border/60">
              <Link
                to={feature.path}
                className="group flex items-baseline justify-between gap-4 rounded-lg px-2 py-5"
              >
                <span className="text-base text-charcoal group-hover:text-savanna-green">
                  {feature.title}
                </span>
                <span className="text-xs text-terracotta">{feature.swahiliTitle}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

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
