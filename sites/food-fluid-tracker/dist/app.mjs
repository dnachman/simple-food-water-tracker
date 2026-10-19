import { METRICS, emptyDocument, localDay, parseAmounts, parseGoals, editEntry, removeEntry, shiftDay, dateAfterRollover, isCalendarDate } from './domain.mjs';
import { loadDocument, commitDocument, STORAGE_KEY } from './storage.mjs';
import { byId, renderDashboard, buildEntryFields, buildGoalFields, showFormError, restoreEntryFocus } from './ui.mjs';

let saved = emptyDocument();
let knownToday = localDay();
let selectedDate = knownToday;
let draft = null;
let noticeTimer;
let midnightTimer;

function notify(message) {
  byId('notice').textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { byId('notice').textContent = ''; }, 3500);
}
function showStorageError(error) {
  byId('storage-error').textContent = `Could not access saved data. ${error.message}`;
  byId('storage-error').hidden = false;
}
function refresh() {
  const today = localDay();
  selectedDate = dateAfterRollover(selectedDate, knownToday, today);
  knownToday = today;
  try { saved = loadDocument(window.localStorage); byId('storage-error').hidden = true; }
  catch (error) { showStorageError(error); }
  renderDashboard(saved, selectedDate);
}
function scheduleMidnight() {
  clearTimeout(midnightTimer);
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  midnightTimer = setTimeout(() => { refresh(); scheduleMidnight(); }, Math.max(1000, nextMidnight - now + 50));
}
function selectDate(date) {
  if (!isCalendarDate(date)) { notify('Choose a valid calendar date.'); byId('selected-date').value = selectedDate; return; }
  selectedDate = date;
  refresh();
}
byId('selected-date').addEventListener('change', event => selectDate(event.target.value));
byId('previous-day').addEventListener('click', () => { try { selectDate(shiftDay(selectedDate, -1)); } catch (error) { notify(error.message); } });
byId('next-day').addEventListener('click', () => { try { selectDate(shiftDay(selectedDate, 1)); } catch (error) { notify(error.message); } });
byId('go-today').addEventListener('click', () => selectDate(localDay()));
function saveChange(transform) {
  try {
    const storage = window.localStorage;
    const latest = loadDocument(storage);
    const candidate = transform(latest);
    commitDocument(storage, candidate);
    saved = candidate;
    byId('storage-error').hidden = true;
    renderDashboard(saved, selectedDate);
  } catch (error) {
    showStorageError(error);
    throw new Error(`Not saved. ${error.message}`);
  }
}
function openEntry(type, entry = null) {
  draft = { type, date: entry?.date ?? selectedDate, id: entry?.id };
  buildEntryFields(type, entry, draft.date);
  byId('entry-dialog').showModal();
  byId(type === 'fluid' ? 'fluid' : 'protein').focus();
}
byId('open-food').addEventListener('click', () => openEntry('food'));
byId('open-fluid').addEventListener('click', () => openEntry('fluid'));
byId('quick-water').addEventListener('click', () => {
  try {
    const entry = { id: crypto.randomUUID(), type: 'fluid', date: selectedDate, amounts: { fluid: 4 } };
    saveChange(doc => ({ ...doc, entries: [...doc.entries, entry] }));
    notify('Added 4 fl oz of water');
  } catch (error) { notify(error.message); }
});
byId('entry-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const amounts = parseAmounts(values, draft.type);
    const entry = { id: draft.id ?? crypto.randomUUID(), type: draft.type, date: draft.date, amounts };
    if (draft.type === 'food' && values.description?.trim()) entry.description = values.description.trim();
    saveChange(doc => draft.id ? editEntry(doc, draft.id, entry) : ({ ...doc, entries: [...doc.entries, entry] }));
    byId('entry-dialog').close();
    notify('Entry saved');
  } catch (error) { showFormError('entry-error', error); }
});
byId('open-goals').addEventListener('click', () => {
  refresh();
  buildGoalFields(saved);
  byId('goals-dialog').showModal();
});
byId('goals-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const raw = {};
    for (const { key } of METRICS) raw[key] = { value: byId(`${key}-goal`).value, comparison: byId(`${key}-comparison`).value };
    const updates = parseGoals(raw);
    saveChange(doc => ({ ...doc, goals: updates }));
    byId('goals-dialog').close();
    notify('Daily goals saved');
  } catch (error) { showFormError('goals-error', error); }
});
byId('entries').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  try {
    if (button.dataset.action === 'remove') {
      saveChange(doc => removeEntry(doc, button.dataset.id));
      restoreEntryFocus(null);
      notify('Entry removed');
    } else {
      refresh();
      const entry = saved.entries.find(entry => entry.id === button.dataset.id);
      if (!entry) throw new Error('This entry no longer exists. Refresh the list.');
      openEntry(entry.type, entry);
    }
  } catch (error) { notify(error.message); }
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => byId(button.dataset.close).close()));
byId('entry-dialog').addEventListener('close', () => {
  if (draft?.id) restoreEntryFocus(draft.id);
  else byId(draft?.type === 'fluid' ? 'open-fluid' : 'open-food').focus({ preventScroll: true });
});
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) refresh(); });
window.addEventListener('focus', () => { refresh(); scheduleMidnight(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { refresh(); scheduleMidnight(); } });
refresh();
scheduleMidnight();
