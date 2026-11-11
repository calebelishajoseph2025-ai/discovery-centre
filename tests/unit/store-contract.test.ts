import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryDataStore } from '../../src/store/memory.ts';
import { OffDataStore } from '../../src/store/off.ts';
import { StoreUnavailable } from '../../src/store/errors.ts';

test('10.7: Memory Store Adapter contract test', async () => {
  const store = new MemoryDataStore();

  // 1. Ping
  assert.equal(await store.ping(), true);

  // 2. Feedback submit and summary
  await store.feedback.submit(
    {
      helpful: true,
      comment: 'Great exhibits!',
      plan: { timeMinutes: 60, interests: [], adults: 2, children: 1, stepFree: false, arrival: '10:00', quiet: false },
      locale: 'en',
      quiet: false,
    },
    '0123456789abcdef'
  );

  const summary = await store.feedback.summary();
  assert.equal(summary.available, true);
  assert.ok(summary.total >= 5);
  assert.ok(summary.helpfulPct !== null);

  // 3. Short plan create and get
  const code = 'k3x9ab';
  const payload = {
    input: { timeMinutes: 90, interests: [], adults: 1, children: 0, stepFree: false, arrival: '10:00', quiet: false },
    locale: 'en' as const,
  };

  const created = await store.shortPlans.create(code, payload);
  assert.equal(created, true);

  // Duplicate code returns false
  const duplicate = await store.shortPlans.create(code, payload);
  assert.equal(duplicate, false);

  const retrieved = await store.shortPlans.get(code);
  assert.deepEqual(retrieved, payload);

  const nonExistent = await store.shortPlans.get('unknown');
  assert.equal(nonExistent, null);

  // 4. Favourites adjust
  const currentCounts = await store.favourites.counts();
  const initialLightLab = currentCounts['light-lab'] || 0;

  const incremented = await store.favourites.adjust('light-lab', 1);
  assert.equal(incremented, initialLightLab + 1);

  const decremented = await store.favourites.adjust('light-lab', -1);
  assert.equal(decremented, initialLightLab);

  // 5. Rate limiting
  const allowed1 = await store.rateLimit.take('test-bucket', 'user-1', 2, 60);
  const allowed2 = await store.rateLimit.take('test-bucket', 'user-1', 2, 60);
  const allowed3 = await store.rateLimit.take('test-bucket', 'user-1', 2, 60);

  assert.equal(allowed1, true);
  assert.equal(allowed2, true);
  assert.equal(allowed3, false);
});

test('10.9: Off Store Adapter graceful degradation contract test', async () => {
  const offStore = new OffDataStore();

  assert.equal(await offStore.ping(), false);

  // Summary returns available: false without throwing
  const summary = await offStore.feedback.summary();
  assert.equal(summary.available, false);
  assert.equal(summary.helpfulPct, null);

  // Short plan get returns null without throwing
  const shortPlan = await offStore.shortPlans.get('nonexistent');
  assert.equal(shortPlan, null);

  // Submit throws StoreUnavailable
  await assert.rejects(
    () =>
      offStore.feedback.submit(
        {
          helpful: true,
          plan: { timeMinutes: 60, interests: [], adults: 1, children: 0, stepFree: false, arrival: '10:00', quiet: false },
          locale: 'en',
          quiet: false,
        },
        '0123456789abcdef'
      ),
    StoreUnavailable
  );
});
