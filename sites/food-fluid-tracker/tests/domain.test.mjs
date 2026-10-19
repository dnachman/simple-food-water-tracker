import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDocument, parseAmounts, parseGoals, validateDocument, totalsForDate, goalProgress, editEntry, removeEntry, localDay, shiftDay, dateAfterRollover } from '../dist/domain.mjs';

test('protein-only input omits unknown nutrients and rejects an empty or invalid entry', () => {
  assert.deepEqual(parseAmounts({ protein: '30', calcium: '' }, 'food'), { protein: 30 });
  for (const raw of [{ protein: '' }, { protein: '-1' }, { protein: 'no' }, { protein: 'Infinity' }]) {
    assert.throws(() => parseAmounts(raw, 'food'));
  }
  assert.deepEqual(parseAmounts({ fluid: '4.5' }, 'fluid'), { fluid: 4.5 });
  assert.throws(() => parseAmounts({ fluid: '0' }, 'fluid'));
});

test('totals count only selected-day entries and normalize decimal sums', () => {
  const doc = { ...emptyDocument(), entries: [
    { id: 'a', date: '2026-10-16', type: 'food', amounts: { protein: 0.1 } },
    { id: 'b', date: '2026-10-16', type: 'food', amounts: { protein: 0.2 } },
    { id: 'c', date: '2026-10-15', type: 'food', amounts: { protein: 99 } },
    { id: 'd', date: '2026-10-16', type: 'fluid', amounts: { fluid: 4 } }
  ] };
  const totals = totalsForDate(doc, '2026-10-16');
  assert.equal(totals.protein, 0.3);
  assert.equal(totals.fluid, 4);
  assert.equal(totals.calcium, 0);
});

test('goal comparisons distinguish reaching a minimum from exceeding a limit', () => {
  assert.deepEqual(goalProgress(30, { comparison: 'gte', value: 75 }), { percentage: 40, fill: 40, status: 'Below goal' });
  assert.equal(goalProgress(75, { comparison: 'gte', value: 75 }).status, 'Goal reached');
  assert.equal(goalProgress(100, { comparison: 'gte', value: 75 }).fill, 100);
  assert.equal(goalProgress(30, { comparison: 'lte', value: 30 }).status, 'Within limit');
  assert.equal(goalProgress(31, { comparison: 'lte', value: 30 }).status, 'Over limit');
  assert.equal(goalProgress(0).status, 'No goal set');
});

test('saved document validation blocks bad dates, unknown metrics, and duplicate IDs', () => {
  const entry = { id: 'a', date: '2026-10-16', type: 'food', amounts: { protein: 30 } };
  assert.equal(validateDocument({ ...emptyDocument(), entries: [entry] }), true);
  for (const entries of [[entry, entry], [{ ...entry, date: '2026-02-30' }], [{ ...entry, amounts: { unknown: 4 } }], [{ ...entry, amounts: { fluid: 4 } }]]) {
    assert.equal(validateDocument({ ...emptyDocument(), entries }), false);
  }
  assert.equal(validateDocument({ ...emptyDocument(), schemaVersion: 2 }), false);
});

test('all food metrics retain supplied zero values while blank fields stay unknown', () => {
  assert.deepEqual(parseAmounts({ protein: '20.5', calcium: '250', addedSugar: '0', calories: '150', totalFat: '4', totalCarbohydrates: '9', fiber: '' }, 'food'),
    { protein: 20.5, calcium: 250, addedSugar: 0, calories: 150, totalFat: 4, totalCarbohydrates: 9 });
  assert.throws(() => parseAmounts({ protein: '20', calcium: '-1' }, 'food'));
  assert.throws(() => parseGoals({ protein: { value: '0', comparison: 'gte' } }));
  assert.throws(() => parseGoals({ calcium: { value: '250', comparison: 'invalid' } }));
  assert.deepEqual(parseGoals({ calcium: { value: '250', comparison: 'gte' }, addedSugar: { value: '20', comparison: 'lte' }, fiber: { value: '', comparison: 'gte' } }),
    { calcium: { value: 250, comparison: 'gte' }, addedSugar: { value: 20, comparison: 'lte' } });
});

test('editing replaces one entry, retaining its date, ID and unaffected records', () => {
  const original = { ...emptyDocument(), entries: [
    { id: 'a', date: '2026-10-15', type: 'food', description: 'chicken', amounts: { protein: 30, calcium: 10 } },
    { id: 'b', date: '2026-10-15', type: 'fluid', amounts: { fluid: 4 } }
  ] };
  const changed = editEntry(original, 'a', { amounts: { protein: 20 }, description: 'corrected' });
  assert.deepEqual(changed.entries[0], { id: 'a', date: '2026-10-15', type: 'food', description: 'corrected', amounts: { protein: 20 } });
  assert.deepEqual(changed.entries[1], original.entries[1]);
  assert.equal(original.entries[0].amounts.protein, 30);
  assert.equal(totalsForDate(changed, '2026-10-15').protein, 20);
  assert.equal(totalsForDate(changed, '2026-10-15').calcium, 0);
  assert.throws(() => editEntry(original, 'missing', { amounts: { protein: 20 } }));
});

test('removing an entry subtracts its contribution exactly once and keeps other dates', () => {
  const original = { ...emptyDocument(), entries: [
    { id: 'a', date: '2026-10-16', type: 'fluid', amounts: { fluid: 4 } },
    { id: 'b', date: '2026-10-16', type: 'fluid', amounts: { fluid: 4 } },
    { id: 'c', date: '2026-10-15', type: 'food', amounts: { protein: 30 } }
  ] };
  const changed = removeEntry(original, 'a');
  assert.equal(totalsForDate(changed, '2026-10-16').fluid, 4);
  assert.equal(totalsForDate(changed, '2026-10-15').protein, 30);
  assert.equal(original.entries.length, 3);
  assert.throws(() => removeEntry(changed, 'a'));
});

test('calendar navigation crosses months and leap days without UTC arithmetic', () => {
  assert.equal(shiftDay('2026-10-01', -1), '2026-09-30');
  assert.equal(shiftDay('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
  assert.throws(() => shiftDay('2026-02-30', 1));
});

test('rollover advances today while preserving a selected historical day', () => {
  assert.equal(dateAfterRollover('2026-10-16', '2026-10-16', '2026-10-17'), '2026-10-17');
  assert.equal(dateAfterRollover('2026-10-15', '2026-10-16', '2026-10-17'), '2026-10-15');
});

test('local day stays on the previous calendar date near a UTC boundary', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'America/New_York';
    assert.equal(localDay(new Date('2026-10-17T01:00:00Z')), '2026-10-16');
    assert.equal(localDay(new Date('2026-10-17T05:00:00Z')), '2026-10-17');
    assert.equal(shiftDay('2026-03-08', 1), '2026-03-09');
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test('historical comparisons use changed goals without changing logged intake', () => {
  const original = { ...emptyDocument(), entries: [{ id: 'a', date: '2026-10-15', type: 'food', amounts: { protein: 30 } }], goals: { protein: { comparison: 'gte', value: 75 } } };
  const before = JSON.stringify(original.entries);
  assert.equal(goalProgress(totalsForDate(original, '2026-10-15').protein, original.goals.protein).percentage, 40);
  const changed = { ...original, goals: { protein: { comparison: 'gte', value: 100 } } };
  assert.equal(goalProgress(totalsForDate(changed, '2026-10-15').protein, changed.goals.protein).percentage, 30);
  assert.equal(JSON.stringify(changed.entries), before);
  assert.equal(totalsForDate(changed, '2026-10-16').protein, 0);
});
