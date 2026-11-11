import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan } from '../../src/lib/plan-engine.ts';
import { quote } from '../../src/lib/pricing.ts';
import { getStatus } from '../../src/lib/status.ts';
import { encodePlanInput, decodePlanInput } from '../../src/lib/share.ts';
import { toICS } from '../../src/lib/ics.ts';
import { EXHIBITS } from '../../src/content/exhibits.ts';
import {
  applyDocumentPreferences,
  persistPreference,
  readPreferences,
  resolveTheme,
} from '../../src/frontend/app/preferences.ts';
import {
  defaultPlanTitle,
  isPlanSaved,
  planIdentity,
  readSavedPlans,
  removeSavedPlan,
  SAVED_PLANS_CAP,
  upsertSavedPlan,
  writeSavedPlans,
} from '../../src/frontend/app/savedPlans.ts';
import { hrefFor, parsePath, withLocale } from '../../src/frontend/app/router.ts';
import { socialProofView } from '../../src/frontend/app/socialProof.ts';
import { localPlan, resolvePlan } from '../../src/frontend/app/plannerClient.ts';
import { evaluateSkyQuality } from '../../src/frontend/sky/quality.ts';
import { resolveAccent } from '../../src/frontend/design/accent.ts';
import { filterExhibits, INTEREST_FILTERS } from '../../src/frontend/components/exhibits/exhibitFilter.ts';
import { PlanInput } from '../../src/lib/schemas.ts';
import {
  composePlanInput,
  interestsFromFavorites,
} from '../../src/frontend/app/planInput.ts';

class MemoryStore {
  map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

const baseInput = (over: Partial<PlanInput> = {}): PlanInput => ({
  timeMinutes: 90,
  interests: [],
  adults: 1,
  children: 0,
  stepFree: false,
  arrival: '10:00',
  quiet: false,
  ...over,
});

test('preferences: system + dark media resolves dark', () => {
  assert.equal(resolveTheme('system', true), 'dark');
});
test('preferences: system + light media resolves light', () => {
  assert.equal(resolveTheme('system', false), 'light');
});
test('preferences: explicit light wins over dark media', () => {
  assert.equal(resolveTheme('light', true), 'light');
});
test('preferences: explicit dark wins over light media', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
});
test('preferences: quiet from query string', () => {
  const prefs = readPreferences(null, { search: '?quiet=1', pathname: '/' });
  assert.equal(prefs.quiet, true);
});
test('preferences: quiet from storage', () => {
  const store = new MemoryStore();
  store.setItem('ndc:quiet', 'true');
  const prefs = readPreferences(store, { pathname: '/' });
  assert.equal(prefs.quiet, true);
});
test('preferences: /ta sets locale ta', () => {
  assert.equal(readPreferences(null, { pathname: '/ta' }).locale, 'ta');
});
test('preferences default theme is night', () => {
  assert.equal(readPreferences(null, { pathname: '/' }).theme, 'dark');
});
test('preferences: persist theme key', () => {
  const store = new MemoryStore();
  persistPreference(store, 'theme', 'dark');
  assert.equal(store.getItem('ndc:theme'), 'dark');
});
test('preferences: applyDocumentPreferences sets data-theme', () => {
  const el = { attributes: new Map<string, string>(), setAttribute(k: string, v: string) { this.attributes.set(k, v); }, removeAttribute(k: string) { this.attributes.delete(k); }, getAttribute(k: string) { return this.attributes.get(k) ?? null; }, lang: 'en' };
  const resolved = applyDocumentPreferences(
    { theme: 'dark', quiet: true, guide: true, locale: 'en' },
    false,
    el as unknown as HTMLElement
  );
  assert.equal(resolved, 'dark');
  assert.equal(el.getAttribute('data-theme'), 'dark');
  assert.equal(el.getAttribute('data-quiet'), 'true');
});

test('saved plans cap at 5', () => {
  let plans: ReturnType<typeof upsertSavedPlan> = [];
  for (let i = 0; i < 8; i += 1) {
    plans = upsertSavedPlan(plans, baseInput({ timeMinutes: 30 + i * 5 }));
  }
  assert.equal(plans.length, SAVED_PLANS_CAP);
});
test('saved plans newest first', () => {
  let plans = upsertSavedPlan([], baseInput({ timeMinutes: 30 }));
  plans = upsertSavedPlan(plans, baseInput({ timeMinutes: 60 }));
  assert.equal(plans[0].input.timeMinutes, 60);
});
test('saved plans identity stable', () => {
  const a = planIdentity(baseInput({ interests: ['space', 'calm'] }));
  const b = planIdentity(baseInput({ interests: ['calm', 'space'] }));
  assert.equal(a, b);
});
test('saved plans isPlanSaved', () => {
  const input = baseInput({ timeMinutes: 75 });
  const plans = upsertSavedPlan([], input);
  assert.equal(isPlanSaved(plans, input), true);
});
test('saved plans remove', () => {
  const input = baseInput({ timeMinutes: 80 });
  let plans = upsertSavedPlan([], input);
  plans = removeSavedPlan(plans, planIdentity(input));
  assert.equal(plans.length, 0);
});
test('saved plans roundtrip storage', () => {
  const store = new MemoryStore();
  const plans = upsertSavedPlan([], baseInput({ timeMinutes: 100 }));
  writeSavedPlans(store, plans);
  const read = readSavedPlans(store);
  assert.equal(read.length, 1);
  assert.equal(read[0].input.timeMinutes, 100);
});
test('saved plans title includes minutes', () => {
  assert.match(defaultPlanTitle(baseInput({ timeMinutes: 45 })), /45/);
});
test('saved plans corrupt json yields empty', () => {
  const store = new MemoryStore();
  store.setItem('ndc:plans:v1', '{not json');
  assert.deepEqual(readSavedPlans(store), []);
});

const routes: Array<[string, string]> = [
  ['/', 'home'],
  ['/ta', 'home'],
  ['/plan', 'plan'],
  ['/ta/plan', 'plan'],
  ['/p/abcdef', 'short'],
  ['/exhibits/sky-room', 'exhibit'],
  ['/ta/exhibits/light-lab', 'exhibit'],
  ['/accessibility', 'accessibility'],
  ['/privacy', 'privacy'],
  ['/quality', 'quality'],
  ['/offline', 'offline'],
  ['/nope', 'notfound'],
];
for (const [path, name] of routes) {
  test(`router parses ${path} as ${name}`, () => {
    assert.equal(parsePath(path).route.name, name);
  });
}
test('router withLocale prefixes Tamil', () => {
  assert.equal(withLocale('/quality', 'ta'), '/ta/quality');
});
test('router short links stay unprefixed', () => {
  assert.equal(withLocale('/p/abcdef', 'ta'), '/p/abcdef');
});
test('router hrefFor exhibit', () => {
  assert.equal(hrefFor({ name: 'exhibit', slug: 'sky-room' }, 'en'), '/exhibits/sky-room');
});

test('social proof hidden when unavailable', () => {
  assert.equal(socialProofView({ available: false, total: 0, helpfulPct: null }).kind, 'hidden');
});
test('social proof k of n under 20', () => {
  const view = socialProofView({ available: true, total: 6, helpfulPct: 83 });
  assert.equal(view.kind, 'kofn');
  if (view.kind === 'kofn') {
    assert.equal(view.n, 6);
    assert.equal(view.k, 5);
  }
});
test('social proof percentage at 20', () => {
  const view = socialProofView({ available: true, total: 20, helpfulPct: 90 });
  assert.equal(view.kind, 'pct');
});
test('social proof hidden when pct null', () => {
  assert.equal(socialProofView({ available: true, total: 3, helpfulPct: null }).kind, 'hidden');
});

for (const filter of INTEREST_FILTERS) {
  test(`exhibit filter ${filter} returns array`, () => {
    const result = filterExhibits(EXHIBITS, filter);
    assert.ok(Array.isArray(result));
    assert.ok(result.length >= 1 || filter !== 'all');
  });
}
test('exhibit filter calm includes sky-room', () => {
  assert.ok(filterExhibits(EXHIBITS, 'calm').some((e) => e.slug === 'sky-room'));
});
test('exhibit filter light includes light-lab', () => {
  assert.ok(filterExhibits(EXHIBITS, 'light').some((e) => e.slug === 'light-lab'));
});

test('sky quality off when hidden', () => {
  assert.equal(
    evaluateSkyQuality({
      reducedMotion: false,
      quiet: false,
      saveData: false,
      hardwareConcurrency: 8,
      webgl: true,
      hidden: true,
      inView: true,
    }),
    'off'
  );
});
test('sky quality css when quiet', () => {
  assert.equal(
    evaluateSkyQuality({
      reducedMotion: false,
      quiet: true,
      saveData: false,
      hardwareConcurrency: 8,
      webgl: true,
      hidden: false,
      inView: true,
    }),
    'css'
  );
});
test('sky quality css without webgl', () => {
  assert.equal(
    evaluateSkyQuality({
      reducedMotion: false,
      quiet: false,
      saveData: false,
      hardwareConcurrency: 8,
      webgl: false,
      hidden: false,
      inView: true,
    }),
    'css'
  );
});
test('sky quality low on saveData', () => {
  assert.equal(
    evaluateSkyQuality({
      reducedMotion: false,
      quiet: false,
      saveData: true,
      hardwareConcurrency: 8,
      webgl: true,
      hidden: false,
      inView: true,
    }),
    'low'
  );
});
test('sky quality high on capable device', () => {
  assert.equal(
    evaluateSkyQuality({
      reducedMotion: false,
      quiet: false,
      saveData: false,
      hardwareConcurrency: 8,
      webgl: true,
      hidden: false,
      inView: true,
    }),
    'high'
  );
});

test('accent maps light-lab to lantern', () => {
  assert.equal(resolveAccent(undefined, 'light-lab'), 'lantern');
});
test('accent maps build-bench to ember', () => {
  assert.equal(resolveAccent(undefined, 'build-bench'), 'ember');
});
test('accent maps sky-room to dusk-rose', () => {
  assert.equal(resolveAccent(undefined, 'sky-room'), 'dusk-rose');
});
test('accent maps echo-tunnel to verdigris', () => {
  assert.equal(resolveAccent(undefined, 'echo-tunnel'), 'verdigris');
});
test('accent maps garden-trail to moss', () => {
  assert.equal(resolveAccent(undefined, 'garden-trail'), 'moss');
});
test('accent token names pass through', () => {
  assert.equal(resolveAccent('lantern'), 'lantern');
});

const budgets = [20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 105, 120, 150, 180, 210, 240, 270, 300];
for (const timeMinutes of budgets) {
  test(`planner local fallback stays in budget at ${timeMinutes}m`, () => {
    const plan = localPlan(baseInput({ timeMinutes }));
    assert.ok(plan.totalMinutes <= timeMinutes);
    assert.ok(plan.stops.every((s) => s.end <= '17:00'));
  });
}

test('resolvePlan uses local when post fails', async () => {
  const { source } = await resolvePlan(baseInput(), undefined, {
    post: async () => {
      throw new Error('offline');
    },
  });
  assert.equal(source, 'local');
});
test('resolvePlan uses api when post succeeds', async () => {
  const local = buildPlan(baseInput());
  const { source, plan } = await resolvePlan(baseInput(), undefined, {
    post: async () => local,
  });
  assert.equal(source, 'api');
  assert.equal(plan.stops.length, local.stops.length);
});

test('share roundtrip keeps quiet flag', () => {
  const encoded = encodePlanInput(baseInput({ quiet: true, children: 2 }));
  const decoded = decodePlanInput(encoded);
  assert.equal(decoded.success, true);
  assert.equal(decoded.data?.quiet, true);
  assert.equal(decoded.data?.children, 2);
});
test('ics contains Kolkata timezone', () => {
  const ics = toICS(buildPlan(baseInput({ timeMinutes: 90 })));
  assert.match(ics, /TZID:Asia\/Kolkata/);
  assert.match(ics, /18 Garden Road/);
  assert.match(ics, /Riverdale/);
});

const statusCases: Array<[string, boolean]> = [
  ['2026-11-10T10:00:00+05:30', true],
  ['2026-11-10T09:59:59+05:30', false],
  ['2026-11-10T16:59:59+05:30', true],
  ['2026-11-10T17:00:00+05:30', false],
  ['2026-11-09T12:00:00+05:30', false],
  ['2026-11-11T11:00:00+05:30', true],
  ['2026-11-14T10:00:00+05:30', true],
  ['2026-11-15T16:00:00+05:30', true],
];
for (const [iso, open] of statusCases) {
  test(`status ${iso} open=${open}`, () => {
    assert.equal(getStatus(new Date(iso)).open, open);
  });
}

const quotes: Array<[number, number, number]> = [
  [1, 0, 100],
  [1, 1, 150],
  [2, 2, 300],
  [3, 1, 350],
  [4, 0, 400],
  [2, 3, 350],
];
for (const [a, c, total] of quotes) {
  test(`quote ${a} adults ${c} children = INR ${total}`, () => {
    assert.equal(quote(a, c).total, total);
  });
}

test('composePlanInput applies a saved 45-minute query over the 250-minute draft', () => {
  const next = composePlanInput(
    { timeMinutes: 45, adults: 2, children: 3, stepFree: true, date: '2026-11-12' },
    false
  );
  assert.equal(next.timeMinutes, 45);
  assert.equal(next.children, 3);
  assert.equal(next.stepFree, true);
  assert.equal(next.date, '2026-11-12');
});
test('favorites seed planner interest tags', () => {
  const tags = interestsFromFavorites(['light-lab', 'build-bench']);
  assert.ok(tags.includes('light'));
  assert.ok(tags.includes('building'));
  const composed = composePlanInput(undefined, false, ['sky-room']);
  assert.deepEqual(composed.interests, ['calm', 'space']);
});
test('explicit interests win over favourite seeding', () => {
  const composed = composePlanInput({ interests: ['sound'] }, false, ['sky-room']);
  assert.deepEqual(composed.interests, ['sound']);
});
test('content accents are token names', () => {
  for (const ex of EXHIBITS) {
    assert.ok(['lantern', 'ember', 'dusk-rose', 'verdigris', 'moss'].includes(ex.accentToken));
  }
});
