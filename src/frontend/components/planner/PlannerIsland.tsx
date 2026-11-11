import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlanInput } from '../../../lib/schemas.ts';
import { Plan, Reason, Warning } from '../../../lib/plan-engine.ts';
import { encodePlanInput } from '../../../lib/share.ts';
import { toICS } from '../../../lib/ics.ts';
import { bestArrival } from '../../../lib/busyness.ts';
import { CENTRE_FACTS } from '../../../content/centre.ts';
import { Dictionary } from '../../../i18n/dictionaries/en.ts';
import {
  composePlanInput,
  interestsFromFavorites,
  planSourceKey,
} from '../../app/planInput.ts';
import { planIdentity } from '../../app/savedPlans.ts';
import { useApp } from '../../app/AppContext.tsx';
import { hrefFor, withLocale } from '../../app/router.ts';
import { createShortPlan, icsUrlFromInput } from '../../app/api.ts';
import {
  PLANNER_DEBOUNCE_MS,
  localPlan,
  resolvePlan,
} from '../../app/plannerClient.ts';
import { accentVar } from '../../design/accent.ts';
import { Button } from '../ui/Button.tsx';
import { Chip } from '../ui/Chip.tsx';
import { Stepper } from '../ui/Stepper.tsx';
import { Disclosure } from '../ui/Disclosure.tsx';
import { SectionHeader } from '../ui/SectionHeader.tsx';
import { submitFeedback } from '../../app/api.ts';

const INTERESTS = ['light', 'art', 'family', 'building', 'hands-on', 'space', 'calm', 'sound', 'nature'];

function reasonText(
  t: (key: keyof Dictionary, params?: Record<string, string | number>) => string,
  reason: Reason
): string {
  const key = `reason.${reason.code}` as keyof Dictionary;
  return t(key, reason.params);
}

function warningText(
  t: (key: keyof Dictionary, params?: Record<string, string | number>) => string,
  warning: Warning
): string {
  const key = `warning.${warning.code}` as keyof Dictionary;
  return t(key, warning.params);
}

export function PlannerIsland({ initial }: { initial?: Partial<PlanInput> }) {
  const {
    t,
    locale,
    quiet,
    setQuiet,
    navigate,
    savePlan,
    unsavePlan,
    isSaved,
    favorites,
  } = useApp();
  const [input, setInput] = useState<PlanInput>(() =>
    composePlanInput(initial, quiet, favorites)
  );
  const [plan, setPlan] = useState<Plan | null>(() => localPlan(composePlanInput(initial, quiet, favorites)));
  const [copyMsg, setCopyMsg] = useState('');
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [comment, setComment] = useState('');
  const liveRef = useRef<HTMLParagraphElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const interestsTouched = useRef(Boolean(initial?.interests?.length));
  const incomingKey = initial ? planSourceKey(initial) : '';

  useEffect(() => {
    if (!initial || !incomingKey) return;
    interestsTouched.current = true;
    const next = composePlanInput(initial, quiet);
    setInput(next);
    setPlan(localPlan(next));
  }, [incomingKey]);

  useEffect(() => {
    setInput((prev) => (prev.quiet === quiet ? prev : { ...prev, quiet }));
  }, [quiet]);

  useEffect(() => {
    if (initial) return;
    if (interestsTouched.current) return;
    const seeded = interestsFromFavorites(favorites);
    setInput((prev) => {
      const next = seeded.join(',');
      const cur = [...prev.interests].sort().join(',');
      return next === cur ? prev : { ...prev, interests: seeded };
    });
  }, [favorites, initial]);

  useEffect(() => {
    abortRef.current?.abort();
    const handle = window.setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      void resolvePlan(input, controller.signal).then(({ plan: next }) => {
        if (!controller.signal.aborted) {
          setPlan(next);
        }
      });
    }, PLANNER_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(handle);
      abortRef.current?.abort();
    };
  }, [input]);

  const saved = isSaved(input);
  const shareHref = useMemo(() => {
    const qs = encodePlanInput(input).toString();
    return `${withLocale('/plan', locale)}?${qs}`;
  }, [input, locale]);

  const onCopy = async () => {
    const short = await createShortPlan(input, locale);
    const url = short
      ? `${window.location.origin}${short.path}`
      : `${window.location.origin}${shareHref}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyMsg(short ? t('planner.actions.copied') : t('planner.actions.shortFallback'));
    } catch {
      setCopyMsg(t('planner.actions.shortFallback'));
    }
  };

  const onCalendar = () => {
    if (!plan) return;
    const ics = toICS(plan, input.date);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'northside-visit.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSuggest = () => {
    const day = input.date ? new Date(`${input.date}T12:00:00`).getDay() : 2;
    const result = bestArrival({ dayOfWeek: day, durationMinutes: input.timeMinutes });
    if (!result.open) {
      setCopyMsg(t('planner.monday'));
      return;
    }
    setInput((prev) => ({ ...prev, arrival: result.arrival }));
    setCopyMsg(t('planner.suggest.applied', { arrival: result.arrival, label: result.label }));
  };

  const onFeedback = async (helpful: boolean, event: FormEvent) => {
    event.preventDefault();
    const ok = await submitFeedback({
      helpful,
      comment: comment || undefined,
      plan: input,
      locale,
      quiet: input.quiet,
    });
    setFeedbackDone(ok);
  };

  return (
    <section id="planner" className="mx-auto w-[min(90rem,calc(100%-2rem))] py-24">
      <div className="no-print">
        <SectionHeader
          index="04"
          eyebrow={t('planner.badge')}
          title={t('planner.title')}
          subtitle={t('planner.subtitle')}
        />
      </div>
      <p ref={liveRef} className="sr-only" aria-live="polite">
        {plan ? t('planner.live') : t('common.loading')}
      </p>
      <div className="planner-grid grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <form
          className="no-print rounded-lg border border-hairline bg-surface-1 p-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <p className="small-caps">{t('planner.console')}</p>
          <label className="mt-4 block text-sm">
            {t('planner.time.label')}
            <input
              type="range"
              min={20}
              max={300}
              step={5}
              value={input.timeMinutes}
              onChange={(e) =>
                setInput((p) => ({ ...p, timeMinutes: Number(e.target.value) }))
              }
              className="mt-2 w-full accent-[var(--lantern)]"
            />
            <span className="mt-1 block font-mono text-xs text-lantern">
              {t('planner.time.slider', { minutes: input.timeMinutes })}
            </span>
          </label>
          <fieldset className="mt-5">
            <legend className="text-sm">{t('planner.interests.label')}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip
                selected={input.interests.length === 0}
                onClick={() => {
                  interestsTouched.current = true;
                  setInput((p) => ({ ...p, interests: [] }));
                }}
              >
                {t('planner.interests.surprise')}
              </Chip>
              {INTERESTS.map((tag) => (
                <Chip
                  key={tag}
                  selected={input.interests.includes(tag)}
                  onClick={() => {
                    interestsTouched.current = true;
                    setInput((p) => ({
                      ...p,
                      interests: p.interests.includes(tag)
                        ? p.interests.filter((i) => i !== tag)
                        : [...p.interests, tag],
                    }));
                  }}
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </fieldset>
          <div className="mt-5 space-y-2">
            <p className="text-sm">{t('planner.party.label')}</p>
            <Stepper
              label={t('planner.party.adults')}
              value={input.adults}
              min={1}
              max={10}
              onChange={(adults) => setInput((p) => ({ ...p, adults }))}
              decreaseLabel={t('common.decrease')}
              increaseLabel={t('common.increase')}
            />
            <Stepper
              label={t('planner.party.children')}
              value={input.children ?? 0}
              min={0}
              max={10}
              onChange={(children) => setInput((p) => ({ ...p, children }))}
              decreaseLabel={t('common.decrease')}
              increaseLabel={t('common.increase')}
            />
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm leading-snug">
            <input
              type="checkbox"
              checked={input.stepFree}
              onChange={(e) => setInput((p) => ({ ...p, stepFree: e.target.checked }))}
            />
            {t('planner.stepFree.label')}
          </label>
          <label className="mt-3 block text-sm">
            {t('planner.arrival.label')}
            <input
              type="time"
              min="10:00"
              max="16:40"
              value={input.arrival}
              onChange={(e) => setInput((p) => ({ ...p, arrival: e.target.value }))}
              className="mt-1 w-full rounded-sm border border-hairline bg-surface-2 px-3 py-2"
            />
          </label>
          <label className="mt-3 block text-sm">
            {t('planner.date.label')}
            <input
              type="date"
              value={input.date ?? ''}
              onChange={(e) =>
                setInput((p) => ({ ...p, date: e.target.value || undefined }))
              }
              className="mt-1 w-full rounded-sm border border-hairline bg-surface-2 px-3 py-2"
            />
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm leading-snug">
            <input
              type="checkbox"
              checked={input.quiet}
              onChange={(e) => {
                setQuiet(e.target.checked);
                setInput((p) => ({ ...p, quiet: e.target.checked }));
              }}
            />
            {t('planner.quiet.label')}
          </label>
          <Button variant="secondary" className="mt-4 w-full" onClick={onSuggest}>
            {t('planner.suggestTime')}
          </Button>
        </form>

        <div
          id="print-plan"
          className="rounded-lg border border-hairline bg-surface-1 p-5 print-break-inside"
        >
          <div className="print-only hidden border-b border-hairline pb-4">
            <p className="font-display text-3xl">{CENTRE_FACTS.name[locale]}</p>
            <p className="mt-1 text-sm">{t('hero.facts.address')}</p>
            <p className="text-sm">{t('hero.facts.hours')}</p>
            <p className="mt-3 font-display text-xl">{t('plan.pageTitle')}</p>
          </div>
          {!plan || plan.stops.length === 0 ? (
            <p className="text-text-muted">{t('planner.empty')}</p>
          ) : (
            <>
              <p className="font-display text-2xl">
                {t('planner.output.summary', {
                  count: plan.stops.length,
                  time: input.timeMinutes,
                  used: plan.totalMinutes,
                  spare: plan.spareMinutes,
                })}
              </p>
              <p className="mt-2 text-sm text-lantern">
                {t('planner.output.cost', { cost: plan.estimatedCostINR })}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full bg-lantern"
                  style={{
                    width: `${Math.min(100, (plan.totalMinutes / input.timeMinutes) * 100)}%`,
                  }}
                />
              </div>
              <ol className="relative mt-8 space-y-0">
                {plan.stops.map((stop, i) => (
                  <li key={`${stop.slug}-${stop.start}`} className="relative pl-6">
                    <span
                      className="absolute left-0 top-1.5 h-3 w-3 rounded-full"
                      style={{ background: accentVar(stop.accentToken, stop.slug) }}
                    />
                    {i < plan.stops.length - 1 ? (
                      <span className="absolute left-[5px] top-5 h-[calc(100%-4px)] w-px bg-hairline" />
                    ) : null}
                    <button
                      type="button"
                      className="text-left"
                      onClick={() =>
                        navigate(hrefFor({ name: 'exhibit', slug: stop.slug }, locale))
                      }
                    >
                      <p className="font-mono text-xs text-text-muted">
                        {stop.start}–{stop.end} · {stop.durationMinutes} min
                      </p>
                      <p className="font-display text-xl">{stop.name}</p>
                      <p className="text-xs text-text-muted">
                        {stop.reasons.map((r) => reasonText(t, r)).join(' · ')}
                      </p>
                    </button>
                    {i < plan.stops.length - 1 ? (
                      <p className="py-2 font-mono text-[11px] text-text-muted">
                        {t('planner.buffer')}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
              {plan.warnings.map((w) => (
                <p key={w.code} className="mt-3 text-sm text-ember">
                  {warningText(t, w)}
                </p>
              ))}
              <div className="no-print">
              <Disclosure title={t('explainer.title')}>
                <p>
                  {t('explainer.summary', {
                    used: plan.explain.usedMinutes,
                    capacity: plan.explain.capacityMinutes,
                    score: plan.explain.totalScore,
                  })}
                </p>
                <p className="mt-2">
                  {plan.explain.totalScore > plan.explain.greedyScore
                    ? t('explainer.comparison.better', {
                        totalScore: plan.explain.totalScore,
                        greedyScore: plan.explain.greedyScore,
                      })
                    : t('explainer.comparison.same')}
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th>{t('explainer.th.exhibit')}</th>
                        <th>{t('explainer.th.duration')}</th>
                        <th>{t('explainer.th.score')}</th>
                        <th>{t('explainer.th.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.explain.considered.map((row) => (
                        <tr key={row.slug} className="border-t border-hairline">
                          <td className="py-2">{row.name}</td>
                          <td>{row.durationMinutes}</td>
                          <td>{row.score}</td>
                          <td>
                            {row.chosen
                              ? t('explainer.chosen')
                              : t(
                                  `explainer.reason.${row.droppedReason ?? 'BETTER_COMBINATION'}` as keyof Dictionary
                                )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Disclosure>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 no-print">
                <Button onClick={onCopy}>{t('planner.actions.share')}</Button>
                <Button variant="secondary" onClick={onCalendar}>
                  {t('planner.actions.calendar')}
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  {t('planner.actions.print')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => (saved ? unsavePlan(planIdentity(input)) : savePlan(input))}
                >
                  {saved ? t('planner.saved') : t('planner.save')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    interestsTouched.current = Boolean(initial);
                    setInput(composePlanInput(initial, quiet, initial ? [] : favorites));
                  }}
                >
                  {t('planner.actions.reset')}
                </Button>
                <a className="sr-only" href={icsUrlFromInput(input)}>
                  {t('planner.actions.calendar')}
                </a>
              </div>
              {copyMsg ? <p className="mt-3 text-sm text-verdigris">{copyMsg}</p> : null}
              <form
                data-component="feedback-widget"
                className="mt-8 border-t border-hairline pt-5 no-print"
                onSubmit={(e) => void onFeedback(true, e)}
              >
                <p>{t('feedback.question')}</p>
                <p className="mt-1 text-xs text-text-muted">{t('feedback.privacyNote')}</p>
                {feedbackDone ? (
                  <p className="mt-3 text-sm text-moss">{t('feedback.thanks')}</p>
                ) : (
                  <>
                    <label className="mt-3 block text-sm">
                      {t('feedback.noteLabel')}
                      <textarea
                        maxLength={280}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 w-full rounded-sm border border-hairline bg-surface-2 p-2"
                      />
                    </label>
                    <div className="mt-3 flex gap-2">
                      <Button type="submit">{t('feedback.yes')}</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={(e) => void onFeedback(false, e)}
                      >
                        {t('feedback.no')}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
