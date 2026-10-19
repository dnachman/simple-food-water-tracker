---
doc: scope
status: approved
---

# Simple Food and Fluid Tracker

A small personal tracker for fluid intake, protein, calcium, added sugar, calories, total fat, total carbohydrates, and fiber, with fast manual logging and visual daily feedback. Working title only.

## The Unique Kernel

Track the few amounts that matter without the complexity of broader food trackers. Add four fluid ounces of water with one tap, or record 30 grams of protein by entering an amount without searching for a food.

## Who It's For

The learner, who prioritizes fluid, protein, and calcium and also wants to monitor added sugar, calories, total fat, total carbohydrates, and fiber. They find other tracking apps overly complicated. Their current tracking routine was not specified.

## The Core Loop

Open the tracker, quickly record a drink or nutrient amount, optionally label the food, and immediately see today's totals and progress toward configured goals. Return throughout the day to log more and check progress. Set and change personal daily goals as needs evolve.

## Inspiration & Identity

Very simple, with minimal steps and little typing. Progress should be visible as a chart or progress bar. No specific visual reference or aesthetic has been selected.

The learner supplied a screenshot of a nutrient-priority table to specify tracking coverage. Visible rows include protein, added sugar, calories, total fat, total carbohydrates, and fiber. They confirmed that no additional metrics were hidden by the notification: the eight listed metrics cover the MVP. The screenshot's dietary targets and phase guidance are not adopted as app defaults.

## Why This Matters to the Learner

Focus on the learner's selected nutrients and fluid intake without the clutter of more complicated apps. Fluid, protein, and calcium remain the top priorities. Get an MVP out very quickly, ideally exploring Codex or ChatGPT Sites; platform suitability remains a technical-planning decision.

## What "Working" Looks Like

Set personal goals for fluid, protein, and calcium. Tap once to add four fluid ounces of water and see fluid progress update. Enter 30 grams of protein with an optional label such as "chicken"; against a 75-gram protein goal, see 40% progress. Manually log calcium and the other included nutrients and see daily totals update. Change a goal and see progress reflect it.

This loop should be demonstrable on screen in under a minute. The hackathon targets 2–4 hours of active work and requires a short demo video and public GitHub repository; deployment is optional.

## The POC Boundary

- Track fluid, protein, calcium, added sugar, calories, total fat, total carbohydrates, and fiber for the day.
- Set and change personal daily goals, including fluid, protein, and calcium.
- Log amounts directly, with optional food labels and manually supplied nutrient amounts.
- Provide a one-tap shortcut for four fluid ounces of water.
- Show visual progress against daily goals after logging.

Detailed screens, units, entry correction, saving behavior, and day boundaries will be defined in the PRD. Also define which metrics use a target, an upper limit, or totals only; more is not automatically better for every metric.

## Later

- Food lookup and serving-size nutrient calculation.
- Barcode scanning to identify packaged foods.
- Nutrients beyond the eight included metrics, if useful later.

## Explicitly Cut

- Mandatory food search or identification before logging: it would defeat direct, minimal-input logging.
- Lookup and barcode scanning in the first version: the learner explicitly deferred them to keep the initial version simple and quick to build.
