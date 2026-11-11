import type { ReactNode } from 'react';
import QUALITY from '../../content/quality-report.generated.json';
import { CENTRE_FACTS } from '../../content/centre.ts';
import { useApp } from '../app/AppContext.tsx';
import { hrefFor, withLocale } from '../app/router.ts';
import { encodePlanInput } from '../../lib/share.ts';
import { planIdentity } from '../app/savedPlans.ts';
import { Button } from '../components/ui/Button.tsx';
import { PlannerIsland } from '../components/planner/PlannerIsland.tsx';
import { decodePlanInput } from '../../lib/share.ts';
import { useEffect, useState } from 'react';
import { getShortPlan } from '../app/api.ts';
import { PlanInput } from '../../lib/schemas.ts';

function PageShell({ title, children }: { title: string; children?: ReactNode }) {
  const { t, locale, navigate } = useApp();
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-[min(48rem,calc(100%-2rem))] py-16">
      <Button variant="ghost" onClick={() => navigate(hrefFor({ name: 'home' }, locale))}>
        {t('page.back')}
      </Button>
      <h1 className="mt-6 font-display text-5xl">{title}</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-text-muted">{children}</div>
    </main>
  );
}

export function AccessibilityPage() {
  const { t, locale } = useApp();
  return (
    <PageShell title={t('a11y.title')}>
      <p>{t('a11y.intro')}</p>
      <p>{CENTRE_FACTS.accessibility.summary[locale]}</p>
      <p>{t('a11y.quiet')}</p>
      <p>{t('a11y.keyboard')}</p>
    </PageShell>
  );
}

export function PrivacyPage() {
  const { t } = useApp();
  return (
    <PageShell title={t('privacy.title')}>
      <p>{t('privacy.intro')}</p>
      <p>{t('privacy.storage')}</p>
      <p>{t('privacy.contact')}</p>
    </PageShell>
  );
}

export function QualityPage() {
  const { t } = useApp();
  return (
    <PageShell title={t('quality.page')}>
      <p>{t('quality.generated', { date: QUALITY.generatedAt.slice(0, 10) })}</p>
      <ul className="space-y-2">
        {QUALITY.lighthouse.map((row) => (
          <li key={row.url} className="rounded-md border border-hairline p-3 text-text">
            <p className="font-mono text-xs text-lantern">{row.url}</p>
            <p>
              {t('quality.perf')} {row.perf} · {t('quality.a11y')} {row.a11y} · {t('quality.seo')}{' '}
              {row.seo} · {t('quality.lcp')} {row.lcp}s · {t('quality.cls')} {row.cls} ·{' '}
              {t('quality.tbt')} {row.tbt}ms
            </p>
          </li>
        ))}
      </ul>
      <p>
        {t('quality.violations', { count: QUALITY.axe.serious + QUALITY.axe.critical })}
      </p>
      <p>
        {t('quality.unit', { passed: QUALITY.tests.unit.passed })} ·{' '}
        {t('quality.api', { passed: QUALITY.tests.api.passed })} ·{' '}
        {t('quality.e2e', { passed: QUALITY.tests.e2e.passed })}
      </p>
      <p>
        {t('quality.coverage')}: {QUALITY.coverage.lib}%
      </p>
    </PageShell>
  );
}

export function OfflinePage() {
  const { t, locale, savedPlans, navigate } = useApp();
  return (
    <PageShell title={t('offline.title')}>
      <p>{t('offline.body')}</p>
      {savedPlans.length === 0 ? (
        <p>{t('offline.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {savedPlans.map((plan) => (
            <li key={plan.id}>
              <button
                type="button"
                className="text-left text-lantern"
                onClick={() =>
                  navigate(
                    `${withLocale('/plan', locale)}?${encodePlanInput(plan.input).toString()}`
                  )
                }
              >
                {plan.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

export function PlanDetailPage({ code }: { code?: string }) {
  const { t, location } = useApp();
  const [input, setInput] = useState<PlanInput | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (code) {
      void getShortPlan(code).then((payload) => {
        if (!payload) setMissing(true);
        else setInput(payload.input);
      });
      return;
    }
    const decoded = decodePlanInput(params);
    if (decoded.success && decoded.data) setInput(decoded.data);
    else setMissing(true);
  }, [code, location.search]);

  if (missing) {
    return (
      <PageShell title={t('plan.pageTitle')}>
        <p>{t('plan.missing')}</p>
      </PageShell>
    );
  }

  if (!input) {
    return (
      <main id="main-content" className="mx-auto py-24 text-center text-text-muted">
        {t('common.loading')}
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">{t('plan.pageTitle')}</h1>
      <PlannerIsland key={planIdentity(input)} initial={input} />
    </main>
  );
}

export function NotFoundPage() {
  const { t } = useApp();
  return <PageShell title={t('page.notFound')} />;
}
