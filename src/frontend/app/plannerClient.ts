import { Plan } from '../../lib/plan-engine.ts';
import { PlanInput } from '../../lib/schemas.ts';
import { localPlan, postPlan } from './api.ts';

export { localPlan };

export const PLANNER_DEBOUNCE_MS = 400;
export const PLANNER_SPINNER_MS = 150;
export const PLANNER_API_TIMEOUT_MS = 1500;

export interface PlannerResolveOptions {
  post?: typeof postPlan;
  local?: typeof localPlan;
  now?: () => number;
}

export async function resolvePlan(
  input: PlanInput,
  signal?: AbortSignal,
  options: PlannerResolveOptions = {}
): Promise<{ plan: Plan; source: 'api' | 'local' }> {
  const post = options.post ?? postPlan;
  const local = options.local ?? localPlan;
  const fallback = local(input);

  try {
    const plan = await post(input, signal);
    return { plan, source: 'api' };
  } catch {
    return { plan: fallback, source: 'local' };
  }
}

export function withSpinnerBudget<T>(
  promise: Promise<T>,
  fallback: T,
  budgetMs: number = PLANNER_SPINNER_MS,
  wait: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms))
): Promise<{ value: T; fromFallback: boolean }> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ value: fallback, fromFallback: true });
      }
    }, budgetMs);

    promise
      .then(async (value) => {
        if (settled) {
          resolve({ value, fromFallback: false });
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve({ value, fromFallback: false });
      })
      .catch((err: unknown) => {
        if (settled) {
          resolve({ value: fallback, fromFallback: true });
          return;
        }
        settled = true;
        clearTimeout(timer);
        reject(err);
      });

    void wait;
  });
}
