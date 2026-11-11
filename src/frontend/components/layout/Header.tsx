import { Bookmark, Menu, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { hrefFor, withLocale } from '../../app/router.ts';
import { useApp } from '../../app/AppContext.tsx';
import { encodePlanInput } from '../../../lib/share.ts';
import { StatusPill } from '../ui/StatusPill.tsx';
import { Popover } from '../ui/Popover.tsx';
import { cx } from '../../design/cx.ts';

export function Header() {
  const {
    t,
    locale,
    status,
    navigate,
    theme,
    setTheme,
    quiet,
    setQuiet,
    guide,
    setGuide,
    setLocale,
    savedPlans,
    savedCount,
    unsavePlan,
  } = useApp();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/#exhibits', label: t('nav.exhibits') },
    { href: '/#planner', label: t('nav.planner') },
    { href: '/#visit', label: t('nav.visit') },
    { href: withLocale('/quality', locale), label: t('nav.quality') },
  ];

  return (
    <header className="sticky top-0 z-40">
      <a
        href="#main-content"
        className="skip-link"
      >
        {t('nav.skip')}
      </a>
      <div className="mx-auto mt-3 flex w-[min(72rem,calc(100%-1.5rem))] flex-wrap items-center gap-2 rounded-lg border border-hairline bg-[color-mix(in_srgb,var(--surface-1)_86%,transparent)] px-3 py-2 backdrop-blur-md">
        <button
          type="button"
          className="font-display text-lg tracking-tight"
          onClick={() => navigate(withLocale('/', locale))}
        >
          Northside
        </button>
        <StatusPill
          open={status.open}
          message={status.message[locale]}
          openLabel={t('nav.openNow')}
          closedLabel={t('nav.closed')}
        />
        <nav
          className={cx(
            'ml-auto items-center gap-1',
            locale === 'ta' ? 'hidden xl:flex' : 'hidden md:flex'
          )}
          aria-label={t('nav.menu')}
        >
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              className="touch-target rounded-md px-3 text-sm text-text-muted hover:text-text"
              onClick={() => navigate(link.href)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <Popover label={t('nav.myPlans')} icon={<Bookmark size={16} aria-hidden="true" />}>
          <p className="small-caps mb-3">
            {t('saved.heading')} · {savedCount}
          </p>
          {savedPlans.length === 0 ? (
            <p className="text-sm text-text-muted">{t('saved.empty')}</p>
          ) : (
            <ul className="space-y-2">
              {savedPlans.map((plan) => (
                <li key={plan.id} className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left text-sm hover:text-lantern"
                    data-popover-close
                    onClick={() =>
                      navigate(
                        `${withLocale('/plan', locale)}?${encodePlanInput(plan.input).toString()}`
                      )
                    }
                  >
                    {plan.title}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-text-muted hover:text-danger"
                    onClick={() => unsavePlan(plan.id)}
                  >
                    {t('saved.remove')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Popover>
        <Popover
          label={t('nav.preferences')}
          icon={<Settings2 size={16} aria-hidden="true" />}
        >
          <fieldset className="space-y-2">
            <legend className="small-caps mb-2">{t('prefs.theme')}</legend>
            {(['system', 'dark', 'light'] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === value}
                  onChange={() => setTheme(value)}
                />
                {t(
                  value === 'system'
                    ? 'prefs.theme.system'
                    : value === 'dark'
                      ? 'prefs.theme.dark'
                      : 'prefs.theme.light'
                )}
              </label>
            ))}
          </fieldset>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={quiet}
              onChange={(e) => setQuiet(e.target.checked)}
            />
            {t('prefs.quiet')}
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={guide}
              disabled={quiet}
              onChange={(e) => setGuide(e.target.checked)}
            />
            {quiet ? t('nav.guide.offQuiet') : t('prefs.guide')}
          </label>
          <fieldset className="mt-4 space-y-2">
            <legend className="small-caps mb-2">{t('prefs.language')}</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={locale === 'en'} onChange={() => setLocale('en')} />
              {t('prefs.language.en')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={locale === 'ta'} onChange={() => setLocale('ta')} />
              {t('prefs.language.ta')}
            </label>
          </fieldset>
        </Popover>
        <button
          type="button"
          className={cx(
            'touch-target grid place-items-center rounded-md',
            locale === 'ta' ? 'xl:hidden' : 'md:hidden'
          )}
          aria-label={open ? t('nav.close') : t('nav.menu')}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div
          className={cx(
            'mx-auto mt-2 w-[min(72rem,calc(100%-1.5rem))] rounded-md border border-hairline bg-surface-1 p-3',
            locale === 'ta' ? 'xl:hidden' : 'md:hidden'
          )}
        >
          {links.map((link) => (
            <button
              key={link.href}
              type="button"
              className={cx('block w-full rounded-sm px-3 py-3 text-left')}
              onClick={() => {
                navigate(link.href);
                setOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function Footer() {
  const { t, locale, navigate } = useApp();
  const year = new Date().getFullYear();
  const items = [
    { path: hrefFor({ name: 'accessibility' }, locale), label: t('footer.accessibility') },
    { path: hrefFor({ name: 'privacy' }, locale), label: t('footer.privacy') },
    { path: hrefFor({ name: 'quality' }, locale), label: t('footer.quality') },
    { path: hrefFor({ name: 'offline' }, locale), label: t('footer.offline') },
  ];
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto flex w-[min(72rem,calc(100%-2rem))] flex-col gap-6 py-12 sm:flex-row sm:justify-between">
        <div>
          <p className="font-display text-2xl">Northside Discovery Centre</p>
          <p className="mt-2 text-sm text-text-muted">{t('footer.tagline')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('footer.hours')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('footer.admissions')}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              className="text-left text-text-muted hover:text-lantern"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <p className="border-t border-hairline py-6 text-center text-xs text-text-muted">
        © {year} {t('footer.rights')}
      </p>
    </footer>
  );
}
