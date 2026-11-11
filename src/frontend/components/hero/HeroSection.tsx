import { lazy, Suspense } from 'react';
import { MapPin, Clock3, Ticket, Accessibility } from 'lucide-react';
import { useApp } from '../../app/AppContext.tsx';
import { CENTRE_FACTS } from '../../../content/centre.ts';
import { CssStarField } from '../../sky/fallback.tsx';
import { Horizon, TicketStub } from '../art/Horizon.tsx';
import { Button } from '../ui/Button.tsx';
import { Pip } from '../guide/Pip.tsx';

const StarField = lazy(() => import('../../sky/StarField.tsx'));

export function HeroSection() {
  const { t, locale, navigate, quiet, guide } = useApp();
  const facts = [
    { icon: MapPin, text: t('hero.facts.address') },
    { icon: Clock3, text: t('hero.facts.hours') },
    { icon: Ticket, text: t('hero.facts.tickets') },
    { icon: Accessibility, text: t('hero.facts.accessibility') },
  ];

  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      <Suspense fallback={<CssStarField label={t('hero.starfield')} />}>
        <StarField label={t('hero.starfield')} quiet={quiet} />
      </Suspense>
      <Horizon />
      <div className="relative mx-auto grid w-[min(90rem,calc(100%-2rem))] gap-10 pb-28 pt-16 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-end">
        <span
          className="pointer-events-none absolute -left-4 -top-6 font-display text-[clamp(6rem,22vw,18rem)] leading-none text-hairline opacity-40"
          aria-hidden="true"
        >
          01
        </span>
        <div className="relative">
          <p className="small-caps">{t('hero.overline')}</p>
          <h1 className="hero-title mt-5 max-w-[14ch] font-display text-[clamp(3rem,8vw,7.5rem)]">
            {t('hero.titleLead')}{' '}
            <em className="italic text-lantern">{t('hero.titleEm')}</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-muted">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/#planner')}>{t('hero.cta.plan')}</Button>
            <Button variant="secondary" onClick={() => navigate('/#exhibits')}>
              {t('hero.cta.exhibits')}
            </Button>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {facts.map((fact) => (
              <li key={fact.text} className="flex items-center gap-3 text-sm text-text">
                <fact.icon size={16} aria-hidden="true" className="text-lantern" />
                {fact.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-end gap-6">
          <TicketStub
            name={CENTRE_FACTS.name[locale]}
            hours={t('hero.ticket.hours')}
            address={CENTRE_FACTS.address}
            price={t('hero.facts.tickets')}
          />
          <Pip
            pose="welcome"
            line={guide ? t('hero.pip') : ''}
            visible={guide}
          />
        </div>
      </div>
    </section>
  );
}
