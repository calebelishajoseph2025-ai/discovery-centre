import { useEffect, useState } from 'react';
import QUALITY from '../../../content/quality-report.generated.json';
import { useApp } from '../../app/AppContext.tsx';
import { getFeedbackSummary } from '../../app/api.ts';
import { socialProofView } from '../../app/socialProof.ts';
import { hrefFor } from '../../app/router.ts';
import { Button } from '../ui/Button.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { FeedbackSummaryResult } from '../../../store/types.ts';

export function SocialProofSection() {
  const { t } = useApp();
  const [summary, setSummary] = useState<FeedbackSummaryResult | null>(null);

  useEffect(() => {
    void getFeedbackSummary().then(setSummary);
  }, []);

  const view = socialProofView(summary);
  if (view.kind === 'hidden') return null;

  return (
    <section
      data-component="social-proof"
      className="mx-auto w-[min(72rem,calc(100%-2rem))] py-16"
    >
      <p className="font-display text-3xl sm:text-5xl">
        {view.kind === 'kofn'
          ? t('socialProof.kofn', { k: view.k, n: view.n })
          : t('socialProof.stat', { pct: view.pct })}
      </p>
      <p className="mt-3 text-text-muted">
        {t('socialProof.basis', { count: view.n })}
      </p>
    </section>
  );
}

export function QualityStripSection() {
  const { t, locale, navigate } = useApp();
  const home = QUALITY.lighthouse[0];
  return (
    <section id="quality" className="mx-auto w-[min(72rem,calc(100%-2rem))] py-24">
      <SectionHeader
        index="08"
        eyebrow={t('quality.badge')}
        title={t('quality.title')}
        subtitle={t('quality.subtitle')}
      />
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t('quality.perf'), home.perf],
          [t('quality.a11y'), home.a11y],
          [t('quality.seo'), home.seo],
          [t('quality.bp'), home.bp],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-md border border-hairline p-4">
            <dt className="small-caps">{label}</dt>
            <dd className="font-display text-4xl">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-text-muted">
        {t('quality.generated', { date: QUALITY.generatedAt.slice(0, 10) })}
      </p>
      <Button
        className="mt-6"
        variant="secondary"
        onClick={() => navigate(hrefFor({ name: 'quality' }, locale))}
      >
        {t('quality.cta')}
      </Button>
    </section>
  );
}
