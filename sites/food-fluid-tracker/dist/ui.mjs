import { METRICS, totalsForDate, goalProgress, formatAmount, displayDate, localDay } from './domain.mjs';

export const byId = id => document.getElementById(id);
export function restoreEntryFocus(id) {
  const target = [...byId('entries').querySelectorAll('button[data-action="edit"]')].find(button => button.dataset.id === id);
  (target ?? byId('entries-heading')).focus({ preventScroll: true });
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function metricCard(metric, total, goal) {
  const progress = goalProgress(total, goal);
  const card = element('article', `metric${progress.status === 'Over limit' ? ' over' : progress.status === 'Goal reached' ? ' reached' : ''}`);
  card.dataset.metric = metric.key;
  const heading = element('div', 'metric-heading');
  heading.append(element('h3', '', metric.label));
  const number = element('p', 'metric-number', formatAmount(total));
  number.append(element('small', '', metric.short));
  const goalLabel = goal ? `${goal.comparison === 'gte' ? '≥' : '≤'} ${formatAmount(goal.value)} ${metric.short} daily ${goal.comparison === 'gte' ? 'goal' : 'limit'}` : 'Set a goal in Daily goals';
  const bar = element('div', 'bar');
  const fill = element('div', 'bar-fill');
  fill.style.width = `${progress.fill}%`;
  bar.append(fill);
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', goal ? `${metric.label}: ${formatAmount(total)} of ${formatAmount(goal.value)} ${metric.short}. ${progress.status}.` : `${metric.label}: ${formatAmount(total)} ${metric.short}. No goal set.`);
  const status = element('div', 'metric-status');
  status.append(element('span', '', progress.status));
  if (progress.percentage !== null) status.append(element('span', 'percentage', `${formatAmount(Math.round(progress.percentage * 10) / 10)}%${goal.comparison === 'lte' ? ' of limit' : ''}`));
  card.append(heading, number, element('p', 'metric-goal', goalLabel), bar, status);
  return card;
}
export function renderDashboard(doc, date) {
  byId('date-label').textContent = displayDate(date);
  byId('selected-date').value = date;
  byId('go-today').disabled = date === localDay();
  const totals = totalsForDate(doc, date);
  byId('primary-metrics').replaceChildren(...METRICS.slice(0, 3).map(m => metricCard(m, totals[m.key], doc.goals[m.key])));
  byId('other-metrics').replaceChildren(...METRICS.slice(3).map(m => metricCard(m, totals[m.key], doc.goals[m.key])));
  const entries = doc.entries.filter(entry => entry.date === date).toReversed();
  byId('entry-count').textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
  if (!entries.length) {
    const empty = element('div', 'empty');
    empty.append(element('strong', '', 'No entries for this day'), element('p', '', 'Add water, a drink, or a food to get started.'));
    byId('entries').replaceChildren(empty);
    return;
  }
  byId('entries').replaceChildren(...entries.map(entry => {
    const row = element('div', 'entry');
    row.dataset.entryId = entry.id;
    const symbol = element('span', 'entry-symbol', entry.type === 'fluid' ? '◌' : '+');
    symbol.setAttribute('aria-hidden', 'true');
    const content = element('div', 'entry-content');
    const description = entry.type === 'fluid' ? 'Fluid' : entry.description || 'Food entry';
    const amounts = METRICS.filter(m => Object.hasOwn(entry.amounts, m.key)).map(m => `${m.label}: ${formatAmount(entry.amounts[m.key])} ${m.short}`).join(' · ');
    content.append(element('p', 'entry-title', description), element('p', 'entry-amounts', amounts));
    const actions = element('div', 'entry-actions');
    for (const [action, label] of [['edit', 'Edit'], ['remove', 'Remove']]) {
      const button = element('button', 'quiet', label);
      button.dataset.action = action;
      button.dataset.id = entry.id;
      button.setAttribute('aria-label', `${label} ${description}`);
      actions.append(button);
    }
    row.append(symbol, content, actions);
    return row;
  }));
}
function amountField(metric, value = '', suffix = '') {
  const field = element('label', 'field');
  const id = `${metric.key}${suffix}`;
  field.htmlFor = id;
  field.append(element('span', 'field-label', metric.label));
  const wrap = element('div', 'input-wrap');
  const input = element('input');
  Object.assign(input, { id, name: metric.key, type: 'text', inputMode: 'decimal', placeholder: '0', value });
  input.autocomplete = 'off';
  input.setAttribute('aria-describedby', `${id}-unit`);
  const unit = element('span', 'unit', metric.unit);
  unit.id = `${id}-unit`;
  wrap.append(input, unit);
  field.append(wrap);
  return field;
}
export function buildEntryFields(type, entry, date, foodKeys = METRICS.filter(m => m.key !== 'fluid').map(m => m.key)) {
  byId('entry-form').reset();
  byId('entry-error').hidden = true;
  byId('entry-title').textContent = `${entry ? 'Edit' : 'Log'} ${type === 'fluid' ? 'fluid' : 'food'}`;
  byId('entry-kind').textContent = type === 'fluid' ? 'DRINKS & WATER' : 'FOOD & NUTRIENTS';
  byId('entry-date').textContent = displayDate(date);
  const nodes = [];
  if (type === 'food') {
    const label = element('label', 'field');
    label.htmlFor = 'description';
    const title = element('span', 'field-label', 'Description');
    title.append(element('span', 'optional', ' optional'));
    const input = element('input');
    Object.assign(input, { id: 'description', name: 'description', type: 'text', placeholder: 'e.g. chicken', value: entry?.description ?? '' });
    input.maxLength = 500;
    label.append(title, input);
    nodes.push(label);
  }
  for (const metric of METRICS.filter(m => type === 'fluid' ? m.key === 'fluid' : foodKeys.includes(m.key))) {
    nodes.push(amountField(metric, entry?.amounts[metric.key] ?? ''));
  }
  if (type === 'food') nodes.push(element('p', 'form-hint', 'Enter nutrient amounts, not the weight of the food.'));
  byId('entry-fields').replaceChildren(...nodes);
}
export function buildGoalFields(doc, goalKeys = METRICS.map(m => m.key)) {
  byId('goals-error').hidden = true;
  byId('goal-fields').replaceChildren(...METRICS.filter(m => goalKeys.includes(m.key)).map(metric => {
    const row = element('div', 'goal-row');
    const label = element('label', '', metric.label);
    label.htmlFor = `${metric.key}-goal`;
    const inputs = element('div', 'goal-inputs');
    const select = element('select');
    select.id = `${metric.key}-comparison`;
    select.setAttribute('aria-label', `${metric.label} comparison`);
    for (const [value, text] of [['gte', '≥ Minimum'], ['lte', '≤ Limit']]) {
      const option = element('option', '', text);
      option.value = value;
      select.append(option);
    }
    select.value = doc.goals[metric.key]?.comparison ?? 'gte';
    const field = amountField(metric, doc.goals[metric.key]?.value ?? '', '-goal');
    field.querySelector('.field-label').remove();
    field.style.marginBottom = '0';
    inputs.append(select, field);
    row.append(label, inputs);
    return row;
  }));
}
export function showFormError(target, error) {
  const banner = byId(target);
  banner.textContent = error.message;
  banner.hidden = false;
  const form = banner.closest('form');
  form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  const field = error.field && byId(error.field);
  if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  else banner.scrollIntoView({ block: 'nearest' });
}
