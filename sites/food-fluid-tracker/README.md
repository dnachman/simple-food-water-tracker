# Food & Fluid Tracker

A static personal tracker using HTML, CSS, JavaScript modules, and browser-local saving. No npm dependencies or build step.

## Run locally

From the outer project root:

```sh
node sites/food-fluid-tracker/scripts/preview.mjs
```

Open http://127.0.0.1:8000/. From this application directory, use `node scripts/preview.mjs`.

## Verify

From the outer project root:

```sh
node --test sites/food-fluid-tracker/tests/*.test.mjs
```

Use synthetic demo entries: set protein to ≥75 g, log 30 g of protein, confirm 40%, add 4 fl oz of water, and reload.

For a 390 × 844 responsive-layout check, open http://127.0.0.1:8000/__preview/mobile . This is local development tooling; test on an actual mobile browser before claiming device coverage.

## Daily use

- The dashboard shows fluid intake, protein, calcium, added sugar, calories, total fat, total carbohydrates, and fiber.
- Log drinks with an amount-only form or the one-tap 4 US fl oz shortcut. Food entries have an optional description and seven nutrient fields; fill only known amounts.
- Configure ≥ minimums or ≤ limits in Daily goals. Blank goals show totals only. All dates use the current goals.
- Use the date picker or previous/next controls for historical days. New entries and the water shortcut apply to the visibly selected date.
- Edit or remove an entry from that day's list. Editing retains its original date.
- Reopening starts on today; midnight advances a dashboard following today without deleting past records. An already open entry form retains its displayed date.

### Units

Fluid: US fl oz. Protein, added sugar, total fat, total carbohydrates, fiber: g. Calcium: mg. Calories: kcal. Decimal amounts are supported; no unit conversion or automatic nutrient lookup is included.

## Saving

Entries and goals stay in localStorage for the current browser and site origin. Localhost and the hosted Site have separate records. Clearing site data removes the records; private browsing may not retain them. No cross-device sync or backup is provided.

## Sites

The tracked `.openai/hosting.json` identifies the private Site and its `dist` static directory. Use the Sites plugin's source synchronization and private deployment workflow. Keep source credentials transient; never put tokens or runtime user records in the repository.

The Site stays private. Publication does not make browser records shareable: each browser/origin has its own data. The local preview server serves only the static app; it is not used by the deployed Site.
