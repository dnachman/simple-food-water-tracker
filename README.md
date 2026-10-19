# Simple Food/Water Tracker

Static browser application for manual tracking of fluid intake, protein, calcium, added sugar, calories, total fat, total carbohydrates, and fiber.

## Requirements

- Node.js. Development verification used Node 26.10.0.
- A current browser with JavaScript and localStorage enabled.
- No package installation, API keys, account, database, or build step is required to run locally.

## Run

From the repository root:

```sh
node sites/food-fluid-tracker/scripts/preview.mjs
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/). Stop the server with Ctrl+C.

For a local 390 × 844 responsive-layout check, open [the mobile preview helper](http://127.0.0.1:8000/__preview/mobile). This iframe check does not replace testing on a phone.

## Verify

```sh
node --test sites/food-fluid-tracker/tests/*.test.mjs
```

Use synthetic data when testing or recording. Set a protein goal of ≥75 g, add 30 g through Log food, and check that protein displays 40%. The water shortcut adds 4 US fl oz in one tap. Check editing/removal and date selection using the entry list and tracking-date controls.

## Data and Units

Entries and goals are stored only in this browser and site origin. Clearing site data removes them. Other devices, browsers, and URLs do not share records. Historical dates use the current goal settings. No cross-device sync or backup is provided.

Fluid uses US fl oz; calcium uses mg; calories use kcal; the remaining nutrients use g. Values are entered manually, with optional food descriptions. Barcode scanning, database lookup, unit conversion, and multi-day trends are not included.

## Source and Planning Documents

- [Application files](sites/food-fluid-tracker/dist/)
- [Tests](sites/food-fluid-tracker/tests/)
- [Scope](devpost/scope.md), [product requirements](devpost/prd.md), and [technical specification](devpost/spec.md)
- [Completed build checklist](devpost/checklist.md)
- [Offline app map](devpost/app-map.html)

This repository is a reviewed release snapshot of the completed MVP. Original application source commit: `6cc70cb060608e728553046a06eaa454220461b4`. The original local/Sites repository histories are separate and are not included in this snapshot. The learner profile and curriculum files are excluded.

## Hosting

The app can be served as static assets. The existing `.openai/hosting.json` is the original private Sites deployment configuration, not a credential or authorization to manage that Site. Cloning this repository does not grant access to it. Use the local instructions above for testing; a separate deployment needs its own hosting configuration.

## License

See [LICENSE](LICENSE).
