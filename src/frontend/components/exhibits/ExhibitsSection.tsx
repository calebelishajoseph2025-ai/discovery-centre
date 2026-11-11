import { useEffect, useMemo, useState } from 'react';
import { EXHIBITS, Exhibit } from '../../../content/exhibits.ts';
import { useApp } from '../../app/AppContext.tsx';
import { hrefFor } from '../../app/router.ts';
import { getFavourites } from '../../app/api.ts';
import { accentVar, resolveAccent } from '../../design/accent.ts';
import { cx } from '../../design/cx.ts';
import { Chip } from '../ui/Chip.tsx';
import { Modal } from '../ui/Modal.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { ExhibitMark } from '../art/ExhibitMark.tsx';
import { filterExhibits, INTEREST_FILTERS, InterestFilter } from './exhibitFilter.ts';

const POSITIONS: Record<string, { x: number; y: number; cell: string }> = {
  'light-lab': { x: 10, y: 50, cell: 'col-start-1' },
  'build-bench': { x: 30, y: 50, cell: 'col-start-2' },
  'sky-room': { x: 50, y: 50, cell: 'col-start-3' },
  'echo-tunnel': { x: 70, y: 50, cell: 'col-start-4' },
  'garden-trail': { x: 90, y: 50, cell: 'col-start-5' },
};

export function ExhibitsSection() {
  const { t, locale, navigate, favorites, toggleFavorite } = useApp();
  const [filter, setFilter] = useState<InterestFilter>('all');
  const [view, setView] = useState<'chart' | 'list'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
      ? 'list'
      : 'chart'
  );
  const [active, setActive] = useState<Exhibit | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(EXHIBITS.map((e) => [e.slug, e.initialFavourites]))
  );

  useEffect(() => {
    void getFavourites().then((remote) => {
      if (remote) setCounts((prev) => ({ ...prev, ...remote }));
    });
  }, []);

  const shown = useMemo(() => filterExhibits(EXHIBITS, filter), [filter]);

  return (
    <section id="exhibits" className="mx-auto w-[min(90rem,calc(100%-2rem))] py-24">
      <SectionHeader
        index="03"
        eyebrow={t('exhibits.badge')}
        title={t('exhibits.title')}
        subtitle={t('exhibits.subtitle')}
      />
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {INTEREST_FILTERS.map((id) => (
            <Chip key={id} selected={filter === id} onClick={() => setFilter(id)}>
              {t(`exhibits.filter.${id}`)}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <span className="text-sm text-text-muted">
            {t('exhibits.filter.results', { count: shown.length })}
          </span>
          <div className="flex rounded-full border border-hairline p-1">
            <Chip selected={view === 'chart'} onClick={() => setView('chart')}>
              {t('exhibits.view.chart')}
            </Chip>
            <Chip selected={view === 'list'} onClick={() => setView('list')}>
              {t('exhibits.view.list')}
            </Chip>
          </div>
        </div>
      </div>

      {view === 'chart' ? (
        <div
          className="relative hidden min-h-[22rem] overflow-hidden rounded-lg border border-hairline bg-surface-1 md:block"
          role="img"
          aria-label={t('exhibits.chart.label')}
        >
          <div
            className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 border-t border-dashed border-lantern/35"
            aria-hidden="true"
          />
          <div className="relative grid min-h-[22rem] grid-cols-5 px-2">
            {EXHIBITS.map((ex, index) => {
              const visible = shown.some((item) => item.slug === ex.slug);
              const high = index % 2 === 0;
              return (
                <button
                  key={ex.slug}
                  type="button"
                  className={cx(
                    'grid h-full grid-rows-[1fr_auto_1fr] justify-items-center',
                    POSITIONS[ex.slug].cell,
                    !visible && 'invisible'
                  )}
                  onClick={() => setActive(ex)}
                  tabIndex={visible ? 0 : -1}
                  aria-hidden={!visible}
                >
                  <span className="flex flex-col items-center justify-end self-stretch pb-3 text-center">
                    {high ? (
                      <>
                        <span className="font-display text-lg leading-tight">{ex.name[locale]}</span>
                        <span className="font-mono text-xs text-text-muted">
                          {t('exhibits.card.duration', { minutes: ex.durationMinutes })}
                        </span>
                      </>
                    ) : null}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: accentVar(ex.accentToken, ex.slug) }}
                  />
                  <span className="flex flex-col items-center justify-start self-stretch pt-3 text-center">
                    {high ? null : (
                      <>
                        <span className="font-display text-lg leading-tight">{ex.name[locale]}</span>
                        <span className="font-mono text-xs text-text-muted">
                          {t('exhibits.card.duration', { minutes: ex.durationMinutes })}
                        </span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <ul className={view === 'list' ? 'grid gap-4 md:grid-cols-2' : 'mt-6 grid gap-4 md:hidden'}>
        {shown.map((ex) => (
          <li key={ex.slug}>
            <article
              data-accent={resolveAccent(ex.accentToken, ex.slug)}
              className="rounded-lg border border-hairline bg-surface-1 p-5"
              style={{ boxShadow: `inset 3px 0 0 ${accentVar(ex.accentToken, ex.slug)}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="small-caps">
                  {ex.calm ? t('exhibits.card.calm') : t('exhibits.card.lively')} · {ex.zone}
                </p>
                <ExhibitMark slug={ex.slug} />
              </div>
              <h3 className="mt-2 font-display text-3xl">{ex.name[locale]}</h3>
              <p className="mt-2 text-sm text-text-muted">{ex.tagline[locale]}</p>
              <p className="mt-3 font-mono text-xs text-lantern">
                {t('exhibits.card.duration', { minutes: ex.durationMinutes })} · {ex.floor}
              </p>
              <p className="mt-3 text-xs text-text-muted">
                {t('exhibits.card.favourites', { count: counts[ex.slug] ?? ex.initialFavourites })}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate(hrefFor({ name: 'exhibit', slug: ex.slug }, locale))}
                >
                  {t('exhibits.card.details')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toggleFavorite(ex.slug)}
                >
                  {favorites.includes(ex.slug)
                    ? t('exhibits.card.inPlan')
                    : t('exhibits.card.addToPlan')}
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <Modal
        open={Boolean(active)}
        title={active ? active.name[locale] : t('exhibits.quickView')}
        onClose={() => setActive(null)}
        closeLabel={t('common.close')}
      >
        {active ? (
          <div>
            <p className="text-text-muted">{active.description[locale]}</p>
            <p className="mt-3 text-sm">{active.sensoryNote[locale]}</p>
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  const slug = active.slug;
                  setActive(null);
                  navigate(hrefFor({ name: 'exhibit', slug }, locale));
                }}
              >
                {t('exhibits.openFull')}
              </Button>
              <Button variant="secondary" onClick={() => toggleFavorite(active.slug)}>
                {favorites.includes(active.slug)
                  ? t('exhibits.card.inPlan')
                  : t('exhibits.card.addToPlan')}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
