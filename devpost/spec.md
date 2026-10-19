---
doc: spec
status: approved
---

# Simple Food and Fluid Tracker — Technical Spec

## How This Works, In Plain Language

Sites serves a small static app written in HTML, CSS, and JavaScript. All tracking runs in the browser. When you save an entry, the app validates it, saves the updated entries and goals in that browser's localStorage, then refreshes the dashboard.

Each entry has a calendar date. Selecting a day filters the entries and recalculates its totals against the current goals. Changing goals updates the comparisons for every date without modifying intake records. The app needs no application server, database, API key, or food service.

This is the learner-approved recommendation for quick delivery and exploration of Sites. Saving is specific to the browser and site origin: localhost and the deployed Site have separate data. Clearing site data removes the records; another device does not receive them.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. Load HTML, CSS, and JavaScript modules from the static host. Read and validate the saved document, or initialize empty data if no document exists. Open on the device's local calendar date.
2. Filter entries by the selected date. Sum the eight metrics and calculate goal status. Render progress cards and the entry list.
3. The water shortcut constructs a fluid entry of 4 US fl oz for the visibly selected date. A custom drink uses the amount-only form. Food uses its separate description-and-nutrients form.
4. Parse and validate the proposed entry. Build a new data document and write it successfully before updating the displayed saved state. On failure, keep the existing totals and draft input, and show an error.
5. Editing replaces the matching entry by ID, preserving its date; removing deletes only that ID. Recalculate totals from entries rather than incrementally adjusting cached totals.
6. Goal settings save the current goal map through the same persistence boundary. Every date uses that map.
7. Date navigation changes only the filter. The same dashboard and list show earlier entries; no separate history database or trends system exists.

## Stack

- **HTML + CSS:** Semantic controls and responsive cards. Native `<dialog>` handles modal focus and keyboard behavior; entry dialogs become full-screen on mobile. [Dialog documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
- **JavaScript ES modules:** Small modules with DOM rendering and event handlers. No framework, transpiler, dependency installation, or application build step.
- **localStorage:** One versioned JSON document for entries and current goals. [Storage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- **Sites:** Static hosting for the checked source. Use the installed Sites workflow and native tools; no Worker, D1, R2, or connector integration. [Sites documentation](https://learn.chatgpt.com/docs/sites).
- **Node's built-in test runner:** Tests for calculations, validation, dates, and persistence failure behavior without third-party test packages. Node v26.10.0 is available in this workspace. [Test runner documentation](https://nodejs.org/api/test.html).
- **Node HTTP server:** A small dependency-free `scripts/preview.mjs` serves the static directory for local preview using Node's built-in HTTP and filesystem modules. Node is the only local runtime required. [HTTP documentation](https://nodejs.org/api/http.html).

Versions of browser APIs are not pinned; target current mobile Safari and Chromium. There are no npm runtime dependencies to resolve or lock.

## Where It Runs and How Someone Tries It

### Local Preview and Recording

From the repository root, after `5-build` creates the files:

```sh
node sites/food-fluid-tracker/scripts/preview.mjs
```

Open `http://127.0.0.1:8000/` in a browser. Use this exact origin consistently when checking saved data; changing the host or port changes storage. Do not open the HTML with a `file:` URL.

The preview script binds to `127.0.0.1:8000`, prints that URL, and resolves `dist/` relative to its own file so it works regardless of the working directory. Serve HTML, CSS, and `.mjs` with the correct content types, return 404 for missing files, and reject requests outside the static directory. It serves only application assets, not the repository, documents, or local tooling files. This script is development tooling and is not deployed to Sites.

For a local responsive-layout check, `http://127.0.0.1:8000/__preview/mobile` places the same app inside a 390 × 844 iframe. This helper route exists only in the Node preview server and is not a substitute for testing on a real phone.

Run the dependency-free tests from the repository root:

```sh
node --test sites/food-fluid-tracker/tests/*.test.mjs
```

Record the PRD's minute-long core demo locally or on the deployed Site. A short demo video and public GitHub repository remain required; hosting is optional for the hackathon and does not replace either.

### Sites Publication

The learner chose Sites as the intended host. During `5-build`, use a new project in `sites/food-fluid-tracker/`; do not create or deploy a Site during this specification step.

1. Inspect `.openai/hosting.json` before registration; reuse any existing project ID and resolve an uncertain registration before retrying.
2. Register a new private Site when no identity exists. Persist the returned ID with the Sites `set-project-id.mjs` helper.
3. Declare `static.directory` as `dist` in `.openai/hosting.json`. Do not add storage or server bindings.
4. Complete checks, then run the installed Sites source workflow helper from this subdirectory to synchronize source and package the static artifact. Pass credentials only through the helper's hidden stdin contract, never files or command arguments.
5. Publish the matching verified source commit and archive with the private deployment tool. Preserve returned version IDs and use the returned URL; keep the Site private unless the learner requests another audience.
6. Verify the actual hosted URL's logging, reload persistence, and navigation in the intended browser. Report any inability to run hosted browser checks separately from successful deployment.

The installed Sites plugin owns deployment API contracts. Use its current native tools rather than hand-written REST calls. A public source repository is separate from Site visibility and contains code and documentation, not runtime tracking data or credentials.

## Look and Feel

Implements `prd.md > Look and Feel` and `Screens and Layout`.

- Dark neutral page background, slightly lighter cards, high-contrast off-white text, muted secondary text, and restrained accents. Define colors centrally with CSS custom properties and verify their contrast.
- Use the system sans-serif stack; no remote fonts or decorative display typography.
- Order metrics fluid, protein, calcium, added sugar, calories, total fat, total carbohydrates, fiber. Give the top three visual priority without hiding the others.
- One-column mobile layout; expand the card grid as space allows. Keep dashboard actions easy to reach and the selected date visible.
- Full-screen entry dialogs on narrow screens with a scrollable body, safe-area padding, and clear save/cancel controls. Wider screens may use centered dialogs. Goals remain a distinct settings surface.
- Status text includes “Below goal,” “Goal reached,” “Within limit,” “Over limit,” or “No goal set,” alongside units and ≥/≤. Color is supplemental; bars and text communicate the result independently.
- Use labeled inputs, visible keyboard focus, decimal-friendly mobile keyboards, comfortable tap targets, live save/error announcements, and focus restoration when dialogs close. Keep motion minimal and honor reduced-motion settings.

## Components

### App Controller and Navigation

`dist/app.mjs` owns the selected date, loaded document, active dialog, and unsaved form drafts. It wires events to the domain and storage modules, then updates the UI. Only saved data drives dashboard totals. Keep selected date and open forms transient; reopen on today.

Implements `prd.md > The Core Journey` and `Screens and Layout`.

### Metric Definitions and Calculations

`dist/domain.mjs` defines the eight stable metric keys and units, input validation, immutable entry/goal updates, date filtering, aggregation, and goal comparisons. It contains no DOM or localStorage access, enabling direct tests.

For a positive configured goal, percentage is `total / goal * 100`; drawn fill is clamped to 0–100%, while text keeps the actual amount and percentage. ≥ is reached at or above the value; ≤ is within limit at or below it. Do not describe an upper-limit bar as progress to consume more. Normalize floating-point aggregation so decimal values do not incorrectly flip equality comparisons; test 0.1 + 0.2 against 0.3.

Implements `prd.md > Daily Metrics and Progress` and `States and Boundaries`.

### Dashboard and Daily Entry List

`dist/ui.mjs` renders all eight progress cards, the date selector, quick actions, and the selected day's entry list. Use semantic DOM creation and `textContent` for user descriptions; never interpolate user text into HTML.

Rows show the entry type, optional food description, explicitly supplied amounts and units, and edit/remove controls. A nutrient omitted from a food entry contributes zero to totals but is not listed as known zero content. A successful mutation rerenders the relevant totals and list together.

Implements `prd.md > Daily Metrics and Progress` and `Entries, Corrections, and History`.

### Food Entry Form

Food dialog fields: optional description, then protein, calcium, added sugar, calories, total fat, total carbohydrates, fiber. Allow blank fields; require at least one positive amount. Explicit zeros are valid alongside a positive amount. Reject negative, nonnumeric, or non-finite values. Display units next to fields. Save one entry containing only supplied fields.

Editing preloads that entry and preserves its ID and date. Cancel makes no saved changes; failed validation or saving preserves the draft.

Implements `prd.md > Food Logging` and `States and Boundaries`.

### Fluid Entry Form and Shortcut

Fluid dialog accepts one positive decimal US fl oz amount and shows the entry date; no description or food nutrients. The shortcut bypasses the form and saves an entry of exactly 4 US fl oz for the dashboard's selected day. Each intentional tap creates its own ID. On storage failure, report failure without increasing totals.

Implements `prd.md > Fluid Logging`.

### Goal Settings Form

For each metric, provide a comparison selector (≥/≤) and optional positive decimal value. Blank means no goal; clearing a value removes that goal. Validate the full draft before saving it as one change. No suggested dietary targets are prefilled. Closing without saving discards draft changes.

Implements `prd.md > Goal Settings` and `Approved Defaults`.

### Date Handling

Use local year/month/day components to produce `YYYY-MM-DD`, not UTC `toISOString()` slicing. Keep entry dates as plain calendar strings rather than interpreting them as UTC timestamps. Display the selected day on entry forms, including when viewing history.

Check the local day on focus/visibility return and at local midnight. If the dashboard was following today, advance it to the new today; preserve a deliberately selected historical date. A form already open keeps its displayed entry date until saved or canceled. Never delete old records at rollover.

Implements `prd.md > Entries, Corrections, and History`, `States and Boundaries`, and `Approved Defaults`.

### Persistence Adapter

`dist/storage.mjs` exposes load and commit operations with an injectable Storage interface for tests. Store a JSON document under `food-fluid-tracker:v1`.

Read → parse → validate before use. A missing key is a fresh installation; malformed or unsupported-version data is an error, not an empty account. Preserve the original data and block writes rather than silently resetting it. Catch read/write exceptions and show a visible error. On any failed write, keep existing saved state and form input. Do not fall back to a temporary session while claiming persistence.

Commit the candidate document with one `setItem` call before applying it to application state. Listen for storage events to refresh saved data from another tab without discarding an open form draft. Re-read the latest valid document before mutations to reduce stale-tab overwrites; simultaneous multi-tab editing is not a collaborative sync guarantee.

Implements `prd.md > Entries, Corrections, and History` and `States and Boundaries`.

## Data Model

One stored document:

```js
{
  schemaVersion: 1,
  entries: [
    {
      id: "unique-id",
      date: "2026-10-16",
      type: "food",
      description: "chicken", // optional
      amounts: { protein: 30 } // only supplied non-fluid metrics
    },
    {
      id: "another-unique-id",
      date: "2026-10-16",
      type: "fluid",
      amounts: { fluid: 4 }
    }
  ],
  goals: { protein: { comparison: "gte", value: 75 } }
}
```

This is an illustrative shape, not seeded user data. Initialize with empty entries and goals. Use stable unique IDs generated at entry creation; replacing an entry preserves its ID and date. Persist only after successful validation. Never store computed totals or goal snapshots.

Metric keys and units:

| Key | Label | Unit |
| --- | --- | --- |
| fluid | Fluid intake | US fl oz |
| protein | Protein | g |
| calcium | Calcium | mg |
| addedSugar | Added sugar | g |
| calories | Calories | kcal |
| totalFat | Total fat | g |
| totalCarbohydrates | Total carbohydrates | g |
| fiber | Fiber | g |

Goal keys are optional; values are positive finite numbers and comparisons are `gte` or `lte`. Food amounts are nonnegative finite numbers with at least one positive; fluid amount is positive. Unknown metrics, duplicate IDs, invalid dates, and incompatible entry fields fail schema validation.

Saved data survives navigation and reopening on the same origin/browser. Selected date, active dialog, draft input, and derived totals live only in memory. Drafts need not survive reload. Runtime data is never written into source files, the public repository, or the deployment archive.

## File Structure

```text
DevPostLearnHackathon/
├── devpost/
│   ├── learner-profile.md         # Personal context; ignored by Git
│   ├── scope.md                   # Approved scope
│   ├── prd.md                     # Approved behavior
│   └── spec.md                    # This blueprint
├── sites/
│   └── food-fluid-tracker/
│       ├── .openai/
│       │   └── hosting.json       # Sites ID + static.directory after registration
│       ├── dist/
│       │   ├── index.html         # Dashboard shell and dialog structure
│       │   ├── styles.css         # Dark responsive cards and entry surfaces
│       │   ├── app.mjs            # Events, navigation, save orchestration
│       │   ├── domain.mjs         # Metrics, validation, dates, calculations
│       │   ├── storage.mjs        # Versioned persistence boundary
│       │   └── ui.mjs             # DOM rendering and form interactions
│       ├── scripts/
│       │   └── preview.mjs        # Node-only static preview at 127.0.0.1:8000
│       ├── tests/
│       │   ├── domain.test.mjs     # Goal boundaries, totals, dates, corrections
│       │   └── storage.test.mjs    # Round trip, rejected data, failed writes
│       └── README.md              # Run, verify, deploy, and storage limitations
└── .gitignore                     # Personal context, credentials, local tooling state
```

`dist/` is directly authored static source, not generated output; keep it tracked. Publish only the static directory as application assets. Existing curriculum folders remain course material, not app components. Follow Sites helper-managed source rules when its source repository is initialized inside the app folder; do not accidentally package the outer learning workspace.

## External Services and Dependencies

- **Application runtime:** No external service calls. Static requests retrieve HTML/CSS/modules; entries and goals stay in localStorage. No fetch-based food service, AI model, application API, analytics, remote fonts, or CDN is required.
- **Sites hosting:** Registration, source synchronization, version saving, and private deployment are build-time native Sites operations. Hosting uses `.openai/hosting.json` with the returned `project_id` and `static: { directory: "dist" }`. Source credentials remain transient and are handled by the installed helper, not application code. See [Sites](https://learn.chatgpt.com/docs/sites) and [managing a Site](https://learn.chatgpt.com/docs/sites/managing-a-site).
- **Costs and limits:** No per-entry model/API cost. Sites plan limits and availability are account-dependent; no specific price, quota, or free allowance is assumed. Verify any reported account/deployment restriction during registration rather than promising availability.
- **Browser storage:** Origin-scoped, cleared when site data is cleared; private browsing has different retention. See [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). A private Site does not make local records sync to another browser.

## Important Failure Modes

- **Storage blocked, full, unreadable, or invalid:** Preserve existing data and draft input, show a clear error, and avoid false save success. A malformed document is not automatically overwritten.
- **Wrong day due to UTC conversion or rollover:** Use local calendar strings, show the selected date, keep open forms tied to their displayed date, and verify rollover without deleting history.
- **Sites packaging/deployment or hosted persistence fails:** Retain the working local app and report the precise failure. Do not claim the hosted workflow or storage is verified until checked. Local recording remains available, but any authorized Sites deployment work still needs completion or a concrete blocker.

## Verification Approach

Automate meaningful domain and persistence checks with Node's test runner: ≥/≤ boundaries, no goal, over-goal amounts, decimal sums, partial entries, invalid input, editing/removal without duplicate contributions, date isolation, local dates near a UTC boundary, schema round trips, invalid saved documents, and failed writes leaving state unchanged.

Browser-check the actual user journey at a narrow mobile viewport and desktop: all eight cards, keyboard focus and labels, full-screen entry, protein-only save, multiple nutrient save, custom fluid, one-tap water, cancel, edit/remove, settings clear/save/cancel, historical dates with current goals, reload persistence, empty state, and storage-error feedback. Check the local-day transition and confirm status remains understandable without color. Render user-supplied descriptions safely as text.

Repeat a focused smoke test on the final Sites URL, especially save → reload → history, because hosted and local origins differ. Use only synthetic demonstration data for checks. Document which browsers and checks actually ran; do not imply browser coverage from unit tests or deployment success alone.

## What Was Simplified and Why

- Browser-local records rather than a hosted database: matches approved same-device saving and avoids accounts and server code.
- Static modules and native controls rather than a framework/component or chart library: enough for four small surfaces, no install/build pipeline.
- Derived daily totals and current goals rather than saved aggregates and historical goal versions: simpler edits and consistent comparisons.
- Date-filtered dashboard rather than a trends subsystem: supplies the requested historical view without analytics scope.

## Decisions and Open Issues

- **Learner-approved:** Plain HTML/CSS/JavaScript, browser-local saving, and Sites hosting. The learner accepted the recommendation after the storage tradeoffs were explained.
- **Derived implementation details:** ES modules, native dialogs, one versioned storage document, separate domain/storage/UI modules, direct static assets, and dependency-free tests implement that choice without expanding the product.
- **Useful unknown:** The learner wanted to see how Sites works. Research confirmed a static workflow in the installed Sites skill and official docs. The concrete learning moment during build is registering the Site, publishing the static directory, and verifying origin-specific saving on the actual URL; neither deployment nor hosted persistence has been attempted yet.
- **Accepted persistence tradeoff:** No cross-device sync or backup; clearing browser site data loses records. Local and hosted URLs do not share records.
- **Local preview decision:** The learner requested Node in place of Python. Use a small built-in-module static server, retaining the dependency-free setup and the same local origin.
- **Dependency checks:** Node v26.10.0 was verified locally. Browser APIs and test runner docs were checked; hosted storage/access behavior remains a build verification item.
- **Remaining questions:** None block review. Actual Site identity, URL, deployment status, and QA results will be recorded during build. No application code or Site has been created in this step.
