/**
 * Build-time validation script for Northside Discovery Centre content.
 * Checks that all content modules adhere strictly to schemas and §1.2 Fixed facts.
 */

import { CENTRE_FACTS } from '../src/content/centre.ts';
import { EXHIBITS } from '../src/content/exhibits.ts';
import { FAQS } from '../src/content/faq.ts';
import { JOURNEY_STAGES } from '../src/content/journey.ts';
import { BUSYNESS_MATRIX } from '../src/content/busyness.ts';
import {
  CentreFactsSchema,
  ExhibitSchema,
  FAQSchema,
  JourneyStageSchema,
} from '../src/lib/schemas.ts';

console.log('[check-content] Validating centre facts...');
const centreParsed = CentreFactsSchema.safeParse(CENTRE_FACTS);
if (!centreParsed.success) {
  console.error('[check-content] Centre facts validation failed:', centreParsed.error);
  process.exit(1);
}

// Fixed facts assertion
if (CENTRE_FACTS.address !== '18 Garden Road, Riverdale') {
  console.error('[check-content] Address must be "18 Garden Road, Riverdale"');
  process.exit(1);
}
if (CENTRE_FACTS.pricing.adultINR !== 100 || CENTRE_FACTS.pricing.childINR !== 50) {
  console.error('[check-content] Pricing must be adult 100, child 50');
  process.exit(1);
}

console.log('[check-content] Validating exhibits...');
if (EXHIBITS.length < 3) {
  console.error(`[check-content] Must have at least 3 exhibits, found ${EXHIBITS.length}`);
  process.exit(1);
}

for (const ex of EXHIBITS) {
  const exParsed = ExhibitSchema.safeParse(ex);
  if (!exParsed.success) {
    console.error(`[check-content] Exhibit ${ex.slug} validation failed:`, exParsed.error);
    process.exit(1);
  }
  if (ex.floor !== 'Ground floor') {
    console.error(`[check-content] Exhibit ${ex.slug} must be on Ground floor (got: ${ex.floor})`);
    process.exit(1);
  }
}

// Check fixed exhibit durations
const lightLab = EXHIBITS.find((e) => e.slug === 'light-lab');
const buildBench = EXHIBITS.find((e) => e.slug === 'build-bench');
const skyRoom = EXHIBITS.find((e) => e.slug === 'sky-room');

if (!lightLab || lightLab.durationMinutes !== 30) {
  console.error('[check-content] Light Lab must be exactly 30 minutes');
  process.exit(1);
}
if (!buildBench || buildBench.durationMinutes !== 45) {
  console.error('[check-content] Build Bench must be exactly 45 minutes');
  process.exit(1);
}
if (!skyRoom || skyRoom.durationMinutes !== 25) {
  console.error('[check-content] Sky Room must be exactly 25 minutes');
  process.exit(1);
}

// Calm exhibits: strictly sky-room and garden-trail
const calmSlugs = EXHIBITS.filter((e) => e.calm).map((e) => e.slug).sort();
if (JSON.stringify(calmSlugs) !== JSON.stringify(['garden-trail', 'sky-room'])) {
  console.error('[check-content] Calm exhibits must be strictly sky-room and garden-trail', calmSlugs);
  process.exit(1);
}

console.log('[check-content] Validating FAQs...');
if (FAQS.length < 8) {
  console.error(`[check-content] Expected at least 8 FAQs, found ${FAQS.length}`);
  process.exit(1);
}
for (const faq of FAQS) {
  const faqParsed = FAQSchema.safeParse(faq);
  if (!faqParsed.success) {
    console.error(`[check-content] FAQ ${faq.id} validation failed:`, faqParsed.error);
    process.exit(1);
  }
}

console.log('[check-content] Validating journey stages...');
if (JOURNEY_STAGES.length !== 3) {
  console.error(`[check-content] Expected exactly 3 journey stages, found ${JOURNEY_STAGES.length}`);
  process.exit(1);
}

for (const stage of JOURNEY_STAGES) {
  const stageParsed = JourneyStageSchema.safeParse(stage);
  if (!stageParsed.success) {
    console.error(`[check-content] Journey stage ${stage.id} validation failed:`, stageParsed.error);
    process.exit(1);
  }

  // Word count checks
  const enWords = stage.description.en.trim().split(/\s+/).length;
  if (enWords > 40) {
    console.error(`[check-content] Journey stage ${stage.id} description exceeds 40 words (${enWords} words)`);
    process.exit(1);
  }

  const guideWords = stage.guideLine.en.trim().split(/\s+/).length;
  if (guideWords > 12) {
    console.error(`[check-content] Journey stage ${stage.id} guideLine exceeds 12 words (${guideWords} words)`);
    process.exit(1);
  }
}

console.log('[check-content] Validating busyness matrix...');
// Monday must be null
if (BUSYNESS_MATRIX[1] !== null) {
  console.error('[check-content] Monday (day 1) in busyness matrix must be null');
  process.exit(1);
}

// Tue 10:00 must be global minimum (score 18)
const tueScores = BUSYNESS_MATRIX[2]!;
const tue10 = tueScores[0];
let globalMin = 100;
let globalMax = 0;

for (let d = 0; d <= 6; d++) {
  const scores = BUSYNESS_MATRIX[d];
  if (scores) {
    for (const s of scores) {
      if (s < globalMin) globalMin = s;
      if (s > globalMax) globalMax = s;
    }
  }
}

if (tue10 !== globalMin) {
  console.error(`[check-content] Tuesday 10:00 must be global minimum (got: ${tue10}, min: ${globalMin})`);
  process.exit(1);
}

// Sunday 12:00 must be global maximum (score 92)
const sunScores = BUSYNESS_MATRIX[0]!;
const sun12 = sunScores[2];
if (sun12 !== globalMax) {
  console.error(`[check-content] Sunday 12:00 must be global maximum (got: ${sun12}, max: ${globalMax})`);
  process.exit(1);
}

console.log('✅ [check-content] All content validation checks passed successfully.');
