import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Locale } from '../../i18n/config.ts';
import { createTranslator } from '../../i18n/t.ts';
import { PlanInput } from '../../lib/schemas.ts';
import { getStatus, StatusResult } from '../../lib/status.ts';
import {
  applyDocumentPreferences,
  persistPreference,
  Preferences,
  readPreferences,
  ThemePreference,
} from './preferences.ts';
import { hrefFor, isHashNav, parseLocation, ParsedLocation, withLocale } from './router.ts';
import {
  isPlanSaved,
  readSavedPlans,
  removeSavedPlan,
  SavedPlan,
  SAVED_PLANS_KEY,
  upsertSavedPlan,
  writeSavedPlans,
} from './savedPlans.ts';

export interface AppContextValue {
  location: ParsedLocation;
  locale: Locale;
  t: ReturnType<typeof createTranslator>;
  theme: ThemePreference;
  quiet: boolean;
  guide: boolean;
  status: StatusResult;
  savedPlans: SavedPlan[];
  savedCount: number;
  favorites: string[];
  navigate: (path: string, options?: { replace?: boolean }) => void;
  setTheme: (theme: ThemePreference) => void;
  setQuiet: (quiet: boolean) => void;
  setGuide: (guide: boolean) => void;
  setLocale: (locale: Locale) => void;
  savePlan: (input: PlanInput) => void;
  unsavePlan: (id: string) => void;
  isSaved: (input: PlanInput) => boolean;
  toggleFavorite: (slug: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function currentLocation(): ParsedLocation {
  if (typeof window === 'undefined') {
    return parseLocation('/', '', '');
  }
  return parseLocation(window.location.pathname, window.location.search, window.location.hash);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<ParsedLocation>(currentLocation);
  const [prefs, setPrefs] = useState<Preferences>(() =>
    readPreferences(typeof localStorage === 'undefined' ? null : localStorage, {
      pathname: typeof window === 'undefined' ? '/' : window.location.pathname,
      search: typeof window === 'undefined' ? '' : window.location.search,
      prefersDark:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches,
      prefersReducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  );
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() =>
    readSavedPlans(typeof localStorage === 'undefined' ? null : localStorage)
  );
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ndc:favorites');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState<StatusResult>(() => getStatus());

  const locale: Locale = location.locale;
  const t = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDocumentPreferences({ ...prefs, locale }, prefersDark);
  }, [prefs, locale]);

  useEffect(() => {
    const onPop = () => setLocation(currentLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const refresh = () => setStatus(getStatus());
    refresh();
    const id = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_PLANS_KEY) {
        setSavedPlans(readSavedPlans(localStorage));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navigate = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      if (isHashNav(path)) {
        const hash = path.includes('#') ? `#${path.split('#')[1]}` : path;
        const home = withLocale('/', locale) + hash;
        window.history.pushState({}, '', home);
        if (location.route.name !== 'home') {
          setLocation(parseLocation(withLocale('/', locale), '', hash));
          window.setTimeout(() => {
            document.querySelector(hash)?.scrollIntoView();
          }, 40);
        } else {
          document.querySelector(hash)?.scrollIntoView();
          setLocation(currentLocation());
        }
        return;
      }
      const next = path.startsWith('http') ? path : path;
      if (options?.replace) window.history.replaceState({}, '', next);
      else window.history.pushState({}, '', next);
      setLocation(parseLocation(window.location.pathname, window.location.search, window.location.hash));
      window.scrollTo(0, 0);
    },
    [locale, location.route.name]
  );

  const setTheme = useCallback((theme: ThemePreference) => {
    persistPreference(localStorage, 'theme', theme);
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const setQuiet = useCallback((quiet: boolean) => {
    persistPreference(localStorage, 'quiet', String(quiet));
    setPrefs((p) => ({ ...p, quiet }));
  }, []);

  const setGuide = useCallback((guide: boolean) => {
    persistPreference(localStorage, 'guide', String(guide));
    setPrefs((p) => ({ ...p, guide }));
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      persistPreference(localStorage, 'locale', next);
      setPrefs((p) => ({ ...p, locale: next }));
      const href = hrefFor(location.route, next, location.search, location.hash);
      navigate(href);
    },
    [location.hash, location.route, location.search, navigate]
  );

  const savePlan = useCallback((input: PlanInput) => {
    setSavedPlans((prev) => {
      const next = upsertSavedPlan(prev, input);
      writeSavedPlans(localStorage, next);
      return next;
    });
  }, []);

  const unsavePlan = useCallback((id: string) => {
    setSavedPlans((prev) => {
      const next = removeSavedPlan(prev, id);
      writeSavedPlans(localStorage, next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (input: PlanInput) => isPlanSaved(savedPlans, input),
    [savedPlans]
  );

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem('ndc:favorites', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      location,
      locale,
      t,
      theme: prefs.theme,
      quiet: prefs.quiet,
      guide: prefs.guide && !prefs.quiet,
      status,
      savedPlans,
      savedCount: savedPlans.length,
      favorites,
      navigate,
      setTheme,
      setQuiet,
      setGuide,
      setLocale,
      savePlan,
      unsavePlan,
      isSaved,
      toggleFavorite,
    }),
    [
      favorites,
      isSaved,
      locale,
      location,
      navigate,
      prefs.guide,
      prefs.quiet,
      prefs.theme,
      savePlan,
      savedPlans,
      setGuide,
      setLocale,
      setQuiet,
      setTheme,
      status,
      t,
      toggleFavorite,
      unsavePlan,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
