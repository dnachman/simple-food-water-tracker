import { emptyDocument, validateDocument } from './domain.mjs';
export const STORAGE_KEY = 'food-fluid-tracker:v1';
export function loadDocument(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return emptyDocument();
  let doc;
  try { doc = JSON.parse(raw); } catch { throw new Error('Saved data could not be read. It has been preserved; saving is paused.'); }
  if (!validateDocument(doc)) throw new Error('Saved data has an unsupported format. It has been preserved; saving is paused.');
  return doc;
}
export function commitDocument(storage, candidate) {
  loadDocument(storage);
  if (!validateDocument(candidate)) throw new Error('This change could not be saved because its data is invalid.');
  storage.setItem(STORAGE_KEY, JSON.stringify(candidate));
  return candidate;
}
