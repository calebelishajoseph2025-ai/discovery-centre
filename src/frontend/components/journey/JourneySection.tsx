import { JOURNEY_STAGES } from '../../../content/journey.ts';
import { useApp } from '../../app/AppContext.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { Pip } from '../guide/Pip.tsx';

export function JourneySection() {
  const { t, locale, navigate, guide } = useApp();
  return (
    <section id="journey" className="relative mx-auto w-[min(72rem,calc(100%-2rem))] py-24">
      <SectionHeader
        index="02"
        eyebrow={t('journey.badge')}
        title={t('journey.title')}
        subtitle={t('journey.subtitle')}
      />
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-0 top-8 hidden h-[calc(100%-2rem)] w-full md:block"
          viewBox="0 0 1000 240"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M80 40 C 220 40, 280 200, 500 120 S 820 40, 920 160"
            fill="none"
            stroke="var(--lantern)"
            strokeWidth="1.2"
            strokeDasharray="4 10"
          />
        </svg>
        <ol className="grid gap-8 md:grid-cols-3">
          {JOURNEY_STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className={`relative rounded-lg border border-hairline bg-surface-1 p-6 ${
                index === 1 ? 'md:mt-16' : index === 2 ? 'md:mt-8' : ''
              }`}
            >
              <p className="tabular text-lantern">0{stage.stepNumber}</p>
              <h3 className="mt-3 font-display text-3xl">{stage.title[locale]}</h3>
              <p className="mt-2 text-sm text-lantern">{stage.subtitle[locale]}</p>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                {stage.description[locale]}
              </p>
              <button
                type="button"
                className="mt-6 text-sm font-semibold text-lantern"
                onClick={() => navigate(stage.targetAnchor)}
              >
                {t('journey.continue')}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="absolute right-0 top-10">
        <Pip pose="point" line={JOURNEY_STAGES[0].guideLine[locale]} visible={guide} />
      </div>
    </section>
  );
}
