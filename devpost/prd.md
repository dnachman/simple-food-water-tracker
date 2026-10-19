---
doc: prd
status: approved
---

# Simple Food and Fluid Tracker — Product Requirements

Working title. A personal tracker for eight daily metrics, centered on fast manual logging and clear progress against configurable goals.

Source: `scope.md > The Unique Kernel`, `The Core Loop`, and `The POC Boundary`. The PRD interview adds date-based history, entry editing and removal, separate food/fluid flows, and explicit goal comparisons. Trends remain deferred.

## The Core Journey

1. Open to today's dashboard, with progress visualizations for all eight metrics and quick access to logging.
2. Set or adjust goals on a separate settings screen: a value and either greater than or equal to (≥) or less than or equal to (≤) for each configured metric.
3. Tap the four-fluid-ounce water shortcut to save a fluid entry immediately, or open the amount-only fluid form for another quantity.
4. For food, open a full-screen form with an optional description followed by nutrient fields. Enter only the relevant amounts and save.
5. See the selected day's totals and goal comparisons update. Review its entries and edit or remove mistakes.
6. Select an earlier date to see that day's entries and dashboard metrics, compared with the current goals.
7. Return after closing the app and retain saved entries and goals. A new day starts with its own totals; previous entries remain available.

Source: `scope.md > The Core Loop` and `What "Working" Looks Like`.

## Screens and Layout

- **Dashboard:** Progress cards dominate the first screen. Include all eight metrics, clear date selection, access to goal settings, food logging, fluid logging, and the one-tap water shortcut. A daily entry list belongs below the visualizations, preserving their priority.
- **Food entry:** Full-screen on mobile. Optional description above a vertical list of the seven non-fluid nutrient fields, followed by save and cancel controls. The same form supports editing a food entry.
- **Fluid entry:** Separate full-screen amount-only form, with save and cancel controls. No description or food nutrient fields. The same form supports editing a fluid entry.
- **Goal settings:** Separate screen with each metric's goal value and comparison, plus save and cancel controls.
- **History:** Reuse the dashboard and daily entry list for the selected date; no separate trends surface.

Source: `scope.md > Inspiration & Identity` and `The POC Boundary`; expanded by the learner's dashboard, full-screen entry, settings, and history decisions.

## Look and Feel

- Dark theme that is easy on the eyes, using a card/modal style and layouts suited to mobile.
- Entry forms occupy the mobile screen rather than squeezing dashboard and entry controls together.
- Familiar, readable typography; no experimental or decorative modern fonts.
- Never use color alone to communicate progress or goal status. Pair visualizations with readable totals, units, comparison symbols, and status text. Keep controls and text distinguishable against the dark background.
- Fluid, protein, and calcium remain the top priorities while all eight metrics stay accessible.

## Features and Behavior

### Daily Metrics and Progress

Source: `scope.md > The POC Boundary` and `What "Working" Looks Like`.

Track fluid intake, protein, calcium, added sugar, calories, total fat, total carbohydrates, and fiber. Show the selected day's summed amounts and, where a goal is configured, the goal value and comparison.

- For ≥ goals, distinguish below goal from goal reached; exceeding the goal remains reached.
- For ≤ goals, distinguish within limit from over limit; filling a visualization must not imply that consuming more is desirable.
- Show actual amounts even beyond a goal or limit. Bound the drawn bar while preserving the real numeric result.
- Without a configured goal, show the total and a clear indication that no goal is set, rather than inventing a target or percentage.
- Changes to current goals apply to every date's comparisons. Historical intake amounts do not change.

Acceptance criteria:

- [ ] With protein set to ≥75 g, logging 30 g shows 30 g and 40% of the goal; logging another 45 g shows goal reached.
- [ ] With a metric set to ≤30 g, a total of 30 g is within limit and 31 g is over limit, with status understandable without color.
- [ ] Changing a protein goal from ≥75 g to ≥100 g changes a previous day's 30 g comparison from 40% to 30%, without altering its entries.

### Food Logging

Source: `scope.md > The Unique Kernel` and `The POC Boundary`.

The food form contains an optional description and fields for protein, calcium, added sugar, calories, total fat, total carbohydrates, and fiber. Amounts are nutrient quantities, not a food's serving weight. No lookup or calculation supplies missing values.

- Fill only the relevant fields. Blank fields contribute nothing to totals and are not presented as known nutrient content.
- A protein-only entry needs no description or other nutrient amounts.
- Saving creates one food entry with the supplied amounts and updates the daily metrics. Canceling makes no changes.

Acceptance criteria:

- [ ] Entering only 30 in protein saves without a description and affects only the protein total.
- [ ] Entering a description and multiple nutrients creates one entry and updates each supplied nutrient's total.
- [ ] Canceling an entry leaves both totals and entries unchanged.

### Fluid Logging

Source: `scope.md > The Unique Kernel` and `What "Working" Looks Like`.

Fluid logging is for drinks and water, not fluid contained in food. A dedicated form accepts only a fluid amount. The dashboard shortcut immediately saves four fluid ounces without opening a form or requesting confirmation.

Acceptance criteria:

- [ ] One tap adds exactly four fluid ounces, creates one fluid entry, and updates fluid progress.
- [ ] The separate fluid form saves a custom amount without any description or nutrient fields.
- [ ] Two intentional shortcut taps create two entries; an accidental duplicate can be removed.

### Goal Settings

Source: `scope.md > The Core Loop` and `The POC Boundary`.

Configure and change goals on a separate screen. Each metric supports a value and ≥ or ≤. Save applies the changes to current and historical dashboard comparisons; cancel preserves the existing settings. The screenshot's targets are not prefilled dietary recommendations.

Acceptance criteria:

- [ ] Save a ≥ protein goal and a ≤ added-sugar goal, then see the corresponding comparisons on the dashboard.
- [ ] Goals remain after closing and reopening the app.
- [ ] Changing a goal does not change or delete logged intake.

### Entries, Corrections, and History

Source: `scope.md > The Core Loop`; persistence and correction detail was explicitly resolved in the PRD interview.

Retain entries by day. The selected date determines the dashboard totals and visible entry list. Each entry shows its type, description if supplied, and recorded amounts with units. Support editing or removing an entry; update that day's metrics without affecting other dates.

Acceptance criteria:

- [ ] Reopening the app preserves saved entries and goals.
- [ ] Selecting a previous date shows only that day's entries and totals, compared against current goals.
- [ ] Editing a protein entry from 30 g to 20 g reduces the day's total by 10 g; removing it subtracts its remaining contribution exactly once.
- [ ] A new day shows zero totals until entries exist, while the previous day remains available and goals persist.

## States and Boundaries

- **First use / no goal:** Show zero daily totals, an empty entry list, and access to settings and logging. No goal-based percentage appears until a goal is set.
- **Empty selected day:** Keep metric visualizations visible at zero and say there are no entries for that date.
- **Invalid input:** Require at least one positive nutrient amount for a food entry, or a positive fluid amount. Reject negative or nonnumeric amounts, and require positive values for configured goals. Keep entered values visible and identify the field needing correction; do not save a partial entry.
- **Save failure:** Show that saving failed, preserve the form values, and allow retry. Do not present unsaved data as a successfully saved entry.
- **Successful save/edit/removal:** Update totals and entries together. Closing a form without saving leaves existing data unchanged.
- **New day:** Start a new day's totals rather than deleting yesterday's data.
- **History:** Use current goals for every date. Goal history and trends are outside the MVP.

## Product Decisions

- Progress visualizations dominate the opening dashboard, with quick access to logging.
- Food entry uses a description above nutrient fields; fluid entry is a separate amount-only flow.
- Goals live on a separate screen and include ≥ or ≤ comparisons.
- Preserve daily entries and allow viewing previous entries and dashboard metrics; defer trending.
- Support removing or editing entries to correct mistakes.
- Use current goals for historical comparisons because this is simpler for the MVP.
- Use dark cards, full-screen mobile entry, familiar fonts, and color-independent status cues.

## Approved Defaults

These defaults complete details not explicitly chosen in the interview and were adopted when the learner approved the draft.

- **Units:** US fluid ounces for drinks, grams for protein/sugar/fat/carbohydrates/fiber, milligrams for calcium, and kcal for calories. Accept decimal amounts. No unit conversion in this version.
- **Dates and historical corrections:** Use the device's local calendar day. Open on today; date selection supports viewing and correcting earlier days. New entries belong to the selected day, clearly displayed on the form; the water shortcut also applies to that selected day.
- **First use:** Start without prefilled goals and allow logging before setting them. Goals can be left unset or cleared to show totals only.
- **Saving boundary:** Require persistence across visits on the same device/browser for the MVP. Accounts, cross-device sync, and backup/export are deferred; technical planning chooses how saving works.
- **Entry list placement:** Place it below the dashboard cards, with edit and remove actions per entry. Preserve the original date when editing.
- **Working title:** Keep “Simple Food and Fluid Tracker” until a final name is chosen; a final name does not block the prototype.

## What We're Building

A dashboard for all eight metrics; current-goal comparisons using ≥ or ≤; full-screen food and amount-only fluid forms; one-tap four-fluid-ounce logging; editable goals; saved daily entries with edit/remove; and date navigation to previous entries and dashboard metrics. Include the empty and error states above.

## Deferred From the POC

- Food database lookup, serving-size nutrient calculation, and barcode scanning: explicitly deferred to preserve quick manual entry and a small build.
- Trends and aggregate metrics across dates: requested for later; individual historical days are sufficient now.
- Historical goal snapshots: current goals apply everywhere for simplicity.
- Accounts, cross-device sync, backup/export, and unit conversion: proposed deferrals to keep this a small personal prototype.

## Possible Later Enhancements

Add food lookup and barcode identification when manual logging proves useful. Build trends from retained daily entries and consider additional nutrients after the eight included metrics work.

## Non-Goals

- Mandatory food identification or search before logging: conflicts with the core shortcut behavior.
- Automatic nutrient inference, dietary recommendations, or phase-based goals: the user supplies amounts and targets.
- A broad nutrition platform: preserve the small logging-and-progress loop.

## Open Questions

- No unresolved product questions block `4-spec`.
- Sites suitability and the implementation of saving belong in `4-spec`; no technical approach is selected here.

## Demo Acceptance

Demonstrate the core in about a minute: set a protein goal of ≥75 g, tap to log four fluid ounces, save 30 g of protein labeled “chicken,” see 40%, and edit or remove the entry to show totals updating. Separately verify all eight fields, ≤ limits, historical dates, current-goal changes, persistence, and invalid-input handling. The short demo video and public GitHub repository remain required for the hackathon; deployment is optional.
