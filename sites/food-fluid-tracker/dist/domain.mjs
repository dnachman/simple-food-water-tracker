export const METRICS = [
  { key: 'fluid', label: 'Fluid intake', unit: 'US fl oz', short: 'fl oz' },
  { key: 'protein', label: 'Protein', unit: 'g', short: 'g' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', short: 'mg' },
  { key: 'addedSugar', label: 'Added sugar', unit: 'g', short: 'g' },
  { key: 'calories', label: 'Calories', unit: 'kcal', short: 'kcal' },
  { key: 'totalFat', label: 'Total fat', unit: 'g', short: 'g' },
  { key: 'totalCarbohydrates', label: 'Total carbohydrates', unit: 'g', short: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g', short: 'g' }
];
const keys = METRICS.map(metric => metric.key);
export const formatAmount = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(value);
export function emptyDocument() { return { schemaVersion: 1, entries: [], goals: {} }; }
export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return year >= 1 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
export function displayDate(value) {
  if (!isCalendarDate(value)) return value;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}
function inputError(message, field) {
  return Object.assign(new Error(message), { field });
}
function parseNumber(raw, label, field) {
  const value = String(raw).trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !Number.isFinite(Number(value))) {
    throw inputError(`${label}: enter a number of zero or more.`, field);
  }
  return Number(value);
}
export function parseAmounts(raw, type) {
  const amounts = {};
  for (const metric of METRICS.filter(m => type === 'fluid' ? m.key === 'fluid' : m.key !== 'fluid')) {
    const value = raw[metric.key];
    if (value === undefined || String(value).trim() === '') continue;
    amounts[metric.key] = parseNumber(value, metric.label, metric.key);
  }
  if (!Object.values(amounts).some(value => value > 0)) {
    throw inputError(type === 'fluid' ? 'Enter a fluid amount greater than zero.' : 'Enter at least one nutrient amount greater than zero.', type === 'fluid' ? 'fluid' : 'protein');
  }
  return amounts;
}
export function parseGoals(raw) {
  const goals = {};
  for (const metric of METRICS) {
    const draft = raw[metric.key];
    if (!draft || String(draft.value).trim() === '') continue;
    const value = parseNumber(draft.value, metric.label, `${metric.key}-goal`);
    if (value <= 0) throw inputError(`${metric.label}: the goal must be greater than zero.`, `${metric.key}-goal`);
    if (!['gte', 'lte'].includes(draft.comparison)) throw inputError('Choose a goal comparison.', `${metric.key}-comparison`);
    goals[metric.key] = { value, comparison: draft.comparison };
  }
  return goals;
}
const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
export function validateDocument(doc) {
  if (!record(doc) || doc.schemaVersion !== 1 || !Array.isArray(doc.entries) || !record(doc.goals)) return false;
  const seen = new Set();
  for (const entry of doc.entries) {
    if (!record(entry) || typeof entry.id !== 'string' || !entry.id || seen.has(entry.id) || !isCalendarDate(entry.date) || !['food', 'fluid'].includes(entry.type) || !record(entry.amounts)) return false;
    seen.add(entry.id);
    if (entry.description !== undefined && (entry.type !== 'food' || typeof entry.description !== 'string')) return false;
    const pairs = Object.entries(entry.amounts);
    if (!pairs.length || !pairs.some(([, value]) => value > 0)) return false;
    for (const [key, value] of pairs) {
      if (!keys.includes(key) || !Number.isFinite(value) || value < 0 || (entry.type === 'fluid' ? key !== 'fluid' : key === 'fluid')) return false;
    }
  }
  for (const [key, goal] of Object.entries(doc.goals)) {
    if (!keys.includes(key) || !record(goal) || !['gte', 'lte'].includes(goal.comparison) || !Number.isFinite(goal.value) || goal.value <= 0) return false;
  }
  return true;
}
export function totalsForDate(doc, date) {
  const totals = Object.fromEntries(keys.map(key => [key, 0]));
  for (const entry of doc.entries.filter(entry => entry.date === date)) {
    for (const [key, value] of Object.entries(entry.amounts)) totals[key] += value;
  }
  for (const key of keys) totals[key] = Number(totals[key].toPrecision(15));
  return totals;
}
export function goalProgress(total, goal) {
  if (!goal) return { percentage: null, fill: 0, status: 'No goal set' };
  const percentage = Number((total / goal.value * 100).toPrecision(15));
  return {
    percentage,
    fill: Math.min(100, Math.max(0, percentage)),
    status: goal.comparison === 'gte' ? (total >= goal.value ? 'Goal reached' : 'Below goal') : (total <= goal.value ? 'Within limit' : 'Over limit')
  };
}
export function editEntry(doc, id, updates) {
  const current = doc.entries.find(entry => entry.id === id);
  if (!current) throw new Error('This entry no longer exists. Close the form and refresh the list.');
  const replacement = { id: current.id, date: current.date, type: current.type, amounts: { ...updates.amounts } };
  if (current.type === 'food' && updates.description?.trim()) replacement.description = updates.description.trim();
  const candidate = { ...doc, entries: doc.entries.map(entry => entry.id === id ? replacement : entry) };
  if (!validateDocument(candidate)) throw new Error('The edited entry is invalid.');
  return candidate;
}
export function removeEntry(doc, id) {
  if (!doc.entries.some(entry => entry.id === id)) throw new Error('This entry has already been removed. Refresh the list.');
  return { ...doc, entries: doc.entries.filter(entry => entry.id !== id) };
}
export function shiftDay(value, offset) {
  if (!isCalendarDate(value) || !Number.isInteger(offset)) throw new Error('Choose a valid calendar date.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const shifted = localDay(date);
  if (!isCalendarDate(shifted)) throw new Error('This date is outside the supported range.');
  return shifted;
}
export function dateAfterRollover(selected, previousToday, nextToday) {
  return selected === previousToday ? nextToday : selected;
}
