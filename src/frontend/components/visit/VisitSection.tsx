import { useMemo, useState } from 'react';
import { CENTRE_FACTS } from '../../../content/centre.ts';
import { FAQS } from '../../../content/faq.ts';
import { getAllOpenDaysBusyness } from '../../../content/busyness.ts';
import { useApp } from '../../app/AppContext.tsx';
import { hrefFor } from '../../app/router.ts';
import { RiverdaleMap } from '../art/Horizon.tsx';
import { Disclosure } from '../ui/Disclosure.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { Tabs } from '../ui/Tabs.tsx';
import { Button } from '../ui/Button.tsx';

export function VisitSection() {
  const { t, locale, navigate } = useApp();
  const [query, setQuery] = useState('');
  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (item) =>
        item.question[locale].toLowerCase().includes(q) ||
        item.answer[locale].toLowerCase().includes(q)
    );
  }, [locale, query]);
  const days = getAllOpenDaysBusyness();

  return (
    <section id="visit" className="mx-auto w-[min(72rem,calc(100%-2rem))] py-24">
      <SectionHeader
        index="06"
        eyebrow={t('visit.badge')}
        title={t('visit.title')}
        subtitle={t('visit.subtitle')}
      />
      <Tabs
        label={t('visit.title')}
        tabs={[
          {
            id: 'hours',
            label: t('visit.tabs.hours'),
            panel: (
              <table className="w-full text-left text-sm">
                <caption className="mb-3 text-left text-text-muted">
                  {t('visit.hours.caption')}
                </caption>
                <tbody>
                  {Object.entries(CENTRE_FACTS.hours.schedule).map(([day, value]) => (
                    <tr key={day} className="border-t border-hairline">
                      <th className="py-2 font-medium">{day}</th>
                      <td className="py-2">{value.label[locale]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
          },
          {
            id: 'location',
            label: t('visit.tabs.location'),
            panel: (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="font-display text-2xl">{CENTRE_FACTS.address}</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.open(CENTRE_FACTS.googleMapsUrl, '_blank', 'noopener')}
                  >
                    {t('visit.openMaps')}
                  </Button>
                </div>
                <div aria-label={t('visit.location.schematic')}>
                  <RiverdaleMap />
                </div>
              </div>
            ),
          },
          {
            id: 'tickets',
            label: t('visit.tabs.tickets'),
            panel: (
              <div>
                <p className="font-display text-4xl">INR 100</p>
                <p className="text-text-muted">Adult</p>
                <p className="mt-4 font-display text-4xl">INR 50</p>
                <p className="text-text-muted">Child</p>
                <p className="mt-6 max-w-xl text-sm text-text-muted">{t('visit.pay')}</p>
              </div>
            ),
          },
          {
            id: 'accessibility',
            label: t('visit.tabs.accessibility'),
            panel: (
              <div>
                <p className="font-display text-2xl">
                  {CENTRE_FACTS.accessibility.claim[locale]}
                </p>
                <p className="mt-3 text-text-muted">
                  {CENTRE_FACTS.accessibility.summary[locale]}
                </p>
                <Button
                  className="mt-5"
                  variant="secondary"
                  onClick={() => navigate(hrefFor({ name: 'accessibility' }, locale))}
                >
                  {t('footer.accessibility')}
                </Button>
              </div>
            ),
          },
          {
            id: 'faq',
            label: t('visit.tabs.faq'),
            panel: (
              <div>
                <label className="block text-sm">
                  {t('visit.faq.search')}
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="mt-2 w-full rounded-md border border-hairline bg-surface-1 px-3 py-2"
                  />
                </label>
                <div className="mt-4">
                  {faqs.length === 0 ? (
                    <p className="text-text-muted">{t('visit.faq.empty')}</p>
                  ) : (
                    faqs.map((faq) => (
                      <Disclosure key={faq.id} title={faq.question[locale]}>
                        {faq.answer[locale]}
                      </Disclosure>
                    ))
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
      <p className="sr-only">
        {days.map((d) => d.dayName[locale]).join(', ')}
      </p>
    </section>
  );
}
