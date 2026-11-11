import test from 'node:test';
import assert from 'node:assert/strict';
import { CENTRE_FACTS } from '../../src/content/centre.ts';
import { EXHIBITS } from '../../src/content/exhibits.ts';
import { FAQS } from '../../src/content/faq.ts';
import { JOURNEY_STAGES } from '../../src/content/journey.ts';
import { BUSYNESS_MATRIX } from '../../src/content/busyness.ts';

test('1.1 & 1.2: Fixed Facts match §1.2 byte-for-byte everywhere', () => {
  // Name
  assert.equal(CENTRE_FACTS.name.en, 'Northside Discovery Centre');

  // Address
  assert.equal(CENTRE_FACTS.address, '18 Garden Road, Riverdale');

  // Hours: Tue-Sun 10:00 to 17:00, closed Monday
  assert.equal(CENTRE_FACTS.hours.openTime, '10:00');
  assert.equal(CENTRE_FACTS.hours.closeTime, '17:00');
  assert.equal(CENTRE_FACTS.hours.closedDays.includes('Monday'), true);
  assert.equal(CENTRE_FACTS.hours.openDays.includes('Tuesday'), true);
  assert.equal(CENTRE_FACTS.hours.openDays.includes('Sunday'), true);

  // Prices: Adult 100, Child 50, Currency INR
  assert.equal(CENTRE_FACTS.pricing.adultINR, 100);
  assert.equal(CENTRE_FACTS.pricing.childINR, 50);
  assert.equal(CENTRE_FACTS.pricing.currency, 'INR');

  // Accessibility claim
  assert.equal(
    CENTRE_FACTS.accessibility.claim.en,
    'Ground floor and main exhibits are wheelchair accessible'
  );

  // Exhibit durations
  const lightLab = EXHIBITS.find((e) => e.slug === 'light-lab');
  const buildBench = EXHIBITS.find((e) => e.slug === 'build-bench');
  const skyRoom = EXHIBITS.find((e) => e.slug === 'sky-room');

  assert.ok(lightLab, 'Light Lab exists');
  assert.equal(lightLab.durationMinutes, 30, 'Light Lab must be exactly 30 minutes');

  assert.ok(buildBench, 'Build Bench exists');
  assert.equal(buildBench.durationMinutes, 45, 'Build Bench must be exactly 45 minutes');

  assert.ok(skyRoom, 'Sky Room exists');
  assert.equal(skyRoom.durationMinutes, 25, 'Sky Room must be exactly 25 minutes');
});

test('1.3: Content entity count thresholds', () => {
  assert.ok(EXHIBITS.length >= 3, 'Must have at least 3 exhibits');
  assert.equal(EXHIBITS.length, 5, 'Expected 5 exhibits delivered');

  assert.ok(FAQS.length >= 8, 'Must have at least 8 FAQs');
  assert.equal(FAQS.length, 9, 'Delivered 9 practical FAQs');

  assert.equal(JOURNEY_STAGES.length, 3, 'Must have exactly 3 journey stages');
});

test('1.5: Accessibility claim holds across all exhibits', () => {
  for (const ex of EXHIBITS) {
    assert.equal(ex.floor, 'Ground floor', `Exhibit ${ex.slug} must be on Ground floor`);
  }
});

test('1.6: Busyness model shape rules', () => {
  // Monday is closed
  assert.equal(BUSYNESS_MATRIX[1], null, 'Monday must be null');

  // Tuesday 10:00 is global minimum
  const tue10 = BUSYNESS_MATRIX[2]![0];
  let minScore = 100;
  let maxScore = 0;

  for (let d = 0; d <= 6; d++) {
    const scores = BUSYNESS_MATRIX[d];
    if (scores) {
      for (const s of scores) {
        if (s < minScore) minScore = s;
        if (s > maxScore) maxScore = s;
      }
    }
  }

  assert.equal(tue10, minScore, 'Tuesday 10:00 must be the global minimum');
  assert.equal(minScore, 18);

  // Sunday 12:00 is global peak
  const sun12 = BUSYNESS_MATRIX[0]![2];
  assert.equal(sun12, maxScore, 'Sunday 12:00 must be global maximum');
  assert.equal(maxScore, 92);
});

test('1.7: Localized text and calm attribute rules', () => {
  for (const ex of EXHIBITS) {
    assert.ok(ex.name.en.length > 0);
    assert.ok(ex.name.ta.length > 0);
    assert.ok(ex.tagline.en.length > 0);
    assert.ok(ex.tagline.ta.length > 0);
    assert.ok(ex.description.en.length > 0);
    assert.ok(ex.description.ta.length > 0);
  }

  const calmSlugs = EXHIBITS.filter((e) => e.calm).map((e) => e.slug).sort();
  assert.deepEqual(calmSlugs, ['garden-trail', 'sky-room']);
});
