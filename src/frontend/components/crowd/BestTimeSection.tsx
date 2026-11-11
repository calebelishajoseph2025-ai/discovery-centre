import { getAllOpenDaysBusyness } from '../../../content/busyness.ts';
import { useApp } from '../../app/AppContext.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';

function widthFor(score: number): string {
  return `${Math.max(8, score)}%`;
}

export function BestTimeSection() {
  const { t, locale } = useApp();
  const days = getAllOpenDaysBusyness();
  return (
    <section id="best-time" className="mx-auto w-[min(72rem,calc(100%-2rem))] py-24">
      <SectionHeader
        index="05"
        eyebrow={t('bestTime.badge')}
        title={t('bestTime.title')}
        subtitle={t('bestTime.subtitle')}
      />
      <p className="mb-6 text-sm text-lantern">{t('bestTime.quietestSentence')}</p>
      <div
        className="space-y-4"
        role="img"
        aria-label={t('bestTime.chart')}
      >
        {days.map((day) => (
          <div key={day.dayOfWeek} className="grid grid-cols-[7rem_1fr] items-center gap-4">
            <p className="text-sm font-semibold">{day.dayName[locale]}</p>
            <div className="flex flex-wrap gap-1">
              {day.slots?.map((slot) => (
                <div
                  key={slot.hour}
                  className="h-8 overflow-hidden rounded-sm bg-surface-2"
                  style={{ width: '12%' }}
                  title={`${slot.slotLabel} · ${slot.label[locale]}`}
                  aria-label={`${day.dayName[locale]} ${slot.slotLabel} ${slot.label[locale]}`}
                >
                  <div
                    className="h-full"
                    style={{
                      width: widthFor(slot.score),
                      background:
                        slot.category === 'quiet'
                          ? 'var(--moss)'
                          : slot.category === 'busy'
                            ? 'var(--ember)'
                            : 'var(--lantern)',
                      opacity: 0.85,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-text-muted">{t('bestTime.closedMonday')}</p>
      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-text-muted">
        <li>{t('bestTime.legend.quiet')}</li>
        <li>{t('bestTime.legend.moderate')}</li>
        <li>{t('bestTime.legend.busy')}</li>
      </ul>
      <p className="mt-4 text-xs text-text-muted">{t('bestTime.disclaimer')}</p>
    </section>
  );
}
