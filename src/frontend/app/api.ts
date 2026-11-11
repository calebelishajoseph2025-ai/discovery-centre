import { Plan, buildPlan } from '../../lib/plan-engine.ts';
import { PlanInput } from '../../lib/schemas.ts';
import { StatusResult, getStatus } from '../../lib/status.ts';
import { PricingQuote } from '../../lib/pricing.ts';
import { BestArrivalResult } from '../../lib/busyness.ts';
import { Exhibit } from '../../content/exhibits.ts';
import { FAQItem } from '../../content/faq.ts';
import { FeedbackSummaryResult } from '../../store/types.ts';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message = `Request failed (${status})`) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 8000, ...rest } = init;
  const controller = new AbortController();
  const outer = rest.signal;
  if (outer) {
    if (outer.aborted) controller.abort();
    else outer.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(rest.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    const res = await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new ApiError(res.status);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function getCentreStatus(at?: string): Promise<StatusResult> {
  try {
    const q = at ? `?at=${encodeURIComponent(at)}` : '';
    return await fetchJson<StatusResult>(`/api/status${q}`, { timeoutMs: 2500 });
  } catch {
    return getStatus(at ? new Date(at) : new Date());
  }
}

export async function getTicketQuote(
  adults: number,
  children: number
): Promise<PricingQuote | null> {
  try {
    return await fetchJson<PricingQuote>(
      `/api/tickets/quote?adults=${adults}&children=${children}`,
      { timeoutMs: 2500 }
    );
  } catch {
    return null;
  }
}

export async function postPlan(
  input: PlanInput,
  signal?: AbortSignal
): Promise<Plan> {
  const data = await fetchJson<{ plan: Plan }>('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    timeoutMs: 1500,
    signal,
  });
  return data.plan;
}

export function localPlan(input: PlanInput): Plan {
  return buildPlan(input);
}

export async function getFavourites(): Promise<Record<string, number> | null> {
  try {
    const data = await fetchJson<{
      available: boolean;
      counts: Record<string, number>;
    }>('/api/favourites', { timeoutMs: 2500 });
    if (!data.available) return null;
    return data.counts;
  } catch {
    return null;
  }
}

export async function adjustFavourite(
  slug: string,
  action: 'add' | 'remove'
): Promise<number | null> {
  try {
    const data = await fetchJson<{ count: number }>(`/api/favourites/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
      timeoutMs: 2500,
    });
    return data.count;
  } catch {
    return null;
  }
}

export async function getFeedbackSummary(): Promise<FeedbackSummaryResult> {
  try {
    return await fetchJson<FeedbackSummaryResult>('/api/feedback/summary', {
      timeoutMs: 2500,
    });
  } catch {
    return { available: false, total: 0, helpfulPct: null };
  }
}

export async function submitFeedback(body: unknown): Promise<boolean> {
  try {
    await fetchJson('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeoutMs: 4000,
    });
    return true;
  } catch {
    return false;
  }
}

export async function createShortPlan(
  input: PlanInput,
  locale: 'en' | 'ta'
): Promise<{ code: string; path: string } | null> {
  try {
    return await fetchJson<{ code: string; path: string; expiresAt: string }>(
      '/api/plan/short',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, locale }),
        timeoutMs: 4000,
      }
    );
  } catch {
    return null;
  }
}

export async function getShortPlan(
  code: string
): Promise<{ input: PlanInput; locale?: 'en' | 'ta' } | null> {
  try {
    return await fetchJson<{ input: PlanInput; locale?: 'en' | 'ta' }>(
      `/api/plan/short/${code}`,
      { timeoutMs: 4000 }
    );
  } catch {
    return null;
  }
}

export async function getBestTime(
  dayOfWeek: number,
  duration: number
): Promise<{ suggestion: BestArrivalResult } | null> {
  try {
    return await fetchJson(`/api/best-time?dayOfWeek=${dayOfWeek}&duration=${duration}`, {
      timeoutMs: 2500,
    });
  } catch {
    return null;
  }
}

export async function getFaqs(q?: string): Promise<FAQItem[] | null> {
  try {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    const data = await fetchJson<{ faqs: FAQItem[] }>(`/api/faq${query}`, {
      timeoutMs: 2500,
    });
    return data.faqs;
  } catch {
    return null;
  }
}

export async function getExhibit(slug: string): Promise<Exhibit | null> {
  try {
    return await fetchJson<Exhibit>(`/api/exhibits/${slug}`, { timeoutMs: 2500 });
  } catch {
    return null;
  }
}

export function icsUrlFromInput(input: PlanInput): string {
  const params = new URLSearchParams();
  params.set('time', String(input.timeMinutes));
  if (input.interests?.length) params.set('interests', [...input.interests].sort().join(','));
  params.set('adults', String(input.adults ?? 1));
  if (input.children) params.set('children', String(input.children));
  if (input.stepFree) params.set('stepFree', '1');
  if (input.arrival && input.arrival !== '10:00') params.set('arrival', input.arrival);
  if (input.date) params.set('date', input.date);
  if (input.quiet) params.set('quiet', '1');
  return `/api/plan/ics?${params.toString()}`;
}
