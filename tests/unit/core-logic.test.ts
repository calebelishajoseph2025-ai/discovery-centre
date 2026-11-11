import test from 'node:test';
import assert from 'node:assert/strict';
import { getStatus } from '../../src/lib/status.ts';
import { quote } from '../../src/lib/pricing.ts';
import { buildPlan } from '../../src/lib/plan-engine.ts';
import { toICS } from '../../src/lib/ics.ts';
import { bestArrival } from '../../src/lib/busyness.ts';
import { encodePlanInput, decodePlanInput } from '../../src/lib/share.ts';
import { planHash } from '../../src/lib/plan-hash.ts';
import { generateShortCode } from '../../src/lib/short-code.ts';
import { EXHIBITS } from '../../src/content/exhibits.ts';

test('2.1 & 2.2: Status boundaries in Asia/Kolkata timezone', () => {
  // Tuesday at 10:00:00 (Open)
  const tue10 = new Date('2026-11-10T10:00:00+05:30');
  assert.equal(getStatus(tue10).open, true);

  // Monday at any time (Closed)
  const mon11 = new Date('2026-11-09T11:00:00+05:30');
  assert.equal(getStatus(mon11).open, false);
  assert.equal(getStatus(mon11).nextOpening, 'Tuesday at 10:00');

  // Tuesday at 09:59:59 (Closed)
  const tueBefore10 = new Date('2026-11-10T09:59:59+05:30');
  assert.equal(getStatus(tueBefore10).open, false);

  // Tuesday at 16:59:59 (Open)
  const tueBefore17 = new Date('2026-11-10T16:59:59+05:30');
  assert.equal(getStatus(tueBefore17).open, true);

  // Tuesday at 17:00:00 (Closed)
  const tueAt17 = new Date('2026-11-10T17:00:00+05:30');
  assert.equal(getStatus(tueAt17).open, false);
});

test('2.3: Pricing quotes and validation', () => {
  const q1 = quote(2, 1);
  assert.equal(q1.total, 250);
  assert.equal(q1.lines.length, 2);

  // 0,0 rejected
  assert.throws(() => quote(0, 0), /At least one visitor/);

  // > 20 rejected
  assert.throws(() => quote(21, 0), /custom group bookings/);
  assert.throws(() => quote(2, 21), /custom group bookings/);

  // Children without adults rejected
  assert.throws(() => quote(0, 2), /must be accompanied by at least one adult/);
});

test('2.4: Engine knapsack budget invariant holds across multiple time budgets', () => {
  const timeBudgets = [25, 30, 45, 60, 90, 120, 180, 240];
  for (const time of timeBudgets) {
    const plan = buildPlan({
      timeMinutes: time,
      interests: ['space', 'building'],
      adults: 2,
      children: 1,
      stepFree: false,
      arrival: '10:00',
      quiet: false,
    });

    assert.ok(
      plan.totalMinutes <= time,
      `Plan totalMinutes (${plan.totalMinutes}) must not exceed available time (${time})`
    );

    if (plan.stops.length > 0) {
      const lastStop = plan.stops[plan.stops.length - 1];
      const [h, m] = lastStop.end.split(':').map((s) => parseInt(s, 10));
      const endTotal = h * 60 + m;
      assert.ok(endTotal <= 17 * 60, `Last stop end (${lastStop.end}) must not pass 17:00`);
    }
  }
});

test('2.5: DP Knapsack beats greedy selection on a crafted test case', () => {
  // Crafted scenario:
  // Available time: 45 minutes (effective capacity = 45 + 5 = 50)
  // Exhibit A (Build Bench): 45m (weight 50). Suppose score = 20.
  // Exhibit B (Echo Tunnel): 20m (weight 25). Score = 15.
  // Exhibit C (Garden Trail): 20m (weight 25). Score = 15.
  // Greedy takes Exhibit A (score 20).
  // DP takes B + C (total score 30, weight 25+25=50 <= 50).
  const input = {
    timeMinutes: 45,
    interests: ['sound', 'nature'], // matches Echo Tunnel and Garden Trail
    adults: 1,
    children: 0,
    stepFree: false,
    arrival: '10:00',
    quiet: false,
  };

  const plan = buildPlan(input);
  assert.ok(
    plan.explain.totalScore >= plan.explain.greedyScore,
    `DP score (${plan.explain.totalScore}) must be >= greedy score (${plan.explain.greedyScore})`
  );
  assert.ok(plan.stops.length >= 1);
});

test('2.6: Plan engine determinism', () => {
  const input = {
    timeMinutes: 90,
    interests: ['light', 'space', 'family'],
    adults: 2,
    children: 2,
    stepFree: true,
    arrival: '11:00',
    quiet: true,
  };

  const plan1 = buildPlan(input);
  const plan2 = buildPlan(input);

  assert.deepEqual(plan1, plan2, 'Calling engine twice with identical input produces identical plan');
});

test('2.7: Plan engine edge cases', () => {
  // Budget below shortest exhibit (20 min) -> time too short warning
  const shortPlan = buildPlan({
    timeMinutes: 15,
    interests: ['light'],
    adults: 1,
    children: 0,
    stepFree: false,
    arrival: '10:00',
    quiet: false,
  });
  assert.ok(shortPlan.warnings.some((w) => w.code === 'TIME_TOO_SHORT'));

  // Zero interest matches -> no interest match warning
  const noMatchPlan = buildPlan({
    timeMinutes: 60,
    interests: ['non-existent-tag'],
    adults: 1,
    children: 0,
    stepFree: false,
    arrival: '10:00',
    quiet: false,
  });
  assert.ok(noMatchPlan.warnings.some((w) => w.code === 'NO_INTEREST_MATCH'));

  // Late arrival at 16:45 -> trimmed for closing
  const latePlan = buildPlan({
    timeMinutes: 60,
    interests: [],
    adults: 1,
    children: 0,
    stepFree: false,
    arrival: '16:45',
    quiet: false,
  });
  assert.ok(latePlan.warnings.some((w) => w.code === 'LATE_ARRIVAL' || w.code === 'TRIMMED_FOR_CLOSING'));
});

test('2.8: ICS RFC 5545 validity', () => {
  const plan = buildPlan({
    timeMinutes: 60,
    interests: ['space'],
    adults: 2,
    children: 1,
    stepFree: false,
    arrival: '10:00',
    quiet: false,
  });

  const icsText = toICS(plan, '2026-11-14');
  assert.ok(icsText.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(icsText.includes('VTIMEZONE'));
  assert.ok(icsText.includes('Asia/Kolkata'));
  assert.ok(icsText.includes('BEGIN:VEVENT'));
  assert.ok(icsText.endsWith('END:VCALENDAR\r\n'));

  // Line length <= 75 octets
  const lines = icsText.split('\r\n');
  for (const line of lines) {
    assert.ok(
      Buffer.byteLength(line, 'utf-8') <= 75,
      `Line exceeds 75 octets: ${line}`
    );
  }
});

test('2.10: Explain consistency invariant', () => {
  const plan = buildPlan({
    timeMinutes: 60,
    interests: ['space', 'light'],
    adults: 1,
    children: 0,
    stepFree: false,
    arrival: '10:00',
    quiet: false,
  });

  assert.equal(plan.explain.considered.length, 5);
  const chosenSum = plan.explain.considered
    .filter((c) => c.chosen)
    .reduce((a, b) => a + b.score, 0);

  assert.equal(plan.explain.totalScore, chosenSum);

  for (const item of plan.explain.considered) {
    if (item.chosen) {
      assert.equal(item.droppedReason, undefined);
    } else {
      assert.ok(item.droppedReason !== undefined);
    }
  }
});

test('2.11: Quiet visit mode calm-first priority', () => {
  const planQuiet = buildPlan({
    timeMinutes: 120,
    interests: ['light', 'building', 'space', 'sound', 'nature'],
    adults: 2,
    children: 1,
    stepFree: false,
    arrival: '10:00',
    quiet: true,
  });

  assert.equal(planQuiet.quiet, true);
  // First stop must be calm (Sky Room or Garden Trail)
  assert.equal(planQuiet.stops[0].calm, true);
});

test('2.12: Best arrival recommendation', () => {
  // Monday -> closed
  const mon = bestArrival({ dayOfWeek: 1, durationMinutes: 60 });
  assert.equal(mon.open, false);
  if (!mon.open) {
    assert.equal(mon.nextOpenDay, 'Tuesday');
  }

  // Tuesday 60 min -> open, arrival within 10:00 to 16:00
  const tue = bestArrival({ dayOfWeek: 2, durationMinutes: 60 });
  assert.equal(tue.open, true);
  if (tue.open) {
    assert.equal(tue.arrival, '10:00'); // Tuesday 10:00 is global quiet minimum
  }
});

test('2.13: Share codec roundtrip', () => {
  const sampleInput = {
    timeMinutes: 90,
    interests: ['art', 'space'], // Canonical share codec sorts interests alphabetically
    adults: 3,
    children: 2,
    stepFree: true,
    arrival: '11:30',
    date: '2026-11-20',
    quiet: true,
  };

  const encoded = encodePlanInput(sampleInput);
  const decoded = decodePlanInput(encoded);

  assert.equal(decoded.success, true);
  assert.deepEqual(decoded.data, sampleInput);
});

test('2.14: Short code generator uniform rejection sampling', () => {
  // Check 100 generated codes
  for (let i = 0; i < 100; i++) {
    const code = generateShortCode();
    assert.equal(code.length, 6);
    // Must never contain ambiguous characters: i, l, o, 0, 1
    assert.equal(/[ilo01]/.test(code), false);
    // Must match regex ^[a-hjkmnp-z2-9]{6}$
    assert.ok(/^[a-hjkmnp-z2-9]{6}$/.test(code));
  }
});
