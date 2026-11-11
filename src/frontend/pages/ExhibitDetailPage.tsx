import { EXHIBITS } from '../../content/exhibits.ts';
import { useApp } from '../app/AppContext.tsx';
import { hrefFor, withLocale } from '../app/router.ts';
import { accentVar, resolveAccent } from '../design/accent.ts';
import { Button } from '../components/ui/Button.tsx';

export function ExhibitDetailPage({ slug }: { slug: string }) {
  const { t, locale, navigate, favorites, toggleFavorite } = useApp();
  const exhibit = EXHIBITS.find((e) => e.slug === slug);

  if (!exhibit) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto w-[min(42rem,calc(100%-2rem))] py-24">
        <h1 className="font-display text-4xl">{t('exhibits.notFound')}</h1>
        <Button className="mt-6" onClick={() => navigate(withLocale('/#exhibits', locale))}>
          {t('exhibits.back')}
        </Button>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-[min(48rem,calc(100%-2rem))] py-16">
      <p className="small-caps">
        {exhibit.zone} · {exhibit.floor}
      </p>
      <h1
        className="mt-3 font-display text-5xl"
        style={{ color: accentVar(exhibit.accentToken, exhibit.slug) }}
      >
        {exhibit.name[locale]}
      </h1>
      <p className="mt-4 text-lg text-text-muted">{exhibit.tagline[locale]}</p>
      <p className="mt-6 leading-relaxed">{exhibit.description[locale]}</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="small-caps">{t('exhibits.card.duration', { minutes: exhibit.durationMinutes })}</dt>
          <dd className="text-text-muted">{exhibit.ageRange[locale]}</dd>
        </div>
        <div>
          <dt className="small-caps">{exhibit.calm ? t('exhibits.card.calm') : t('exhibits.card.lively')}</dt>
          <dd className="text-text-muted">{exhibit.sensoryNote[locale]}</dd>
        </div>
      </dl>
      <h2 className="mt-10 font-display text-3xl">{t('exhibits.whatYoullDo')}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-text-muted">
        {exhibit.whatYoullDo.map((item) => (
          <li key={item.en}>{item[locale]}</li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-3xl">{t('exhibits.tips')}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-text-muted">
        {exhibit.tips.map((item) => (
          <li key={item.en}>{item[locale]}</li>
        ))}
      </ul>
      <p className="mt-8 text-sm">{exhibit.accessibility[locale]}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={() => toggleFavorite(exhibit.slug)}>
          {favorites.includes(exhibit.slug)
            ? t('exhibits.card.inPlan')
            : t('exhibits.card.addToPlan')}
        </Button>
        <Button variant="secondary" onClick={() => navigate(hrefFor({ name: 'home' }, locale) + '#exhibits')}>
          {t('exhibits.back')}
        </Button>
      </div>
      <span className="sr-only" data-accent={resolveAccent(exhibit.accentToken, exhibit.slug)} />
    </main>
  );
}
