import { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { Header, Footer } from '../components/layout/Header.tsx';
import { HomePage } from '../pages/HomePage.tsx';
import { ExhibitDetailPage } from '../pages/ExhibitDetailPage.tsx';
import {
  AccessibilityPage,
  NotFoundPage,
  OfflinePage,
  PlanDetailPage,
  PrivacyPage,
  QualityPage,
} from '../pages/InfoPages.tsx';
import { hrefFor } from './router.ts';

function Routes() {
  const { location, t, locale, navigate } = useApp();
  const { route } = location;

  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Northside Discovery Centre',
      plan: t('plan.pageTitle'),
      short: t('plan.pageTitle'),
      exhibit: t('nav.exhibits'),
      accessibility: t('a11y.title'),
      privacy: t('privacy.title'),
      quality: t('quality.page'),
      offline: t('offline.title'),
      notfound: t('page.notFound'),
    };
    document.title = `${titles[route.name] ?? 'Northside'} · Northside Discovery Centre`;
  }, [route, t]);

  let page = <HomePage />;
  if (route.name === 'exhibit') page = <ExhibitDetailPage slug={route.slug} />;
  else if (route.name === 'plan') page = <PlanDetailPage />;
  else if (route.name === 'short') page = <PlanDetailPage code={route.code} />;
  else if (route.name === 'accessibility') page = <AccessibilityPage />;
  else if (route.name === 'privacy') page = <PrivacyPage />;
  else if (route.name === 'quality') page = <QualityPage />;
  else if (route.name === 'offline') page = <OfflinePage />;
  else if (route.name === 'notfound') page = <NotFoundPage />;

  return (
    <ErrorBoundary
      title={t('page.error')}
      retryLabel={t('page.retry')}
      homeLabel={t('page.back')}
      onHome={() => navigate(hrefFor({ name: 'home' }, locale))}
    >
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{page}</div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
}
