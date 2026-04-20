# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static HTML/CSS/JS prototype of "Желание" — a Russian-language charity service where donors fulfil specific wishes of specific children. No backend, no build step, no tests.

## Run locally

Open `wishful_app_2.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000/wishful_app_2.html`.

## File layout

- `wishful_app_2.html` — HTML shell for all 8 screens (welcome, wish creation, moderation, catalog, details, payment, tracking, result) and the gratitude modal. Only structure — no inline styles or script.
- `styles.css` — all design tokens (CSS custom properties on `:root`) and component styles.
- `app.js` — entire runtime: state, demo data, navigation, rendering.

## Architecture

- **Single global `state` object** in `app.js` holds role, selected wish, selected budget, anonymity flag, tracking step, filters, etc. All mutations go through small top-level functions (`selectBudget`, `setFilter`, `selectPayMethod`, `toggleAnon`, `advanceTracking`).
- **Screens** are sibling `<div class="screen">` elements inside `#app-shell`. Only one is `.active` at a time. `goTo(screenId)` flips the active class. There is no router — every transition is an imperative call.
- **Rendering** is template-string + `innerHTML` per screen (`renderModerationScreen`, `renderCatalog`, `renderDetails`, `renderPaymentScreen`, `renderTracking`, `renderResult`). Selecting a wish from the catalog calls `renderDetails(w)` which also primes the payment screen via `renderPaymentScreen(w)`.
- **Demo data** lives in the `demoWishes` array. Wishes created via the form are `unshift`-ed onto `catalogItems` and marked `isNew:true`. All data is in-memory — a reload wipes user-created wishes.
- **Moderation and tracking** are simulated with `setTimeout` chains (`runModeration`, `advanceTracking`), not real async work.

## Conventions that matter

- **Always pass wisher-controlled strings (name, city, wish, reason, category) through `escapeHtml()` before interpolating into `innerHTML` templates.** The helper lives near the top of `app.js`. User-submitted wishes flow into six render functions; skipping the escape reintroduces XSS.
- Avatar colors come from the `COLORS` array; category emoji from the `ICONS` map. Both are controlled vocabularies — no need to escape when used as class names or lookup results.
- Prices and ages are formatted with `toLocaleString('ru')`.
- UI copy is Russian; keep new strings in Russian for consistency.

## Git workflow

Feature work happens on branch `claude/project-analysis-improvements-ELLeo` (see the branch requirement in session context). Default branch is `main`.
