import { Locale } from '../../i18n/config.ts';

export type RouteName =
  | 'home'
  | 'plan'
  | 'short'
  | 'exhibit'
  | 'accessibility'
  | 'privacy'
  | 'quality'
  | 'offline'
  | 'notfound';

export type AppRoute =
  | { name: 'home' }
  | { name: 'plan' }
  | { name: 'short'; code: string }
  | { name: 'exhibit'; slug: string }
  | { name: 'accessibility' }
  | { name: 'privacy' }
  | { name: 'quality' }
  | { name: 'offline' }
  | { name: 'notfound' };

export interface ParsedLocation {
  locale: Locale;
  route: AppRoute;
  pathname: string;
  search: string;
  hash: string;
}

export function stripLocalePrefix(pathname: string): { locale: Locale; rest: string } {
  if (pathname === '/ta' || pathname.startsWith('/ta/')) {
    const rest = pathname.slice(3) || '/';
    return { locale: 'ta', rest: rest.startsWith('/') ? rest : `/${rest}` };
  }
  return { locale: 'en', rest: pathname || '/' };
}

export function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

export function parsePath(pathname: string): { locale: Locale; route: AppRoute } {
  const { locale, rest } = stripLocalePrefix(normalizePath(pathname));
  const path = normalizePath(rest);

  if (path === '/') return { locale, route: { name: 'home' } };
  if (path === '/plan') return { locale, route: { name: 'plan' } };
  if (path.startsWith('/p/')) {
    const code = path.slice(3).split('/')[0] ?? '';
    if (!code) return { locale, route: { name: 'notfound' } };
    return { locale, route: { name: 'short', code } };
  }
  if (path.startsWith('/exhibits/') || path.startsWith('/exhibit/')) {
    const prefix = path.startsWith('/exhibits/') ? '/exhibits/' : '/exhibit/';
    const slug = path.slice(prefix.length).split('/')[0] ?? '';
    if (!slug) return { locale, route: { name: 'notfound' } };
    return { locale, route: { name: 'exhibit', slug } };
  }
  if (path === '/accessibility') return { locale, route: { name: 'accessibility' } };
  if (path === '/privacy') return { locale, route: { name: 'privacy' } };
  if (path === '/quality') return { locale, route: { name: 'quality' } };
  if (path === '/offline') return { locale, route: { name: 'offline' } };
  return { locale, route: { name: 'notfound' } };
}

export function parseLocation(
  pathname: string,
  search = '',
  hash = ''
): ParsedLocation {
  const { locale, route } = parsePath(pathname);
  return {
    locale,
    route,
    pathname: normalizePath(pathname),
    search,
    hash,
  };
}

export function withLocale(path: string, locale: Locale): string {
  if (path.startsWith('/p/')) return path;
  if (path.startsWith('#')) return path;
  const { rest } = stripLocalePrefix(path);
  if (locale === 'ta') {
    return rest === '/' ? '/ta' : `/ta${rest}`;
  }
  return rest;
}

export function hrefFor(
  route: AppRoute,
  locale: Locale,
  search = '',
  hash = ''
): string {
  let path = '/';
  switch (route.name) {
    case 'home':
      path = '/';
      break;
    case 'plan':
      path = '/plan';
      break;
    case 'short':
      path = `/p/${route.code}`;
      break;
    case 'exhibit':
      path = `/exhibits/${route.slug}`;
      break;
    case 'accessibility':
      path = '/accessibility';
      break;
    case 'privacy':
      path = '/privacy';
      break;
    case 'quality':
      path = '/quality';
      break;
    case 'offline':
      path = '/offline';
      break;
    case 'notfound':
      path = '/';
      break;
  }
  const localized = withLocale(path, locale);
  return `${localized}${search}${hash}`;
}

export function isHashNav(path: string): boolean {
  return path.startsWith('#') || path.startsWith('/#') || path.includes('/#');
}
