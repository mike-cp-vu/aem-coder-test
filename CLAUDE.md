# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @AGENTS.md for the full project conventions (block contract, code style, three-phase page loading, publishing process). This file adds context specific to this repo's current state that AGENTS.md doesn't cover.

## Commands

- `npm install`
- `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` — local dev server at `localhost:3000` (or `aem up` if the CLI is installed globally)
- `npm run lint` — runs `lint:js` (eslint) + `lint:css` (stylelint); `npm run lint:fix` autofixes both
- There is no test suite and no per-file lint command wired up; scope eslint/stylelint manually if needed, e.g. `npx eslint blocks/cards/cards.js`
- CI (`.github/workflows/main.yaml`) runs only `npm ci && npm run lint` on every push

## Migration-in-progress state

This repo was bootstrapped from `aem-boilerplate` and is mid-migration of the **entire** `https://www.ensemble.com/` site (not just Contact) into Edge Delivery Services. Content is authored through **Adobe Document Authoring (DA / da.live)**, gated by DA's content-approval workflow before publish — **Google Docs are not part of this workflow**; `migration-work/contact-google-doc.html` is a leftover from the old contact-only process and should not be used as a template for new pages.

- `.migration/project.json` — preview org `mike-cp-vu`, site `aem-coder-test`, and the Block Library URL used for block discovery during migration
- `.migration/plans/ensemble-site-migration.md` — the master plan: full site crawl, page-to-block mapping, and the phased approach for the remaining pages
- `.migration/plans/contact-page-migration.md` — **done**, kept as the reference archetype for `form-contact`/`cards-office`/`cards-team`
- `tools/importer/` — import infrastructure: page templates (`page-templates.json`), source URL lists, block `parsers/` (`form-contact.js`, `cards-office.js`, `cards-team.js`), and `transformers/` (`ensemble-sections.js`, `ensemble-cleanup.js`). Import reports land in `tools/importer/reports/`.

When migrating another page, follow the master plan's shape: scrape → survey the block palette below for reuse before building anything new → add parsers/transformers under `tools/importer/` → generate DA-compliant content HTML via the import script (don't hand-write it) → upload to DA and clear the content-approval gate → verify locally against the source **at every responsive breakpoint**, not just desktop → port over CSS for visual parity. See AGENTS.md's "Migration & Styling Rules" for the mandatory visual-fidelity gate.

## Block palette

- `hero`, `columns`, `cards`, `header`, `footer`, `fragment`, `widget` — stock boilerplate blocks, largely unmodified.
- `cards-office`, `cards-team` — variants of `cards` created for the contact migration (office/location grid and team member grid). Each ships a `metadata.json` describing `baseBlock`, `variantName`, visual/content characteristics, and reuse guidance — check existing variant metadata before authoring a new variant; a suitable one may already exist.
- `form-contact` — a self-contained "form" block variant, hand-rolled because no generic `form` block or forms plugin exists in this project. The authored table shape (field type / label / name / required-or-options per row) is documented in the header comment of `blocks/form-contact/form-contact.js`. Wire up a real submit endpoint before treating it as production-ready.
- When a new block variant specializes an existing one, add a `metadata.json` next to it in the same shape as `cards-office`/`form-contact` (`baseBlock`, `variantName`, `sourceContext`, `visualCharacteristics`, `contentPattern`, `reuseGuidance`, `usage`) so it stays discoverable during future migrations.

## Deviations from stock aem-boilerplate in `scripts/scripts.js`

`scripts/scripts.js` in this project extends the standard boilerplate flow (`decorateMain` → `loadEager`/`loadLazy`/`loadDelayed`) with:

- A Trusted Types `default` policy installed at module load, before anything else runs. It sanitizes `srcdoc` iframe injection and strips `<script>` tags from `createContextualFragment`/`document.write` sinks — required because this site enforces Trusted Types and the decoration pipeline relies on those sinks.
- `buildWidgetAutoBlocks`, called from `buildAutoBlocks` — auto-converts any `a[href*="/widgets/"]` link into a `widget` block, in addition to the stock `*/fragments/*` auto-blocking.
- `decorateSectionMetadata`, called from `decorateMain` right after `decorateSections` — not present in stock `aem.js`. Converts each `.section-metadata` block into section classes (from a `style` row, comma-separated) and `dataset` attributes (any other row key), then removes the metadata block from the DOM.

`blocks/widget/widget.js` is the counterpart: it fetches `/widgets/<path>/<name>.{html,css,js}` at runtime and renames its own/wrapper/container classes to the widget's name — this is how `/widgets/...` links become live-loaded HTML+CSS+JS fragments, distinct from the standard `fragment` block (which inlines authored AEM content instead).

## Styling

`styles/brand.css` holds brand design tokens (colors, fonts, sizing) and is `@import`ed at the top of `styles/styles.css`, which layers structural/layout CSS on top. Prefer adding new design tokens to `brand.css` over `styles.css`.
