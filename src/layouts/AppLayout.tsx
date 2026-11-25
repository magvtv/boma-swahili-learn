import { BookOpen, Flame, GraduationCap, Home, Menu, Search, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FeatureIcon } from '../components/ui/FeatureIcon';
import { Input } from '../components/ui/Input';
import { FEATURES } from '../data/features';
import { GRAMMAR_LESSONS } from '../data/grammar';
import { PHRASES } from '../data/phrases';
import { cn } from '../utils/cn';

const MOBILE_BOTTOM_IDS = new Set([
  'translator',
  'flashcards',
  'quizzes',
  'phrasebook',
]);

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const baseItem =
    'group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm transition-colors duration-100';
  const iconClass =
    'size-4 shrink-0 stroke-[1.5] opacity-60 group-aria-[current=page]:opacity-100';

  return (
    <ul className="space-y-2">
      <li>
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              baseItem,
              isActive
                ? 'bg-savanna-green-soft/60 font-medium text-savanna-green'
                : 'text-charcoal-muted hover:text-charcoal',
            )
          }
        >
          <Home className={iconClass} aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>
      </li>
      {FEATURES.map((feature) => (
        <li key={feature.id}>
          <NavLink
            to={feature.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                baseItem,
                isActive
                  ? 'bg-savanna-green-soft/60 font-medium text-savanna-green'
                  : 'text-charcoal-muted hover:text-charcoal',
              )
            }
          >
            <FeatureIcon id={feature.id} className={iconClass} />
            <span className="flex-1">{feature.title}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function AppLayout() {
  const drawerId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { phrases: [], grammar: [] };

    const phrases = PHRASES.filter(
      (item) =>
        item.swahili.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    ).slice(0, 5);

    const grammar = GRAMMAR_LESSONS.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(q) ||
        lesson.swahiliTitle.toLowerCase().includes(q) ||
        lesson.summary.toLowerCase().includes(q) ||
        lesson.keyRule.toLowerCase().includes(q),
    ).slice(0, 3);

    return { phrases, grammar };
  }, [searchQuery]);

  const showSearchDropdown = searchFocused && searchQuery.trim().length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDrawer = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  }, []);

  const openDrawer = useCallback(async () => {
    const dialog = dialogRef.current;
    const scroller = scrollerRef.current;
    if (!dialog || !scroller || dialog.open) return;

    dialog.showModal();

    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }

    scroller.scrollTo({ left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (dialogRef.current?.open) {
      closeDrawer();
    }
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    if (!dialog || !scroller || !sheet) return;

    const visibleThreshold = 1 / Math.max(window.innerWidth, 1);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio < visibleThreshold && dialog.open) {
          dialog.close();
          setDrawerOpen(false);
        } else if (entry.intersectionRatio === 1) {
          setDrawerOpen(true);
        }
      },
      { root: dialog, threshold: [visibleThreshold, 1] },
    );

    observer.observe(sheet);

    const handleScrollFallback = () => {
      if (!sheet.offsetWidth) return;
      const ratio = 1 - scroller.scrollLeft / sheet.offsetWidth;
      dialog.style.setProperty('--drawer-backdrop', String(Math.max(0, Math.min(1, ratio))));
    };

    const supportsScrollTimeline = CSS.supports('animation-timeline: scroll()');
    if (!supportsScrollTimeline) {
      scroller.addEventListener('scroll', handleScrollFallback, { passive: true });
    }

    const handleCancel = (event: Event) => {
      if (event.cancelable) {
        event.preventDefault();
        closeDrawer();
      }
    };

    dialog.addEventListener('cancel', handleCancel);

    return () => {
      observer.disconnect();
      if (!supportsScrollTimeline) {
        scroller.removeEventListener('scroll', handleScrollFallback);
      }
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [closeDrawer]);

  const mobileBottomFeatures = FEATURES.filter((f) => MOBILE_BOTTOM_IDS.has(f.id));

  return (
    <div className="min-h-dvh text-charcoal">
      {/* Mobile Navigation Drawer (<dialog>) */}
      <dialog
        ref={dialogRef}
        id={drawerId}
        aria-label="Primary navigation"
        className="boma-drawer lg:hidden"
        onClick={(event) => {
          if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
            closeDrawer();
          }
        }}
      >
        <div ref={scrollerRef} className="boma-drawer-scroller">
          <nav
            ref={sheetRef}
            aria-label="Mobile navigation"
            className="boma-drawer-sheet flex flex-col border-r border-warm-border bg-surface p-5"
          >
            <div className="mb-6 flex items-center justify-between border-b border-warm-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-savanna-green text-cream shadow-xs">
                  <Flame className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-none text-charcoal">
                    Jasmin Swahili Lab
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                autoFocus
                className="flex size-9 items-center justify-center rounded-xl text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavLinks onNavigate={closeDrawer} />
            </div>
          </nav>
        </div>
      </dialog>

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-warm-border/40 bg-cream">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:flex-nowrap sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls={drawerId}
              className="boma-btn flex size-10 items-center justify-center rounded-xl border border-warm-border bg-cream text-charcoal hover:bg-cream-dark lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <NavLink to="/" className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-savanna-green text-cream shadow-xs">
                <Flame className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-charcoal sm:text-base">
                Jasmin Swahili Lab
              </span>
            </NavLink>
          </div>

          {/* Global Search Bar */}
          <div
            ref={searchContainerRef}
            className="relative w-full sm:max-w-xs"
          >
            <Input
              type="search"
              aria-label="Global search"
              placeholder="Search phrases or grammar..."
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearchFocused(false);
                }
              }}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchFocused(true);
              }}
              leftIcon={<Search className="size-4" />}
              rightSlot={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="rounded-md p-1 text-charcoal-muted hover:bg-cream-dark hover:text-charcoal"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                ) : null
              }
            />

            {showSearchDropdown && (
              <div
                role="region"
                aria-label="Search results"
                className="absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-warm-border bg-surface p-2 shadow-lg"
              >
                {searchResults.phrases.length === 0 &&
                searchResults.grammar.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-charcoal-muted">
                    No matching phrases or grammar lessons found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.phrases.length > 0 && (
                      <div>
                        <p className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-charcoal-muted uppercase">
                          Phrasebook
                        </p>
                        <ul className="space-y-0.5">
                          {searchResults.phrases.map((phrase) => (
                            <li key={phrase.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchFocused(false);
                                  setSearchQuery('');
                                  navigate(
                                    `/phrasebook?q=${encodeURIComponent(phrase.swahili)}`,
                                  );
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs hover:bg-cream-dark"
                              >
                                <BookOpen
                                  className="size-4 shrink-0 text-terracotta"
                                  aria-hidden="true"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-charcoal">
                                    {phrase.swahili}
                                  </p>
                                  <p className="truncate text-charcoal-muted">
                                    {phrase.english}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {searchResults.grammar.length > 0 && (
                      <div>
                        <p className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-charcoal-muted uppercase">
                          Grammar
                        </p>
                        <ul className="space-y-0.5">
                          {searchResults.grammar.map((lesson) => (
                            <li key={lesson.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchFocused(false);
                                  setSearchQuery('');
                                  navigate(
                                    `/grammar?lesson=${encodeURIComponent(lesson.id)}`,
                                  );
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs hover:bg-cream-dark"
                              >
                                <GraduationCap
                                  className="size-4 shrink-0 text-savanna-green"
                                  aria-hidden="true"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-charcoal">
                                    {lesson.title}
                                  </p>
                                  <p className="truncate text-charcoal-muted">
                                    {lesson.swahiliTitle}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar + Main Content */}
      <div className="mx-auto flex max-w-7xl gap-12 px-5 py-10 sm:px-6 lg:px-8 lg:py-16 xl:gap-20">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-32">
            <nav aria-label="Primary">
              <NavLinks />
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-16">
          <div key={location.pathname} className="boma-page-enter mx-auto max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-warm-border/50 bg-cream px-2 py-2 lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 gap-1">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-savanna-green-soft/60 text-savanna-green'
                    : 'text-charcoal-muted hover:text-charcoal',
                )
              }
            >
              <Home className="size-4.5" aria-hidden="true" />
              <span>Home</span>
            </NavLink>
          </li>
          {mobileBottomFeatures.map((feature) => (
            <li key={feature.id}>
              <NavLink
                to={feature.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'bg-savanna-green-soft/60 text-savanna-green'
                      : 'text-charcoal-muted hover:text-charcoal',
                  )
                }
              >
                <FeatureIcon id={feature.id} className="size-4.5" />
                <span className="truncate">{feature.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
