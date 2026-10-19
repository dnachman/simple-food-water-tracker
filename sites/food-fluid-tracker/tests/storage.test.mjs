import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDocument } from '../dist/domain.mjs';
import { loadDocument, commitDocument, STORAGE_KEY } from '../dist/storage.mjs';
function memoryStorage(initial) {
  const data = new Map(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
test('saved entries and goals survive serialization and reopening', () => {
  const storage = memoryStorage();
  assert.deepEqual(loadDocument(storage), { schemaVersion: 1, entries: [], goals: {} });
  const doc = { ...emptyDocument(), entries: [{ id: 'a', date: '2026-10-16', type: 'fluid', amounts: { fluid: 4 } }], goals: { protein: { comparison: 'gte', value: 75 } } };
  commitDocument(storage, doc);
  assert.deepEqual(loadDocument(storage), doc);
});
test('malformed stored data is preserved and cannot be overwritten by a normal commit', () => {
  const storage = memoryStorage('{broken');
  assert.throws(() => loadDocument(storage));
  assert.throws(() => commitDocument(storage, emptyDocument()));
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
});
test('a failed write leaves previously saved entries intact', () => {
  const storage = memoryStorage(JSON.stringify(emptyDocument()));
  const candidate = { ...emptyDocument(), goals: { protein: { comparison: 'gte', value: 75 } } };
  storage.setItem = () => { throw new Error('quota exceeded'); };
  assert.throws(() => commitDocument(storage, candidate), /quota/);
  assert.deepEqual(loadDocument(storage), { schemaVersion: 1, entries: [], goals: {} });
});

test('blocked reads and unsupported schemas do not become a new empty account', () => {
  assert.throws(() => loadDocument({ getItem: () => { throw new Error('blocked'); } }), /blocked/);
  const storage = memoryStorage('{"schemaVersion":2,"entries":[],"goals":{}}');
  assert.throws(() => commitDocument(storage, emptyDocument()), /unsupported/);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).schemaVersion, 2);
});
